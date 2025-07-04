import { toValue } from 'vue'

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

  /**
   * Rotate an image by a given number of degrees.
   *
   * @param {string} src - The src string of the image.
   * @param {number} degrees - The number of degrees to rotate the image (default is 90).
   * @returns {Promise<string>} A promise that resolves to the rotated image as a base64 string.
   */
  async function rotateBase64Image(src, degrees = 90) {
    const img = await fetchImage(toValue(src))
    const radians = (toValue(degrees) % 360) * (Math.PI / 180)
    const sin = Math.abs(Math.sin(radians))
    const cos = Math.abs(Math.cos(radians))

    const newWidth = img.width * cos + img.height * sin
    const newHeight = img.width * sin + img.height * cos

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = newWidth
    canvas.height = newHeight

    ctx.translate(newWidth / 2, newHeight / 2)
    ctx.rotate(radians)
    ctx.drawImage(img, -img.width / 2, -img.height / 2)

    return canvas.toDataURL()
  }

  return {
    fetchImage,
    fetchImageAsBase64,
    fetchImageDimensions,
    rotateBase64Image
  }
}
