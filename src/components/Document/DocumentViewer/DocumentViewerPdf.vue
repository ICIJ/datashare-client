<script setup>
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useDebounceFn, useEventListener } from '@vueuse/core'
import { supportsPDFs as embeddable } from 'pdfobject'
import { useI18n } from 'vue-i18n'

import DocumentViewerPdfEmbedded from './DocumentViewerPdf/DocumentViewerPdfEmbedded'
import DocumentViewerPdfDropdown from './DocumentViewerPdf/DocumentViewerPdfDropdown/DocumentViewerPdfDropdown'
import DocumentViewerPdfPage from './DocumentViewerPdf/DocumentViewerPdfPage'

import { SCALE_FIT, SCALE_WIDTH } from '@/enums/documentViewerPdf'
import { useDocumentLocalSearch } from '@/composables/useDocumentLocalSearch'
import { useDocumentPreview } from '@/composables/useDocumentPreview'
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
  }
})

const SCROLL_IDLE_DELAY = 200
const SCROLL_KEYS = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']
const FORM_CONTROLS = 'input, textarea, select, [contenteditable]'

const documentViewStore = useDocumentViewStore()
const src = computed(() => (documentViewStore.embeddedPdf ? null : props.document.fullUrl))
const { pdf, numPages, sizes, findHighlights, loaderId: pdfLoaderId } = usePDF(src)
const { t } = useI18n()
const { isBlurred, getBlurredContentBanner } = useDocumentPreview()

const currentPage = ref(1)
const pendingPage = ref(null)
const realignPendingPage = ref(false)
const pagesBelowToolbox = new Set()
const rotation = documentViewStore.computedDocumentRotation(props.document)
const scale = ref(SCALE_FIT)
const blurred = ref(null)
const blurredContent = ref(null)
const pageElements = useTemplateRef('pages')
const toolboxElement = useTemplateRef('toolbox')
const toolboxHeight = computed(() => toolboxElement.value?.height ?? 0)
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

/**
 * The page the toolbox sits on, which is the topmost of the pages still showing under it.
 *
 * @returns {number|null} - The current page number, or null when no page is showing.
 */
function currentPageBelowToolbox() {
  return pagesBelowToolbox.size ? Math.min(...pagesBelowToolbox) : null
}

const settleScroll = useDebounceFn(() => {
  if (pendingPage.value === null) {
    return
  }
  // Pages render lazily while a smooth scroll runs and each resizes by a fraction of a pixel, which
  // is enough for a page pick to land short of its target. Highlights are centered by the page.
  if (realignPendingPage.value) {
    scrollPageIntoView(pendingPage.value, 'instant')
    currentPage.value = pendingPage.value
    pendingPage.value = null
  }
  else {
    releasePendingPage()
  }
}, SCROLL_IDLE_DELAY)

/**
 * Gives up on the pending page and hands the tracking straight back to the viewport, so a scroll
 * started by hand is never undone by the pending page settling behind it.
 */
function releasePendingPage() {
  pendingPage.value = null
  currentPage.value = currentPageBelowToolbox() ?? currentPage.value
}

/**
 * Whether a key press scrolls the document, as opposed to moving a caret inside a form control:
 * a space typed in the search field must not count as the reader scrolling away.
 *
 * @param {KeyboardEvent} event - The key press to test.
 * @returns {boolean}
 */
function scrollsDocument({ key, target }) {
  return SCROLL_KEYS.includes(key) && !target?.closest?.(FORM_CONTROLS)
}

useEventListener(window, 'scroll', settleScroll, { capture: true, passive: true })
useEventListener(window, ['wheel', 'touchmove', 'pointerdown'], releasePendingPage, { passive: true })
useEventListener(window, 'keydown', event => scrollsDocument(event) && releasePendingPage())

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
 * Tracks whether a page still shows under the toolbox, and follows the topmost one that does
 * unless a scroll of ours is in flight.
 *
 * @param {number} value - The page reporting itself.
 * @param {boolean} below - Whether that page shows under the toolbox.
 */
function trackPage(value, below) {
  if (below) {
    pagesBelowToolbox.add(value)
  }
  else {
    pagesBelowToolbox.delete(value)
  }
  if (pendingPage.value === null) {
    currentPage.value = currentPageBelowToolbox() ?? currentPage.value
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

const page = computed({
  get: () => currentPage.value,
  set: scrollToPage
})

// Picking another occurrence makes the matching page scroll its highlight into view.
watch(highlightIndex, () => {
  if (highlightPage.value) {
    holdPageTracking(highlightPage.value)
  }
})

// A new document swaps every page out without them reporting they stopped showing, and a hold left
// over from the previous one would settle against pages that are not there anymore. The matches
// point at the pages of that previous document too, so the term on screen has to be searched again.
watch(pdf, () => {
  pagesBelowToolbox.clear()
  pendingPage.value = null
  realignPendingPage.value = false
  refreshHighlights()
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
    >
      <template #dropdown>
        <document-viewer-pdf-dropdown
          v-model:rotation="rotation"
          v-model:scale="scale"
          v-model:embed="documentViewStore.embeddedPdf"
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
