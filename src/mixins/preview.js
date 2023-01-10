import { getCookie } from 'tiny-cookie'
import { kebabCase, startCase } from 'lodash'

export default {
  computed: {
    isPreviewActivated() {
      return !!this.$config.get('previewHost')
    },
    sessionIdHeaderValue() {
      return getCookie(process.env.VUE_APP_DS_COOKIE_NAME)
    },
    sessionIdHeaderName() {
      let dsCookieName = kebabCase(process.env.VUE_APP_DS_COOKIE_NAME)
      dsCookieName = dsCookieName.split('-').map(startCase).join('-')
      return `X-${dsCookieName}`
    }
  },
  methods: {
    arrayBufferToBase64(buffer) {
      let binary = ''
      const bytes = [].slice.call(new Uint8Array(buffer))
      bytes.forEach((b) => {
        binary += String.fromCharCode(b)
      })
      // Create a base64 string from a string
      return btoa(binary)
    },
    getPreviewMetaUrl({ index, id, routing } = {}) {
      const host = this.$config.get('previewHost')
      return `${host}/api/v1/thumbnail/${index}/${id}.json?routing=${routing}`
    },
    getPreviewUrl({ index, id, routing } = {}, { page = 0, size = 'sm' } = {}) {
      const host = this.$config.get('previewHost')
      return `${host}/api/v1/thumbnail/${index}/${id}?routing=${routing}&page=${page}&size=${size}`
    },
    async fetchPreview(url) {
      const request = new Request(url)
      const response = await fetch(request, {
        method: 'GET',
        cache: 'default',
        headers: {
          [this.sessionIdHeaderName]: this.sessionIdHeaderValue
        }
      })
      if (!response.ok) {
        throw Error('Unable to fetch the thumbnail')
      }
      return response
    },
    async fetchPreviewAsBase64(url) {
      const response = await this.fetchPreview(url)
      const buffer = await response.arrayBuffer()
      const imageStr = this.arrayBufferToBase64(buffer)
      return `data:image/jpeg;base64,${imageStr}`
    }
  }
}
