<template>
  <div class="batch-search container h-100 pt-4">
    <v-wait class="batch-search__wait" for="load haveBatchSearch">
      <fa slot="waiting" class="d-flex mx-auto mt-5" icon="circle-notch" size="2x" spin />
      <template v-if="hasBatchSearch">
        <div class="d-flex flex-wrap align-items-center">
          <batch-search-filter-query class="batch-search__search-bar my-1"/>
          <batch-search-clear-filters class="batch-search__clear-filter-btn m-1"/>
        </div>
        <batch-search-table/>
      </template>
      <template v-else>
        <div class="batch-search__none  text-center">
          <div class="batch-search__none__message b-table-empty-row" v-html="noBatchSearch"/>
        </div>
      </template>
    </v-wait>
  </div>
</template>

<script>
import polling from '@/mixins/polling'
import utils from '@/mixins/utils'
import BatchSearchTable from '@/components/BatchSearchTable'
import BatchSearchClearFilters from '@/components/BatchSearchClearFilters'
import BatchSearchFilterQuery from '@/components/BatchSearchFilterQuery'
import { mapState } from 'vuex'

export default {
  name: 'BatchSearches',
  mixins: [polling, utils],
  components: {
    BatchSearchFilterQuery,
    BatchSearchClearFilters,
    BatchSearchTable
  },
  async mounted () {
    if (!this.hasBatchSearch) {
      await this.getBatchSearch()
    }
  },
  methods: {
    async getBatchSearch () {
      this.$wait.start('load haveBatchSearch')
      await this.$store.dispatch('batchSearch/hasBatchSearch')
      this.$wait.end('load haveBatchSearch')
    }
  },
  computed: {
    ...mapState('batchSearch', ['hasBatchSearch']),
    howToLink () {
      return '#/docs/all-batch-search-documents'
    },
    noBatchSearch () {
      return this.$t('batchSearch.empty', { howToLink: this.howToLink })
    }
  }
}
</script>
<style lang="scss" scoped>
.batch-search__none__message {
  padding: 0.75em;
  border:1px solid #dee2e6;
  background-color: white;
}
</style>
