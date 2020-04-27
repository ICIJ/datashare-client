import Api from '@/api'

const api = new Api()

export const mixin = {
  methods: {
    getSource (document) {
      return api.getSource(document).catch(error => {
        if (error.response && error.response.status === 404) {
          throw new Error(this.$t('document.errorNotFound'))
        }
        throw error
      })
    }
  }
}

export default mixin
