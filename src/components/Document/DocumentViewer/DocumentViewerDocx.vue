<script setup>
import { computed, toRef, useTemplateRef } from 'vue'

import { useDocumentBlur } from '@/composables/useDocumentBlur'
import { useDocxRender } from '@/composables/useDocxRender'
import { useMarkedSections } from '@/composables/useMarkedSections'
import { useSectionLocalSearch } from '@/composables/useSectionLocalSearch'
import { useSectionPageTracking } from '@/composables/useSectionPageTracking'
import { useToolboxOffset } from '@/composables/useToolboxOffset'
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

const container = useTemplateRef('container')
const toolbox = useTemplateRef('toolbox')
const { toolboxHeight, toolboxStyle } = useToolboxOffset(toolbox)

const currentDocument = toRef(props, 'document')
const { blurred, blurredContent } = useDocumentBlur(currentDocument)

const {
  sections,
  collectSections,
  clearSections,
  findMatches,
  restoreOriginalHtml
} = useMarkedSections(container, 'section.docx')
const totalPages = computed(() => Math.max(sections.value.length, 1))

const { page, holdPageTracking, resetPageTracking } = useSectionPageTracking(sections, toolboxHeight)

const {
  term,
  activeIndex,
  occurrences,
  isLoading,
  refresh,
  reactivateMark
} = useSectionLocalSearch({ container, findMatches, restoreOriginalHtml, holdPageTracking })

async function adoptRenderedSections() {
  collectSections()
  resetPageTracking(1)
  // The sections the matches point at are gone, so the term on screen has to be searched again.
  await refresh()
}

// A term searched behind the warning marked the sections, and the split pages save their html as it is.
const { error, render } = useDocxRender(
  { document: currentDocument, container, blurred },
  { onRendered: adoptRenderedSections, onFailed: clearSections, onBeforePaginate: restoreOriginalHtml }
)

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
