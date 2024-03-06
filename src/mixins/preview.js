import { getCookie } from 'tiny-cookie'
import { kebabCase, startCase } from 'lodash'
import axios from 'axios'

import settings from '@/utils/settings'

export default {
  computed: {
    isPreviewActivated() {
      return !!this.$config.get('previewHost')
    },
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
    canPreviewRaw({ extractionLevel = -1, contentLength = 0, isSupportedImage = false } = {}) {
      return extractionLevel === 0 && isSupportedImage && contentLength < settings.previewRawMaxContentLength
    },
    async fetchPreview(url) {
      try {
        return await axios.get(url, {
          responseType: 'arraybuffer',
          headers: {
            [this.sessionIdHeaderName]: this.sessionIdHeaderValue
          }
        })
      } catch (_) {
        throw Error('Unable to fetch the thumbnail')
      }
    },
    async fetchImageAsBase64(url) {
      const response = await this.fetchPreview(url)
      const buffer = Buffer.from(response.data, 'binary')
      const imageStr = buffer.toString('base64')
      console.log(imageStr)
      return `data:image/jpeg;base64,${imageStr}`
    }
  }
}
