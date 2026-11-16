import { computed, toRef, toValue, shallowRef, watch } from 'vue'
import escapeRegExp from 'lodash/escapeRegExp'
import * as PDFJS from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min?url'

import { useWait } from '@/composables/useWait'

// This is directly inspired by vue-pdfjs implementation of PDF.js
// @see https://erindoyle.dev/using-pdfjs-with-vite/
function configureWorker() {
  PDFJS.GlobalWorkerOptions.workerSrc = workerSrc
}

export function usePDF(src, { httpHeaders = null } = {}) {
  const srcRef = toRef(src)
  const pdfDoc = shallowRef(null)
  const pdf = computed(() => pdfDoc.value?.loadingTask ?? null)
  const numPages = computed(() => pdfDoc.value?.numPages ?? 0)
  const sizes = shallowRef([])
  const error = shallowRef(null)
  let currentLoadingTask = null
  const { waitFor, isLoading, loaderId } = useWait()

  if (!PDFJS.GlobalWorkerOptions?.workerSrc) {
    configureWorker()
  }

  /**
   * Loads a PDF document from the given source.
   *
   * @param {string} src - The source URL or path of the PDF document. If not provided, it uses the current value of `srcRef`.
   * @returns {Promise<void>} - A promise that resolves when the PDF is loaded.
   */
  const load = waitFor(async (src = srcRef.value) => {
    // Destroying the loading task also destroys its document, or stops it if it is still loading
    currentLoadingTask?.destroy()
    currentLoadingTask = null
    pdfDoc.value = null
    // If the source has not changed, do not perform unecessary change
    if (srcRef.value !== src) srcRef.value = src
    // If the source is not provided, do not load anything
    if (!src) return

    const wasmUrl = `https://unpkg.com/pdfjs-dist@${PDFJS.version}/wasm/`
    const headers = toValue(httpHeaders)
    const loadingTask = PDFJS.getDocument({ url: src, wasmUrl, httpHeaders: headers })
    currentLoadingTask = loadingTask

    error.value = null
    let doc
    try {
      doc = await loadingTask.promise
    }
    catch (err) {
      // A slow conversion of the previous source can fail after a newer source started loading.
      if (loadingTask === currentLoadingTask) {
        error.value = err
      }
      return
    }
    if (loadingTask !== currentLoadingTask) {
      return
    }
    pdfDoc.value = doc
    sizes.value = []

    for (let page = 1; page <= numPages.value; page++) {
      const pdfPage = await pdfDoc.value.getPage(page)
      const { width, height } = pdfPage.getViewport({ scale: 1 })
      const ratio = width / height
      const size = { width, height, page, ratio }
      // `ratios` is a shallowRef so we cannot directly push to it or it will not trigger reactivity.
      sizes.value = [...sizes.value, size]
    }
  })

  /**
   * Finds all matches of the given term in the PDF document.
   *
   * @param {string} term - The term to search for in the PDF.
   * @returns {Promise<Array>} - An array of objects containing page number and index of each
   */
  async function findHighlights(term) {
    const results = []
    // Build a case-insensitive global regex from the term
    const regex = new RegExp(escapeRegExp(term), 'gi')

    for (let page = 1; page <= numPages.value; page++) {
      const pdfPage = await pdfDoc.value.getPage(page)
      const { items: textItems } = await pdfPage.getTextContent()
      // Join all text items into a single string
      const text = textItems.map(({ str }) => str).join(' ')
      // Use matchAll and map instead of manual while loop
      const pageMatches = Array.from(text.matchAll(regex), ({ index }) => ({ page, index }))

      results.push(...pageMatches)
    }

    return results
  }

  watch(srcRef, load, { immediate: true })

  return { error, findHighlights, load, isLoading, loaderId, pdf, pdfDoc, numPages, sizes }
}
