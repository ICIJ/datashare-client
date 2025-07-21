<script setup>
import VueScrollTo from 'vue-scrollto'
import { computed, ref, useTemplateRef } from 'vue'
import { refDebounced, whenever, useElementBounding } from '@vueuse/core'

import DocumentViewerPdfNav from './DocumentViewerPdf/DocumentViewerPdfNav'
import DocumentViewerPdfPage from './DocumentViewerPdf/DocumentViewerPdfPage'

import { SCALE_FIT, SCALE_WIDTH } from '@/enums/documentViewerPdf'
import { useWait } from '@/composables/useWait'
import { useScrollParent } from '@/composables/useScrollParent'
import { usePDF } from '@/composables/usePDF'
import DocumentLocalSearch from '@/components/Document/DocumentLocalSearch/DocumentLocalSearch'
import DocumentGlobalSearchTerms from '@/components/Document/DocumentGlobalSearchTerms/DocumentGlobalSearchTerms'

const props = defineProps({
  document: {
    type: Object,
    required: true
  }
})

const { pdf, numPages, sizes, findHighlights } = usePDF(props.document.fullUrl)
const { waitFor, isLoading } = useWait()
const scrollParent = useScrollParent()

const currentPage = ref(1)
const rotation = ref(0)
const scale = ref(SCALE_FIT)
const pageElements = useTemplateRef('pages')
const toolboxElement = useTemplateRef('toolbox')
const { height: toolboxHeight } = useElementBounding(toolboxElement)
const highlightText = ref(null)
const highlightTextDebounced = refDebounced(highlightText, 300)
const highlightIndex = ref(0)
const highlightMatches = ref([])
const highlightOccurrences = computed(() => highlightMatches.value.length)
const isHighlightDebouncing = computed(() => highlightTextDebounced.value !== highlightText.value)
const isHightlightLoading = computed(() => isLoading.value || isHighlightDebouncing.value)

const pageScale = computed(() => (isNaN(scale.value) ? 1 : Number(scale.value)))
const pageFitParent = computed(() => scale.value === SCALE_FIT || scale.value === SCALE_WIDTH)

const classList = computed(() => {
  return {
    'document-viewer-pdf--scale-fit': scale.value === SCALE_FIT,
    'document-viewer-pdf--scale-width': scale.value === SCALE_WIDTH
  }
})

/**
 * Gets the highlight index for a specific page.
 *
 * @param {number} value - The page number to get the highlight index for.
 * @returns {number} - The index of the highlight match on the page, or 0 if no matches.
 */
function getPageHighlightIndex(value) {
  const match = highlightMatches.value[highlightIndex.value - 1]
  const firstPageMatch = highlightMatches.value.findIndex((m) => m.page === value)
  return match && match.page === value ? highlightIndex.value - firstPageMatch : 0
}

/**
 * Scrolls to the specified page in the PDF viewer.
 *
 * @param {number} value - The page number to scroll to.
 */
function scrollToPage(value) {
  const target = pageElements.value[value - 1]?.$el
  // Scroll only the target exist
  if (target) {
    const offset = -toolboxHeight.value
    const container = scrollParent.value
    VueScrollTo.scrollTo(target, 0, { container, offset })
    // Update the page model to reflect the current page
    currentPage.value = value
  }
}

whenever(
  highlightTextDebounced,
  waitFor(async (value) => {
    highlightMatches.value = await findHighlights(value)
    highlightIndex.value = highlightMatches.value.length ? 1 : 0
  })
)
</script>

<template>
  <div class="document-viewer-pdf" :class="classList">
    <div ref="toolbox" class="document-viewer-pdf__toolbox d-flex flex-column gap-3">
      <div class="d-flex flex-column flex-lg-row align-items-lg-center gap-3">
        <document-local-search
          v-model="highlightText"
          v-model:active-index="highlightIndex"
          :loading="isHightlightLoading"
          :occurrences="highlightOccurrences"
          class="flex-grow-1"
        />
        <div class="d-flex align-items-center gap-3">
          <document-viewer-pdf-nav
            v-model:rotation="rotation"
            v-model:scale="scale"
            class="flex-shrink-0"
            :page="currentPage"
            :num-pages="numPages"
            @update:page="scrollToPage"
          />
        </div>
      </div>
      <document-global-search-terms :document="document" no-count @select="highlightText = $event" />
    </div>
    <div class="document-viewer-pdf__pages pt-3">
      <document-viewer-pdf-page
        v-for="{ page, ...size } in sizes"
        ref="pages"
        :key="page"
        class="document-viewer-pdf__pages__entry"
        :scale="pageScale"
        :rotation="rotation"
        :fit-parent="pageFitParent"
        :page="page"
        :size="size"
        :pdf="pdf"
        :highlight-text="highlightTextDebounced"
        :highlight-index="getPageHighlightIndex(page)"
        :scroll-offset="-toolboxHeight"
        @visible="currentPage = page"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.document-viewer-pdf {
  width: 100%;
  align-items: center;

  &__toolbox {
    position: sticky;
    top: 0;
    z-index: 10;
    padding: $spacer 0;
    background: var(--bs-body-bg);
  }

  &__pages {
    margin: auto;
    display: flex;
    flex-direction: column;
    gap: $spacer;
    align-items: center;
    overflow: auto;

    &__entry {
      display: block;
      flex-grow: 0;
      flex-shrink: 1;
      min-width: 0;
      width: auto;
    }
  }

  &--scale-fit &__pages,
  &--scale-width &__pages {
    width: 100%;

    &__entry {
      width: 100%;
    }
  }

  &--scale-fit &__pages {
    max-width: 1020px;
  }
}
</style>
