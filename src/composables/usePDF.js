import { computed, toRef, shallowRef, watch } from 'vue'
import { escapeRegExp } from 'lodash'
import * as PDFJS from 'pdfjs-dist'
import PDFWorker from 'pdfjs-dist/build/pdf.worker.min?url'

// This is directly inspired by vue-pdfjs implementation of PDF.js
// @see https://erindoyle.dev/using-pdfjs-with-vite/
function configureWorker(wokerSrc) {
  PDFJS.GlobalWorkerOptions.workerSrc = wokerSrc
}

export function usePDF(src) {
  const srcRef = toRef(src)
  const pdfDoc = shallowRef(null)
  const pdf = computed(() => pdfDoc.value?.loadingTask ?? null)
  const numPages = computed(() => pdfDoc.value?.numPages ?? 0)
  const sizes = shallowRef([])

  if (!PDFJS.GlobalWorkerOptions?.workerSrc) {
    configureWorker(PDFWorker)
  }

  /**
   * Loads a PDF document from the given source.
   *
   * @param {string} src - The source URL or path of the PDF document. If not provided, it uses the current value of `srcRef`.
   * @returns {Promise<void>} - A promise that resolves when the PDF is loaded.
   */
  async function load(src = srcRef.value) {
    // If the PDF document is already loaded, destroy it before loading a new one
    if (pdfDoc.value) pdfDoc.value.destroy()
    // If the source has not changed, do not perform unecessary change
    if (srcRef.value !== src) srcRef.value = src

    const loadingTask = PDFJS.getDocument(src)

    pdfDoc.value = await loadingTask.promise
    sizes.value = []

    for (let page = 1; page <= numPages.value; page++) {
      const pdfPage = await pdfDoc.value.getPage(page)
      const { width, height } = pdfPage.getViewport({ scale: 1 })
      const ratio = width / height
      const size = { width, height, page, ratio }
      // `ratios` is a shallowRef so we cannot directly push to it or it will not trigger reactivity.
      sizes.value = [...sizes.value, size]
    }
  }

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

  return { findHighlights, load, pdf, pdfDoc, numPages, sizes }
}
