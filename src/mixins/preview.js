import { getCookie } from 'tiny-cookie'
import { kebabCase, startCase } from 'lodash'

export default {
  computed: {
    sessionIdHeaderValue() {
      return getCookie(import.meta.env.VITE_DS_COOKIE_NAME)
    },
    sessionIdHeaderName() {
      let dsCookieName = kebabCase(import.meta.env.VITE_DS_COOKIE_NAME)
      dsCookieName = dsCookieName.split('-').map(startCase).join('-')
      return `X-${dsCookieName}`
    }
  },
  methods: {
    getPreviewMetaUrl({ index, id, routing } = {}) {
      const host = this.$config.get('previewHost')
      return `${host}/api/v1/thumbnail/${index}/${id}.json?routing=${routing}`
    },
    getPreviewUrl({ index, id, routing } = {}, { page = 0, size = 'sm' } = {}) {
      const host = this.$config.get('previewHost')
      return `${host}/api/v1/thumbnail/${index}/${id}?routing=${routing}&page=${page}&size=${size}`
    },
    async fetchPreview(url) {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error('Unable to fetch the thumbnail'))
        // This is necessary to avoid CORS issues
        img.crossOrigin = 'Anonymous'
        img.src = url
      })
    },
    async fetchImageAsBase64(url) {
      try {
        const img = await this.fetchPreview(url)
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)

        const base64data = canvas.toDataURL('image/jpeg').replace(/^data:image\/jpeg;base64,/, '')
        return `data:image/jpeg;base64,${base64data}`
      } catch (error) {
        throw new Error('Unable to fetch the image as base64')
      }
    }
  }
}
