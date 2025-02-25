<template>
  <form @submit.prevent="saveSearch()">
    <div class="w-100 card border-0 rounded-top-0">
      <div class="card-body pb-1 px-4">
        <b-form-group label-size="sm" :label="`${$t('userHistory.name')} *`">
          <b-form-input v-model="name" type="text" required />
        </b-form-group>
        <p v-html="$t('userHistorySaveSearchForm.description', { searchHistoryPath })"></p>
      </div>
      <div class="card-footer">
        <div class="d-flex justify-content-end align-items-center">
          <b-button type="submit" variant="action">
            {{ $t('userHistorySaveSearchForm.save') }}
          </b-button>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
import { useSearchStore } from '@/store/modules'

/**
 * A form to save the search in user history
 */
export default {
  name: 'UserHistorySaveSearchForm',
  inject: ['searchStoreSuffix'],
  props: {
    /**
     * The indices of the current item.
     */
    indices: {
      type: [String, Array],
      default: ''
    },
    /**
     * The indices of the current item.
     */
    event: {
      type: Object,
      default: null
    }
  },
  emits: ['submit', 'submit:rename'],
  data() {
    return {
      name: this.event?.name || '',
      searchHistoryPath: null
    }
  },
  async mounted() {
    this.searchHistoryPath = await this.getSearchHistoryPath()
  },
  methods: {
    async getUriFromStore() {
      const from = 0
      const query = { ...useSearchStore.instantiate(this.searchStoreSuffix).toRouteQuery, from }
      const { fullPath } = await this.$router.resolve({ name: 'search', query })
      return fullPath
    },
    async getSearchHistoryPath() {
      const { href } = await this.$router.resolve({ name: 'user-history.saved-search.list' })
      return href
    },
    async saveSearch() {
      try {
        if (this.event) {
          await this.$core.api.renameSavedSearch(this.event.id, this.name)
          this.$emit('submit:rename', { event: { ...this.event, name: this.name } })
        } else {
          await this.$core.api.addUserHistoryEvent(this.indices, 'SEARCH', this.name, await this.getUriFromStore())
        }
        const { href } = this.$router.resolve({ name: 'user-history.saved-search.list' })
        const toastParams = { href }
        this.$toast.success(this.$t('userHistory.submitSuccess'), toastParams)
      } catch (_) {
        this.$toast.error(this.$t('userHistory.submitError'))
      } finally {
        this.$emit('submit')
      }
    }
  }
}
</script>
