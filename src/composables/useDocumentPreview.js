import { getCookie } from 'tiny-cookie'
import { kebabCase, startCase } from 'lodash'
import { computed } from 'vue'

import settings from '@/utils/settings'
import { useConfig } from '@/composables/useConfig'
import { useImage } from '@/composables/useImage'
import { useDocumentNotesStore } from '@/store/modules'

export const useDocumentPreview = () => {
  const config = useConfig()
  const { fetchImageDimensions } = useImage()
  const documentNotesStore = useDocumentNotesStore()

  /**
   * True if a preview host is configured.
   *
   * @type {import('vue').ComputedRef<boolean>}
   */
  const isPreviewActivated = computed(() => !!config.get('previewHost'))

  /**
   * The value of the session ID header.
   *
   * @type {import('vue').ComputedRef<string>}
   */
  const sessionIdHeaderValue = computed(() => getCookie(import.meta.env.VITE_DS_COOKIE_NAME))

  /**
   * The name of the session ID header.
   *
   * @type {import('vue').ComputedRef<string>}
   */
  const sessionIdHeaderName = computed(() => {
    const dsCookieName = kebabCase(import.meta.env.VITE_DS_COOKIE_NAME)
      .split('-')
      .map(startCase)
      .join('-')
    return `X-${dsCookieName}`
  })

  /**
   * True if the preview should be blurred according to the document's note.
   *
   * @param {Object} options - The document object.
   * @param {string} options.project - The document project.
   * @param {string} options.path - The document path.
   * @returns {Promise<boolean>} True if the preview should be blurred, false otherwise.
   */
  async function isBlurred({ project, path }) {
    const notes = await documentNotesStore.fetchNotesByPath({ project, path })
    return notes.some(note => note.blurSensitiveMedia)
  }

  /**
   * Get the preview meta URL (a JSON with metadata about the preview).
   *
   * @param {Object} options - The options object.
   * @param {string} options.index - The index of the document.
   * @param {string} options.id - The ID of the document.
   * @param {string} options.routing - The routing parameter.
   * @returns {string} The preview meta URL.
   */
  function getPreviewMetaUrl({ index, id, routing } = {}) {
    const host = config.get('previewHost')
    return `${host}/api/v1/thumbnail/${index}/${id}.json?routing=${routing}`
  }

  /**
   * Get the preview URL.
   *
   * @param {Object} options - The options object.
   * @param {string} options.index - The index of the document.
   * @param {string} options.id - The ID of the document.
   * @param {string} options.routing - The routing parameter.
   * @param {Object} params - The parameters object.
   * @param {number} params.page - The page number.
   * @param {string} params.size - The size of the preview.
   * @returns {string} The preview URL.
   */
  function getPreviewUrl({ index, id, routing } = {}, { page = 0, size = 'sm' } = {}) {
    const host = config.get('previewHost')
    return `${host}/api/v1/thumbnail/${index}/${id}?routing=${routing}&page=${page}&size=${size}`
  }

  /**
   * Check if the document can be previewed.
   *
   * @param {Object} document - The document object.
   * @returns {boolean} True if the document can be previewed, false otherwise.
   */
  function canPreview(document) {
    return isPreviewActivated.value || canPreviewRaw(document)
  }

  /**
   * Check if the document can be previewed in raw format.
   *
   * @param {Object} options - The options object.
   * @param {number} options.extractionLevel - The extraction level of the document.
   * @param {number} options.contentLength - The content length of the document.
   * @param {boolean} options.isSupportedImage - Whether the document is a supported image.
   * @returns {boolean} True if the document can be previewed in raw format, false otherwise.
   */
  function canPreviewRaw({ extractionLevel = -1, contentLength = 0, isSupportedImage = false } = {}) {
    return extractionLevel < 2 && isSupportedImage && contentLength < settings.previewRawMaxContentLength
  }

  /**
   * Fetch the image dimensions and base64 string with authentication headers.
   *
   * @param {string} src - The URL of the image.
   * @returns {Promise<object>} A promise that resolves to an object containing the width, height, base64 string, and source URL.
   */
  async function fetchImageDimensionsWithAuth(src) {
    const headers = { [sessionIdHeaderName.value]: sessionIdHeaderValue.value }
    return fetchImageDimensions(src, { headers })
  }

  return {
    // Computed
    isPreviewActivated,
    sessionIdHeaderValue,
    sessionIdHeaderName,
    // Methods
    isBlurred,
    getPreviewMetaUrl,
    getPreviewUrl,
    canPreview,
    canPreviewRaw,
    fetchImageDimensionsWithAuth
  }
}
