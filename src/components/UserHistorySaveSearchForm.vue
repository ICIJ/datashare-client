<template>
  <b-form @submit.prevent="saveSearch">
    <div class="w-100 border-top">
      <div class="card-body pb-1">
        <b-form-group label-size="sm" :label="`${ $t('userHistory.name') } *`">
          <b-form-input v-model="name" type="text" required />
        </b-form-group>
        <p v-html="$t('userHistorySaveSearchForm.description', { searchHistoryPath })"></p>
      </div>
      <div class="card-footer">
        <div class="d-flex justify-content-end align-items-center">
          <b-btn type="submit"  variant="primary">
            {{ $t('global.submit') }}
          </b-btn>
        </div>
      </div>
    </div>
  </b-form>
</template>

<script>
import Api from '@/api'

/**
 * A form to save the search in user history
 */
export default {
  name: 'UserHistorySaveSearchForm',
  props: {
    /**
     * The indices of the current item.
     */
    indices: {
      type: [String, Array]
    }
  },
  data () {
    return {
      name: ''
    }
  },
  methods: {
    async saveSearch () {
      try {
        // @todo use all indices instead of just the first one
        await this.api.addHistoryEvent(this.indices[0], 'SEARCH', this.name, this.uriFromStore)
        const { href } = this.$router.resolve({ name: 'search-history' })
        const toastParams = { href, noCloseButton: true, variant: 'success' }
        this.$root.$bvToast.toast(this.$t('userHistory.submitSuccess'), toastParams)
      } catch (_) {
        const toastParams = { noCloseButton: true, variant: 'danger' }
        this.$root.$bvToast.toast(this.$t('userHistory.submitError'), toastParams)
      } finally {
        this.$emit('submit')
      }
    }
  },
  computed: {
    uriFromStore () {
      const from = 0
      const query = { ...this.$store.getters['search/toRouteQuery'](), from }
      const { route: { fullPath } } = this.$router.resolve({ name: 'search', query })
      return fullPath
    },
    api () {
      return new Api()
    },
    searchHistoryPath () {
      const { route: { path } } = this.$router.resolve({ name: 'search-history' })
      return `/#${path}`
    }
  }
}
</script>
