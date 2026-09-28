<script setup>
import { computed, onBeforeUnmount, ref, shallowRef, toRef, useTemplateRef, watch } from 'vue'
import { useDebounceFn, useEventListener } from '@vueuse/core'
import { renderAsync } from 'docx-preview'
import { useI18n } from 'vue-i18n'

import { useDocumentLocalSearch } from '@/composables/useDocumentLocalSearch'
import { useDocumentPreview } from '@/composables/useDocumentPreview'
import { useDocumentSource } from '@/composables/useDocumentSource'
import { useToast } from '@/composables/useToast'
import { addSearchMarksClassesInHtml, foldWithSourceIndexes } from '@/utils/strings'
import DismissableContentWarningToggler from '@/components/Dismissable/DismissableContentWarningToggler'
import DocumentToolbox from '@/components/Document/DocumentToolbox/DocumentToolbox'

const props = defineProps({
  document: {
    type: Object,
    required: true
  },
  compactThreshold: {
    type: Number,
    default: 770
  }
})

const ACTIVE_CLASS = 'local-search-term--active'
// A section whose top edge sits exactly on the toolbox edge rounds either way between the
// observer's root and the element box, so it would flicker between two pages.
const BELOW_TOOLBOX_OFFSET = 4
const SCROLL_IDLE_DELAY = 200
// `ignoreLastRenderedPageBreak` defaults to true, which silently collapses the
// page count to 1: the sections the paginator and the marks are keyed by are
// exactly the page breaks Word wrote.
const RENDER_OPTIONS = { ignoreLastRenderedPageBreak: false, inWrapper: true }

const { fetchSource } = useDocumentSource()
const { isBlurred, getBlurredContentBanner } = useDocumentPreview()
const { toast } = useToast()
const { t } = useI18n()

const container = useTemplateRef('container')
const toolbox = useTemplateRef('toolbox')
const toolboxHeight = computed(() => toolbox.value?.height ?? 0)

const sections = shallowRef([])
const originalHtml = shallowRef([])
const foldedText = shallowRef([])
const markedSections = new Set()
const error = ref(null)
const blurred = ref(false)
const blurredContent = ref(null)
const currentPage = ref(1)
const pendingPage = ref(null)
const sectionsBelowToolbox = new Set()

const totalPages = computed(() => Math.max(sections.value.length, 1))

const {
  term,
  activeIndex,
  matches,
  occurrences,
  activePage,
  isLoading,
  refresh
} = useDocumentLocalSearch({ findMatches })

const page = computed({
  get: () => currentPage.value,
  set: scrollToPage
})

const style = computed(() => ({ '--document-viewer-docx-toolbox-height': `${toolboxHeight.value}px` }))

// Rounded here rather than where the observer reads it, so a sub-pixel drift in
// the toolbox height does not rebuild the observer for an identical margin.
const rootMargin = computed(() => `${-(Math.round(toolboxHeight.value) + BELOW_TOOLBOX_OFFSET)}px 0px 0px 0px`)

let lastRender = 0

function failRender(message) {
  // The sections left in the container are the previous document's: still
  // observed, they would report pages this render no longer knows about.
  observer?.disconnect()
  error.value = message
  sections.value = []
  markedSections.clear()
  toast.error(message)
}

// A document swapped in while this one was loading owns the container now, so
// neither this render's markup nor its failure may be written over the one on screen.
function isCurrentRender(id) {
  return id === lastRender
}

async function fetchDocx(id) {
  try {
    const blob = await fetchSource(props.document, { responseType: 'blob' })
    return isCurrentRender(id) ? blob : null
  }
  catch (reason) {
    if (isCurrentRender(id)) {
      failRender(reason.message)
    }
    return null
  }
}

// A library rejection carries its own English internals (jszip's "is this a zip
// file ?"), unlike the source errors, which are already localized.
async function paintDocx(id, blob) {
  try {
    await renderAsync(blob, container.value, null, RENDER_OPTIONS)
    return isCurrentRender(id)
  }
  catch {
    if (isCurrentRender(id)) {
      failRender(t('document.notAvailable'))
    }
    return false
  }
}

function collectSections() {
  sections.value = [...container.value.querySelectorAll('section.docx')]
  originalHtml.value = sections.value.map(({ innerHTML }) => innerHTML)
  foldedText.value = sections.value.map(({ textContent }) => foldWithSourceIndexes(textContent).folded)
  markedSections.clear()
}

function resetPage() {
  currentPage.value = 1
  pendingPage.value = null
}

async function adoptRenderedSections() {
  collectSections()
  resetPage()
  observeSections()
  // The sections the matches point at are gone, so the term on screen has to be searched again.
  await refresh()
}

async function render() {
  const id = ++lastRender
  error.value = null
  const blob = await fetchDocx(id)
  if (!blob) {
    return
  }
  const painted = await paintDocx(id, blob)
  if (painted) {
    await adoptRenderedSections()
  }
}

