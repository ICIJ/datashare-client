<template>
  <div class="batch-search container h-100 pt-4">
    <v-wait class="batch-search__wait" for="load haveBatchSearch">
      <fa slot="waiting" class="d-flex mx-auto mt-5" icon="circle-notch" size="2x" spin />
      <template v-if="hasBatchSearch">
        <div class="d-flex flex-wrap align-items-center">
          <batch-search-filter-query class="batch-search__search-bar my-1"/>
          <batch-search-clear-filters class="batch-search__clear-filter-btn m-1"/>
          <b-btn class="ml-auto my-1 text-nowrap" variant="primary" @click="$refs['batch-search-form'].show()">
            <fa class="mr-1" icon="plus" />
            {{ $t('batchSearch.heading') }}
          </b-btn>
        </div>
        <batch-search-table/>
      </template>
      <template v-else>
        <div class="batch-search__none  text-center">
          <div class="batch-search__none__message b-table-empty-row" v-html="noBatchSearch"/>
          <b-btn class="mx-auto my-2" variant="primary" @click="$refs['batch-search-form'].show()">
            <fa class="mr-1" icon="plus" />
            <span class="text-nowrap">{{ $t('batchSearch.heading') }}</span>
          </b-btn>
        </div>
      </template>
      <b-modal ref="batch-search-form" :title="$t('batchSearch.heading')" body-class="p-0" hide-footer size="md">
        <batch-search-form hide-border hide-title @submit="$refs['batch-search-form'].hide()"></batch-search-form>
      </b-modal>
    </v-wait>
  </div>
</template>

<script>
import BatchSearchForm from '@/components/BatchSearchForm'
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
    BatchSearchTable,
    BatchSearchForm
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
