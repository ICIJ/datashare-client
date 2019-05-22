import DatashareClient from '@/api/DatashareClient'

const ds = new DatashareClient()
export const mixin = {
  methods: {
    getSource (document) {
      return ds.getSource(document).catch(error => {
        if (error.response && error.response.status === 404) {
          throw new Error(this.$t('document.error_not_found'))
        }
        throw error
      })
    }
  }
}

export default mixin
