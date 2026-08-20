<script setup>
import { computed, ref, useTemplateRef, toRef, watch } from 'vue'
import { refDebounced, whenever, useDebounceFn, useElementBounding, useEventListener } from '@vueuse/core'
import { supportsPDFs as embeddable } from 'pdfobject'
import { useI18n } from 'vue-i18n'

import DocumentViewerPdfEmbedded from './DocumentViewerPdf/DocumentViewerPdfEmbedded'
import DocumentViewerPdfPagination from './DocumentViewerPdf/DocumentViewerPdfPagination'
import DocumentViewerPdfDropdown from './DocumentViewerPdf/DocumentViewerPdfDropdown/DocumentViewerPdfDropdown'
import DocumentViewerPdfPage from './DocumentViewerPdf/DocumentViewerPdfPage'

import { SCALE_FIT, SCALE_WIDTH } from '@/enums/documentViewerPdf'
import { useCompact } from '@/composables/useCompact'
import { useDocumentPreview } from '@/composables/useDocumentPreview'
import { useWait } from '@/composables/useWait'
import { usePDF } from '@/composables/usePDF'
import { useDocumentViewStore } from '@/store/modules/documentView'
import AppWait from '@/components/AppWait/AppWait'
import ButtonIcon from '@/components/Button/ButtonIcon'
import DismissableContentWarningToggler from '@/components/Dismissable/DismissableContentWarningToggler'
import DocumentLocalSearch from '@/components/Document/DocumentLocalSearch/DocumentLocalSearch'
import DocumentGlobalSearchTerms from '@/components/Document/DocumentGlobalSearchTerms/DocumentGlobalSearchTerms'

import IPhFilePdf from '~icons/ph/file-pdf'

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

const SCROLL_IDLE_DELAY = 200

const documentViewStore = useDocumentViewStore()
const src = computed(() => (documentViewStore.embeddedPdf ? null : props.document.fullUrl))
const { pdf, numPages, sizes, findHighlights, loaderId: pdfLoaderId } = usePDF(src)
const { waitFor, isLoading } = useWait()
const { t } = useI18n()
const { isBlurred, getBlurredContentBanner } = useDocumentPreview()

const currentPage = ref(1)
const pendingPage = ref(null)
const realignPendingPage = ref(false)
const rotation = documentViewStore.computedDocumentRotation(props.document)
const scale = ref(SCALE_FIT)
const blurred = ref(null)
const blurredContent = ref(null)
const pageElements = useTemplateRef('pages')
const toolboxElement = useTemplateRef('toolbox')
const { height: toolboxHeight } = useElementBounding(toolboxElement)
const { compact: toolboxCompact } = useCompact(toolboxElement, { threshold: toRef(props, 'compactThreshold') })
const highlightText = ref(null)
const highlightTextDebounced = refDebounced(highlightText, 300)
const highlightIndex = ref(0)
const highlightMatches = ref([])
const highlightOccurrences = computed(() => highlightMatches.value.length)
const highlightPage = computed(() => highlightMatches.value[highlightIndex.value - 1]?.page)
const isHighlightDebouncing = computed(() => highlightTextDebounced.value !== highlightText.value)
const isHighlightLoading = computed(() => isLoading.value || isHighlightDebouncing.value)

const pageScale = computed(() => (isNaN(scale.value) ? 1 : Number(scale.value)))
const pageFitParent = computed(() => scale.value === SCALE_FIT || scale.value === SCALE_WIDTH)

const style = computed(() => {
  return {
    '--document-viewer-pdf-toolbox-height': `${toolboxHeight.value}px`
  }
})

const classList = computed(() => {
  return {
    'document-viewer-pdf--scale-fit': scale.value === SCALE_FIT,
    'document-viewer-pdf--scale-width': scale.value === SCALE_WIDTH
  }
})

const settleScroll = useDebounceFn(() => {
  if (pendingPage.value === null) {
    return
  }
  // Pages render lazily while a smooth scroll runs and each resizes by a fraction of a pixel, which
  // is enough for a page pick to land short of its target. Highlights are centered by the page.
  if (realignPendingPage.value) {
    scrollPageIntoView(pendingPage.value, 'instant')
  }
  currentPage.value = pendingPage.value
  pendingPage.value = null
}, SCROLL_IDLE_DELAY)

