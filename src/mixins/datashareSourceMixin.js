import DatashareClient from '@/api/DatashareClient'

const ds = new DatashareClient()
export const mixin = {
  methods: {
    getSource (document) {
      return ds.getSource(document).catch(error => {
        if (error.response && error.response.status === 404) {
          this.$toasted.show(this.$root.$t('document.error_not_found'),
            { type: 'error', position: 'bottom-right' })
            .goAway(10000)
        }
        throw error
      })
    }
  }
}

export default mixin
