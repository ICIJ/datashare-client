<script setup>
import VueScrollTo from 'vue-scrollto'
import { computed, ref, useTemplateRef, toRef } from 'vue'
import { refDebounced, whenever, useElementBounding } from '@vueuse/core'
import { supportsPDFs as embeddable } from 'pdfobject'
import { useI18n } from 'vue-i18n'

import DocumentViewerPdfEmbedded from './DocumentViewerPdf/DocumentViewerPdfEmbedded'
import DocumentViewerPdfPagination from './DocumentViewerPdf/DocumentViewerPdfPagination'
import DocumentViewerPdfDropdown from './DocumentViewerPdf/DocumentViewerPdfDropdown/DocumentViewerPdfDropdown'
import DocumentViewerPdfPage from './DocumentViewerPdf/DocumentViewerPdfPage'

import { SCALE_FIT, SCALE_WIDTH } from '@/enums/documentViewerPdf'
import { useCompact } from '@/composables/useCompact'
import { useWait } from '@/composables/useWait'
import { useScrollParent } from '@/composables/useScrollParent'
import { usePDF } from '@/composables/usePDF'
import { useDocumentViewStore } from '@/store/modules/documentView'
import AppWait from '@/components/AppWait/AppWait'
import ButtonIcon from '@/components/Button/ButtonIcon'
import DocumentLocalSearch from '@/components/Document/DocumentLocalSearch/DocumentLocalSearch'
import DocumentGlobalSearchTerms from '@/components/Document/DocumentGlobalSearchTerms/DocumentGlobalSearchTerms'

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

const documentViewStore = useDocumentViewStore()
const scrollParent = useScrollParent()
const src = computed(() => (documentViewStore.embeddedPdf ? null : props.document.fullUrl))
const { pdf, numPages, sizes, findHighlights, loaderId: pdfLoaderId } = usePDF(src)
const { waitFor, isLoading } = useWait()
const { t } = useI18n()

const currentPage = ref(1)
const rotation = documentViewStore.computedDocumentRotation(props.document)
const scale = ref(SCALE_FIT)
const pageElements = useTemplateRef('pages')
const toolboxElement = useTemplateRef('toolbox')
const { height: toolboxHeight } = useElementBounding(toolboxElement)
const { compact: toolboxCompact } = useCompact(toolboxElement, { threshold: toRef(props, 'compactThreshold') })
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
  <document-viewer-pdf-embedded
    v-if="documentViewStore.embeddedPdf"
    v-model="documentViewStore.embeddedPdf"
    :document="document"
  />
  <div v-else class="document-viewer-pdf" :class="classList">
    <div ref="toolbox" class="document-viewer-pdf__toolbox d-flex flex-column gap-3">
      <div class="d-flex flex-md-nowrap flex-wrap align-items-lg-center gap-3">
        <document-local-search
          v-model="highlightText"
          v-model:active-index="highlightIndex"
          :compact="toolboxCompact"
          :loading="isHightlightLoading"
          :occurrences="highlightOccurrences"
          class="flex-grow-1"
        />
        <div class="d-flex flex-grow-1 flex-md-grow-0 flex-nowrap align-items-center gap-2">
          <document-viewer-pdf-pagination
            :page="currentPage"
            :total-rows="numPages"
            :compact="toolboxCompact"
            @update:page="scrollToPage"
          />
          <document-viewer-pdf-dropdown
            v-model:rotation="rotation"
            v-model:scale="scale"
            v-model:embed="documentViewStore.embeddedPdf"
            class="flex-shrink-0 ms-auto"
          />
        </div>
      </div>
      <document-global-search-terms :document="document" no-count @select="highlightText = $event" />
    </div>
    <app-wait class="document-viewer-pdf__pages pt-3" :for="pdfLoaderId" spinner>
      <template v-if="pdf">
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
      </template>
      <template v-else>
        <div class="text-center fw-medium">
          <p>{{ t('documentViewerPdf.error') }}</p>
          <button-icon
            v-if="embeddable"
            :label="t('documentViewerPdf.switch')"
            :icon-left="PhFilePdf"
            @click="documentViewStore.embeddedPdf = true"
          />
        </div>
      </template>
    </app-wait>
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