useEventListener(window, 'scroll', settleScroll, { capture: true, passive: true })
// Scrolling by hand gives up on the pending page and hands tracking straight back to the viewport.
useEventListener(window, ['wheel', 'touchmove'], () => (pendingPage.value = null), { passive: true })

/**
 * Holds the page tracking until the scroll we are about to start has settled, so the indicator
 * stays on the page we are heading to instead of counting every page the scroll flies past.
 *
 * @param {number} value - The page that scroll is heading to.
 * @param {boolean} realign - Whether that page must be aligned again once the scroll has settled.
 */
function holdPageTracking(value, realign = false) {
  pendingPage.value = value
  realignPendingPage.value = realign
  settleScroll()
}

/**
 * Tracks the page currently under the toolbox, unless one of our own scrolls is in flight.
 *
 * @param {number} value - The page reporting itself as current.
 */
function trackPage(value) {
  if (pendingPage.value === null) {
    currentPage.value = value
  }
}

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

/**
 * Aligns the given page with the top of the viewport, under the sticky toolbox.
 *
 * @param {number} value - The page number to scroll to.
 * @param {string} behavior - Defaults to the CSS scroll-behavior, which Bootstrap
 *   already turns into an instant jump under prefers-reduced-motion.
 * @returns {boolean} - Whether the page is rendered and was scrolled to.
 */
function scrollPageIntoView(value, behavior = 'auto') {
  const target = pageElements.value[value - 1]?.$el
  target?.scrollIntoView({ behavior, block: 'start' })
  return !!target
}

/**
 * Scrolls to the specified page in the PDF viewer.
 *
 * @param {number} value - The page number to scroll to.
 */
function scrollToPage(value) {
  // Scroll only the target exist
  if (scrollPageIntoView(value)) {
    holdPageTracking(value, true)
    // Update the page model to reflect the current page
    currentPage.value = value
  }
}

whenever(highlightTextDebounced, waitFor(async (value) => {
  highlightMatches.value = await findHighlights(value)
  highlightIndex.value = highlightMatches.value.length ? 1 : 0
}))

// Picking another occurrence makes the matching page scroll its highlight into view.
watch(highlightIndex, () => {
  if (highlightPage.value) {
    holdPageTracking(highlightPage.value)
  }
})

watch(src, async () => {
  blurred.value ??= await isBlurred(props.document)
  if (blurred.value) {
    blurredContent.value = await getBlurredContentBanner(props.document)
  }
}, { immediate: true })
</script>

<template>
  <document-viewer-pdf-embedded
    v-if="documentViewStore.embeddedPdf"
    v-model="documentViewStore.embeddedPdf"
    v-model:blurred="blurred"
    :document="document"
  />
  <div
    v-else
    class="document-viewer-pdf"
    :class="classList"
    :style="style"
  >
    <div
      ref="toolbox"
      class="document-viewer-pdf__toolbox d-flex flex-column gap-3"
    >
      <div class="d-flex flex-md-nowrap flex-wrap align-items-lg-center gap-3">
        <document-local-search
          v-model="highlightText"
          v-model:active-index="highlightIndex"
          :compact="toolboxCompact"
          :loading="isHighlightLoading"
          :occurrences="highlightOccurrences"
          class="flex-grow-1"
        />
        <fieldset
          :disabled="blurred"
          class="d-flex flex-grow-1 flex-md-grow-0 flex-nowrap align-items-center gap-2"
        >
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
        </fieldset>
      </div>
      <document-global-search-terms
        :document="document"
        no-count
        @select="highlightText = $event"
      />
    </div>
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
          :top-offset="toolboxHeight"
          @visible="trackPage(page)"
        />
      </template>
      <template v-else>
        <div class="text-center fw-medium">
          <p>{{ t('documentViewerPdf.error') }}</p>
          <button-icon
            v-if="embeddable"
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
      scroll-margin-top: var(--document-viewer-pdf-toolbox-height, 0px);
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
