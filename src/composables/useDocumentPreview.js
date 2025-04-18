import { getCookie } from 'tiny-cookie'
import { kebabCase, startCase } from 'lodash'
import { computed } from 'vue'

import settings from '@/utils/settings'
import { useConfig } from '@/composables/useConfig'

export const useDocumentPreview = () => {
  const config = useConfig()

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
   * Fetch the preview image.
   *
   * @param {string} url - The URL of the preview image.
   * @returns {Promise<HTMLImageElement>} A promise that resolves to the image element.
   */
  async function fetchPreview(url) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Unable to fetch the thumbnail'))
      // This is necessary to avoid CORS issues
      img.crossOrigin = 'Anonymous'
      img.src = url
    })
  }

  /**
   * Fetch the preview image as a base64 string.
   *
   * @param {string} url - The URL of the preview image.
   * @returns {Promise<object>} A promise that resolves to an object containing the base64 string and image dimensions.
   */
  async function fetchImageAsBase64(url) {
    try {
      const img = await fetchPreview(url)
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const base64data = canvas.toDataURL('image/jpeg').replace(/^data:image\/jpeg;base64,/, '')
      const src = `data:image/jpeg;base64,${base64data}`
      return { src, width: img.width, height: img.height }
    } catch (error) {
      throw new Error('Unable to fetch the image as base64')
    }
  }

  return {
    // Computed
    isPreviewActivated,
    sessionIdHeaderValue,
    sessionIdHeaderName,
    // Methods
    getPreviewMetaUrl,
    getPreviewUrl,
    canPreviewRaw,
    fetchPreview,
    fetchImageAsBase64
  }
}
