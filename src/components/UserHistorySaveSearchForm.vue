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
     * The index of the current item.
     */
    index: {
      type: String
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
        await this.api.addHistoryEvent(this.index, 'SEARCH', this.name, window.location.hash.substr(2))
        this.$root.$bvToast.toast(this.$t('userHistory.submitSuccess'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$root.$bvToast.toast(this.$t('userHistory.submitError'), { noCloseButton: true, variant: 'danger' })
      } finally {
        this.$emit('submit')
      }
    }
  },
  computed: {
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
