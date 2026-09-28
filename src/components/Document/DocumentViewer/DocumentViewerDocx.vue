<script setup>
import { computed, onBeforeUnmount, ref, shallowRef, toRef, useTemplateRef, watch } from 'vue'
import { renderAsync } from 'docx-preview'
import { useI18n } from 'vue-i18n'

import { useDocumentLocalSearch } from '@/composables/useDocumentLocalSearch'
import { useDocumentSource } from '@/composables/useDocumentSource'
import { useToast } from '@/composables/useToast'
import { addSearchMarksClassesInHtml } from '@/utils/strings'
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

const { fetchSource } = useDocumentSource()
const { toast } = useToast()
const { t } = useI18n()

const container = useTemplateRef('container')
const toolbox = useTemplateRef('toolbox')
const toolboxHeight = computed(() => toolbox.value?.height ?? 0)

const sections = shallowRef([])
const originalHtml = shallowRef([])
const error = ref(null)
const currentPage = ref(1)
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

async function render() {
  error.value = null
  try {
    const blob = await fetchSource(props.document, { responseType: 'blob' })
    await renderAsync(blob, container.value, null, { ignoreLastRenderedPageBreak: false, inWrapper: true })
  }
  catch (reason) {
    error.value = reason?.message || t('document.notAvailable')
    toast.error(error.value)
    return
  }
  sections.value = [...container.value.querySelectorAll('section.docx')]
  originalHtml.value = sections.value.map(({ innerHTML }) => innerHTML)
  currentPage.value = 1
  observeSections()
  // The sections the matches point at are gone, so the term on screen has to be searched again.
  await refresh()
}

// Marking replaces a section's html, so the marks of the previous term would
// otherwise be marked again by the next one.
function findMatches(value) {
  const marks = [{ term: value }]
  return sections.value.flatMap((section, index) => {
    section.innerHTML = addSearchMarksClassesInHtml(originalHtml.value[index], marks)
    const count = section.querySelectorAll('mark.local-search-term').length
    return Array.from({ length: count }, () => ({ page: index + 1 }))
  })
}

function restoreOriginalHtml() {
  sections.value.forEach((section, index) => {
    section.innerHTML = originalHtml.value[index]
  })
}

function scrollToPage(value) {
  currentPage.value = value
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
  const rootMargin = `${-(Math.round(toolboxHeight.value) + BELOW_TOOLBOX_OFFSET)}px 0px 0px 0px`
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
    if (sectionsBelowToolbox.size) {
      currentPage.value = Math.min(...sectionsBelowToolbox) + 1
    }
  }, { rootMargin })
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
watch(activePage, (value) => {
  if (value) {
    currentPage.value = value
  }
})
watch(toolboxHeight, () => sections.value.length && observeSections())
watch(toRef(props, 'document'), render, { immediate: true, flush: 'post' })

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
      :compact-threshold="compactThreshold"
    />
    <div
      v-if="error"
      class="document-viewer-docx__error text-center p-3"
    >
      {{ error }}
    </div>
    <div
      v-show="!error"
      ref="container"
      class="document-viewer-docx__container"
    />
  </div>
</template>

<style lang="scss" scoped>
.document-viewer-docx {
  width: 100%;

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
