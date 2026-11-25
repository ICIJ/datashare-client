import { nextTick, shallowRef, toValue, watch } from 'vue'
import { renderAsync } from 'docx-preview'
import { useI18n } from 'vue-i18n'

import { useDocumentSource } from '@/composables/useDocumentSource'
import { useToast } from '@/composables/useToast'
import { hasRenderedPageBreaks, paginateDocx } from '@/utils/docxPages'

// `ignoreLastRenderedPageBreak` defaults to true, which silently collapses the
// page count to 1: the sections the paginator and the marks are keyed by are
// exactly the page breaks Word wrote.
const RENDER_OPTIONS = { ignoreLastRenderedPageBreak: false, inWrapper: true }

/**
 * Renders a document's docx source into a container, split into page-sized
 * sections, again whenever the document changes.
 *
 * @param {object} target
 * @param {import('vue').Ref<object>} target.document - The document to render.
 * @param {import('vue').Ref<HTMLElement>} target.container - The element to render into.
 * @param {import('vue').Ref<boolean|null>} target.blurred - Whether the container is hidden behind a warning.
 * @param {object} hooks
 * @param {Function} hooks.onRendered - Called once the sections in the container are final.
 * @param {Function} hooks.onFailed - Called when a render fails, to drop the previous sections.
 * @param {Function} hooks.onBeforePaginate - Called before the sections on screen are split.
 * @returns {Object} `{ error, render }`
 */
export function useDocxRender({ document, container, blurred }, hooks) {
  const { fetchSource } = useDocumentSource()
  const { toast } = useToast()
  const { t } = useI18n()
  const error = shallowRef(null)

  let lastRender = 0
  // A hidden container measures every block at 0, so a render painted behind the
  // blur warning is split once the warning is dismissed.
  let unpaginatedRender = null

  function failRender(message) {
    error.value = message
    hooks.onFailed()
    toast.error(message)
  }

  // A document swapped in while this one was loading owns the container now, so
  // neither this render's markup nor its failure may be written over the one on screen.
  function isCurrentRender(id) {
    return id === lastRender
  }

  function failCurrentRender(id, message) {
    if (isCurrentRender(id)) {
      failRender(message)
    }
    return null
  }

  async function fetchDocx(id) {
    try {
      const blob = await fetchSource(toValue(document), { responseType: 'blob' })
      return isCurrentRender(id) ? blob : null
    }
    catch (reason) {
      return failCurrentRender(id, reason.message)
    }
  }

  // A library rejection carries its own English internals (jszip's "is this a zip
  // file ?"), unlike the source errors, which are already localized.
  async function paintDocx(id, blob) {
    try {
      const wordDocument = await renderAsync(blob, container.value, null, RENDER_OPTIONS)
      return isCurrentRender(id) ? { wordDocument } : null
    }
    catch {
      return failCurrentRender(id, t('document.notAvailable'))
    }
  }

  // docx-preview loads the embedded fonts on its own, and they change the text heights.
  async function waitForEmbeddedFonts(id) {
    await window.document.fonts?.ready
    return isCurrentRender(id)
  }

  function paginateUnlessLaidOutByWord(id, wordDocument) {
    if (hasRenderedPageBreaks(wordDocument)) {
      return
    }
    if (blurred.value) {
      unpaginatedRender = id
    }
    else {
      paginateDocx(container.value)
    }
  }

  async function render() {
    const id = ++lastRender
    error.value = null
    const blob = await fetchDocx(id)
    if (!blob) {
      return
    }
    const painted = await paintDocx(id, blob)
    if (!painted) {
      return
    }
    const isStillCurrent = await waitForEmbeddedFonts(id)
    if (!isStillCurrent) {
      return
    }
    paginateUnlessLaidOutByWord(id, painted.wordDocument)
    await hooks.onRendered()
  }

  async function paginateUnblurred(value) {
    if (value) {
      return
    }
    // Waits for `v-show` to show the container, and for a swapped document's render to start.
    await nextTick()
    if (unpaginatedRender !== lastRender) {
      return
    }
    unpaginatedRender = null
    hooks.onBeforePaginate()
    paginateDocx(container.value)
    await hooks.onRendered()
  }

  watch(blurred, paginateUnblurred)
  watch(document, render, { immediate: true, flush: 'post' })

  return { error, render }
}
