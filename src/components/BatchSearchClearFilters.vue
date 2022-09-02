<template>
  <b-btn :disabled="!hasActiveFilter"
         class="batch-search-clear-filters text-muted "
         variant="link"
         @click="deleteFilters">
    <fa icon="filter-circle-xmark"/>
    {{ $t('batchSearch.clearFilters') }}
  </b-btn>
</template>

<script>

import utils from '@/mixins/utils'
const SEARCH_PARAMS_LOCAL = Object.freeze({
  query: true,
  publishState: false,
  project: false,
  dateStart: true,
  dateEnd: true,
  state: true,
  order: true,
  sort: true
})

export default {
  name: 'BatchSearchClearFilters',
  mixins: [utils],
  methods: {
    deleteFilters () {
      return this.$router.push({ name: 'batch-search', query: {} })
    }
  },
  computed: {
    filters () {
      const keys = Object.keys(SEARCH_PARAMS_LOCAL)
      return this.isServer
        ? keys
        : keys.filter(key =>
          SEARCH_PARAMS_LOCAL[key]
        )
    },
    currentFilters () {
      return Object.keys(this.$route?.query)
    },
    hasActiveFilter () {
      const isContained = this.currentFilters.filter(f => this.filters.includes(f)).length !== 0
      return this.currentFilters.length !== 0 && isContained
    }
  }
}
</script>
