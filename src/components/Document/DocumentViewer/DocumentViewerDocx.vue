<script setup>
import { computed, onBeforeUnmount, ref, shallowRef, toRef, useTemplateRef, watch } from 'vue'
import { renderAsync } from 'docx-preview'
import { useI18n } from 'vue-i18n'

import { useDocumentLocalSearch } from '@/composables/useDocumentLocalSearch'
import { useDocumentBlur } from '@/composables/useDocumentBlur'
import { useDocumentSource } from '@/composables/useDocumentSource'
import { usePageTracking } from '@/composables/usePageTracking'
import { useToolboxOffset } from '@/composables/useToolboxOffset'
import { useToast } from '@/composables/useToast'
import { addSearchMarksClassesInHtml, foldWithSourceIndexes } from '@/utils/strings'
import { belowToolboxMargin } from '@/utils/toolboxMargin'
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
// `ignoreLastRenderedPageBreak` defaults to true, which silently collapses the
// page count to 1: the sections the paginator and the marks are keyed by are
// exactly the page breaks Word wrote.
const RENDER_OPTIONS = { ignoreLastRenderedPageBreak: false, inWrapper: true }

const { fetchSource } = useDocumentSource()
const { toast } = useToast()
const { t } = useI18n()

const container = useTemplateRef('container')
const toolbox = useTemplateRef('toolbox')
const { toolboxHeight, toolboxStyle } = useToolboxOffset(toolbox)

const sections = shallowRef([])
const originalHtml = shallowRef([])
const foldedText = shallowRef([])
const markedSections = new Set()
const error = ref(null)
const currentDocument = toRef(props, 'document')
const { blurred, blurredContent } = useDocumentBlur(currentDocument)

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

const { page, trackPage, holdPageTracking, reset: resetPageTracking } = usePageTracking({
  getPageElement: value => sections.value[value - 1]
})

const rootMargin = computed(() => belowToolboxMargin(toolboxHeight.value))

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

async function adoptRenderedSections() {
  collectSections()
  resetPageTracking(1)
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
  observer = new IntersectionObserver((entries) => {
    for (const { target, isIntersecting } of entries) {
      const index = sections.value.indexOf(target)
      if (index >= 0) {
        trackPage(index + 1, isIntersecting)
      }
    }
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
    holdPageTracking(value, { jump: true })
  }
})
function reactivateMark() {
  if (activePage.value) {
    holdPageTracking(activePage.value, { jump: true })
  }
  activateMark()
}
watch(rootMargin, () => {
  if (sections.value.length) {
    observeSections()
  }
})
watch(currentDocument, render, { immediate: true, flush: 'post' })

onBeforeUnmount(() => observer?.disconnect())

defineExpose({ findMatches, render, sections, totalPages, error })
</script>

<template>
  <div
    class="document-viewer-docx"
    :style="toolboxStyle"
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
      @reactivate="reactivateMark"
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
    scroll-margin-top: var(--document-toolbox-height, 0px);
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