// Marking replaces a section's html, so the marks of the previous term would
// otherwise be marked again by the next one.
function findMatches(value) {
  const marks = [{ term: value }]
  const { folded } = foldWithSourceIndexes(value.trim())
  return sections.value.flatMap((section, index) => {
    // Marking reparses and rebuilds a whole section, so a section that cannot
    // hold the term is only touched to take the previous term's marks back off.
    if (!foldedText.value[index].includes(folded) && !markedSections.delete(index)) {
      return []
    }
    section.innerHTML = addSearchMarksClassesInHtml(originalHtml.value[index], marks)
    const count = section.querySelectorAll('mark.local-search-term').length
    if (count) {
      markedSections.add(index)
    }
    return Array.from({ length: count }, () => ({ page: index + 1 }))
  })
}

function restoreOriginalHtml() {
  sections.value.forEach((section, index) => {
    section.innerHTML = originalHtml.value[index]
  })
  markedSections.clear()
}

// Holds the page tracking until the scroll we are about to start has settled, so
// the indicator stays on the page we are heading to instead of counting every
// section the scroll flies past.
function holdPageTracking(value) {
  pendingPage.value = value
  currentPage.value = value
  settleScroll()
}

const settleScroll = useDebounceFn(() => {
  pendingPage.value = null
  trackPage()
}, SCROLL_IDLE_DELAY)

function trackPage() {
  if (pendingPage.value === null && sectionsBelowToolbox.size) {
    currentPage.value = Math.min(...sectionsBelowToolbox) + 1
  }
}

function scrollToPage(value) {
  holdPageTracking(value)
  sections.value[value - 1]?.scrollIntoView({ block: 'start' })
}

function activateMark() {
  const marks = [...container.value.querySelectorAll('mark.local-search-term')]
  const active = marks[activeIndex.value - 1]
  marks.forEach(mark => mark.classList.toggle(ACTIVE_CLASS, mark === active))
  active?.scrollIntoView({ block: 'center' })
}

let observer = null

// The section under the toolbox is the topmost one still showing once the root
// is shrunk by the toolbox height, the same rule the PDF pages follow.
function observeSections() {
  observer?.disconnect()
  sectionsBelowToolbox.clear()
  observer = new IntersectionObserver((entries) => {
    for (const { target, isIntersecting } of entries) {
      const index = sections.value.indexOf(target)
      if (isIntersecting) {
        sectionsBelowToolbox.add(index)
      }
      else {
        sectionsBelowToolbox.delete(index)
      }
    }
    trackPage()
  }, { rootMargin: rootMargin.value })
  sections.value.forEach(section => observer.observe(section))
}

// A new term replaces the marks of the previous one without moving `activeIndex`, so the active
// occurrence has to be picked again whenever either the match list or the index changes.
watch([matches, activeIndex], activateMark)
// The composable does not search an empty term, so nothing else would take the marks down.
watch(term, (value) => {
  if (!value.trim()) {
    restoreOriginalHtml()
  }
})
// Picking an occurrence scrolls its mark into view, so the page it sits on has
// to be held the same way a page pick is.
watch(activePage, (value) => {
  if (value) {
    holdPageTracking(value)
  }
})
watch(rootMargin, () => {
  if (sections.value.length) {
    observeSections()
  }
})
useEventListener(window, 'scroll', settleScroll, { capture: true, passive: true })
watch(toRef(props, 'document'), render, { immediate: true, flush: 'post' })
watch(toRef(props, 'document'), async (document) => {
  blurred.value = await isBlurred(document)
  blurredContent.value = blurred.value ? await getBlurredContentBanner(document) : null
}, { immediate: true })

onBeforeUnmount(() => observer?.disconnect())

defineExpose({ findMatches, render, sections, totalPages, error })
</script>

<template>
  <div
    class="document-viewer-docx"
    :style="style"
  >
    <document-toolbox
      ref="toolbox"
      v-model="term"
      v-model:active-index="activeIndex"
      v-model:page="page"
      :document="document"
      :occurrences="occurrences"
      :total-pages="totalPages"
      :loading="isLoading"
      :disabled="blurred"
      :compact-threshold="compactThreshold"
      no-count
    />
    <dismissable-content-warning-toggler
      v-if="blurred"
      v-model="blurred"
      :description="blurredContent"
    />
    <div
      v-else-if="error"
      class="document-viewer-docx__error text-center p-3"
    >
      {{ error }}
    </div>
    <div
      v-show="!blurred && !error"
      ref="container"
      class="document-viewer-docx__container"
    />
  </div>
</template>

<style lang="scss" scoped>
.document-viewer-docx {
  width: 100%;

  &__container:deep(.docx-wrapper) {
    background: transparent;
    padding: 0;
  }

  &__container:deep(.docx-wrapper > section.docx) {
    max-width: 100%;
    border: $border-width solid var(--bs-border-color);
    box-shadow: $box-shadow-sm;
  }

  &__container:deep(section.docx) {
    scroll-margin-top: var(--document-viewer-docx-toolbox-height, 0px);
  }

  &__container:deep(.local-search-term) {
    background: $mark-bg;
    color: black;
    padding: 0;
  }

  &__container:deep(.local-search-term--active) {
    background: #38d878;
    color: white;
  }
}
</style>
