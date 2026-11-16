<script setup>
import { computed, ref, toRef, useTemplateRef, watch } from 'vue'
import { supportsPDFs as embeddable } from 'pdfobject'
import { useI18n } from 'vue-i18n'

import DocumentViewerPdfEmbedded from './DocumentViewerPdf/DocumentViewerPdfEmbedded'
import DocumentViewerPdfDropdown from './DocumentViewerPdf/DocumentViewerPdfDropdown/DocumentViewerPdfDropdown'
import DocumentViewerPdfPage from './DocumentViewerPdf/DocumentViewerPdfPage'

import { SCALE_FIT, SCALE_WIDTH } from '@/enums/documentViewerPdf'
import { useDocumentLocalSearch } from '@/composables/useDocumentLocalSearch'
import { useDocumentPreview } from '@/composables/useDocumentPreview'
import { useDocumentBlur } from '@/composables/useDocumentBlur'
import { usePageTracking } from '@/composables/usePageTracking'
import { useToolboxOffset } from '@/composables/useToolboxOffset'
import { usePDF } from '@/composables/usePDF'
import { useDocumentViewStore } from '@/store/modules/documentView'
import AppWait from '@/components/AppWait/AppWait'
import ButtonIcon from '@/components/Button/ButtonIcon'
import DismissableContentWarningToggler from '@/components/Dismissable/DismissableContentWarningToggler'
import DocumentToolbox from '@/components/Document/DocumentToolbox/DocumentToolbox'

import IPhFilePdf from '~icons/ph/file-pdf'

const props = defineProps({
  document: {
    type: Object,
    required: true
  },
  compactThreshold: {
    type: Number,
    default: 770
  },
  src: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['error'])

const documentViewStore = useDocumentViewStore()
const { sessionIdHeaderName, sessionIdHeaderValue } = useDocumentPreview()
// The preview host needs the session header, which an embedded iframe cannot send.
const isConverted = computed(() => !!props.src)
const canEmbed = computed(() => embeddable && !isConverted.value)
const embedded = computed(() => documentViewStore.embeddedPdf && !isConverted.value)
const viewerSrc = computed(() => props.src ?? props.document.fullUrl)
const pdfSrc = computed(() => (embedded.value ? null : viewerSrc.value))
const sessionHeaders = computed(() => ({ [sessionIdHeaderName.value]: sessionIdHeaderValue.value }))
const httpHeaders = computed(() => (isConverted.value ? sessionHeaders.value : null))
const { pdf, numPages, sizes, error, findHighlights, loaderId: pdfLoaderId } = usePDF(pdfSrc, { httpHeaders })
const { t } = useI18n()

const rotation = documentViewStore.computedDocumentRotation(props.document)
const scale = ref(SCALE_FIT)
const currentDocument = toRef(props, 'document')
const { blurred, blurredContent } = useDocumentBlur(currentDocument)
const pageElements = useTemplateRef('pages')
const toolboxElement = useTemplateRef('toolbox')
const { toolboxHeight, toolboxStyle } = useToolboxOffset(toolboxElement)
const { page, trackPage, holdPageTracking, reset: resetPageTracking } = usePageTracking({
  getPageElement: value => pageElements.value[value - 1]?.$el
})
const {
  term: highlightText,
  debouncedTerm: highlightTextDebounced,
  activeIndex: highlightIndex,
  matches: highlightMatches,
  occurrences: highlightOccurrences,
  activePage: highlightPage,
  isLoading: isHighlightLoading,
  refresh: refreshHighlights
} = useDocumentLocalSearch({ findMatches: term => findHighlights(term) })

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
  const firstPageMatch = highlightMatches.value.findIndex(m => m.page === value)
  return highlightPage.value === value ? highlightIndex.value - firstPageMatch : 0
}

// Picking another occurrence makes the matching page scroll its highlight into view.
watch(highlightIndex, () => {
  if (highlightPage.value) {
    holdPageTracking(highlightPage.value)
  }
})

function reactivateHighlight() {
  if (highlightPage.value) {
    holdPageTracking(highlightPage.value)
    pageElements.value[highlightPage.value - 1]?.applyHighlight()
  }
}

// A new document swaps every page out without them reporting they stopped showing, and a hold left
// over from the previous one would settle against pages that are not there anymore. The matches
// point at the pages of that previous document too, so the term on screen has to be searched again.
watch(pdf, () => {
  resetPageTracking()
  refreshHighlights()
})

watch(error, (value) => {
  if (value) {
    emit('error', value)
  }
})
</script>

<template>
  <document-viewer-pdf-embedded
    v-if="embedded"
    v-model="documentViewStore.embeddedPdf"
    v-model:blurred="blurred"
    :document="document"
  />
  <div
    v-else
    class="document-viewer-pdf"
    :class="classList"
    :style="toolboxStyle"
  >
    <document-toolbox
      ref="toolbox"
      v-model="highlightText"
      v-model:active-index="highlightIndex"
      v-model:page="page"
      :document="document"
      :occurrences="highlightOccurrences"
      :total-pages="numPages"
      :loading="isHighlightLoading"
      :disabled="blurred"
      :compact-threshold="compactThreshold"
      no-count
      @reactivate="reactivateHighlight"
    >
      <template #dropdown>
        <document-viewer-pdf-dropdown
          v-model:rotation="rotation"
          v-model:scale="scale"
          v-model:embed="documentViewStore.embeddedPdf"
          :no-embed="isConverted"
          class="flex-shrink-0 ms-auto"
        />
      </template>
    </document-toolbox>
    <dismissable-content-warning-toggler
      v-if="blurred"
      v-model="blurred"
      :description="blurredContent"
    />
    <app-wait
      v-else
      :for="pdfLoaderId"
      spinner
    >
      <template v-if="pdf">
        <document-viewer-pdf-page
          v-for="{ page: pageNumber, ...size } in sizes"
          ref="pages"
          :key="pageNumber"
          class="document-viewer-pdf__pages__entry"
          :scale="pageScale"
          :rotation="rotation"
          :fit-parent="pageFitParent"
          :page="pageNumber"
          :size="size"
          :pdf="pdf"
          :highlight-text="highlightTextDebounced"
          :highlight-index="getPageHighlightIndex(pageNumber)"
          :top-offset="toolboxHeight"
          @visible="trackPage(pageNumber, $event)"
        />
      </template>
      <template v-else>
        <div class="text-center fw-medium">
          <p>{{ t('documentViewerPdf.error') }}</p>
          <button-icon
            v-if="canEmbed"
            :label="t('documentViewerPdf.switch')"
            :icon-left="IPhFilePdf"
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
      scroll-margin-top: var(--document-toolbox-height, 0px);
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
