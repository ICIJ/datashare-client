import { apiInstance as api } from '@/api/apiInstance'

export function useImage() {
  /**
   * Fetch the image.
   *
   * @param {string} src - The URL of the image.
   * @returns {Promise<HTMLImageElement>} A promise that resolves to the image element.
   */
  async function fetchImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Unable to fetch the thumbnail'))
      // This is necessary to avoid CORS issues
      img.crossOrigin = 'Anonymous'
      img.src = src
    })
  }

  /**
   * Fetch the image as a base64 string.
   *
   * @param {string} src - The URL of the image.
   * @param {object} options - Optional parameters for the request.
   * @param {object} options.headers - Additional headers to include in the request.
   * @returns {Promise<object>} A promise that resolves to an object containing the base64 string and image dimensions.
   */
  async function fetchImageAsBase64(src, { headers = {} } = {}) {
    try {
      const responseType = 'blob'
      const cache = 'default'
      const { data: imgBlob } = await api.axios.get(src, { responseType, cache, headers })
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader()
        fileReader.readAsDataURL(imgBlob)
        fileReader.onerror = reject
        fileReader.onload = () => resolve(fileReader.result)
      })
    } catch (error) {
      throw new Error('Unable to fetch the image as base64')
    }
  }

  /**
   * Fetch the image dimensions and base64 string.
   *
   * @param {string} src - The URL of the image.
   * @param {object} options - Optional parameters for the request.
   * @param {object} options.headers - Additional headers to include in the request.
   * @returns {Promise<object>} A promise that resolves to an object containing the width, height, base64 string, and source URL.
   */
  async function fetchImageDimensions(src, { headers = {} } = {}) {
    try {
      const base64 = await fetchImageAsBase64(src, { headers })
      const img = await fetchImage(base64)
      return { width: img.width, height: img.height, base64, src }
    } catch (error) {
      throw new Error('Unable to fetch image and its dimensions')
    }
  }

  return {
    fetchImage,
    fetchImageAsBase64,
    fetchImageDimensions
  }
}
