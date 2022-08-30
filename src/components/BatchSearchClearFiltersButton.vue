<template>
  <b-btn :disabled="!hasActiveFilter"
         class="text-muted "
         variant="link"
         @click="deleteFilters">
    <fa icon="filter-circle-xmark"/>
    {{ $t('batchSearch.clearFilters') }}
  </b-btn>
</template>

<script>

const SEARCH_PARAMS_FILTERS = Object.freeze({
  query: 'query',
  publishState: 'publishState',
  project: 'project',
  dateStart: 'dateStart',
  dateEnd: 'dateEnd',
  state: 'state',
  order: 'order',
  sort: 'sort'
})

export default {
  name: 'BatchSearchClearFilters',
  methods: {
    deleteFilters () {
      return this.$router.push({ name: 'batch-search', query: {} })
    }
  },
  computed: {
    filters () {
      return Object.keys(SEARCH_PARAMS_FILTERS)
    },
    currentFilters () {
      return Object.keys(this.$route.query)
    },
    hasActiveFilter () {
      const isContained = this.currentFilters.filter(f => this.filters.includes(f)).length !== 0
      return this.currentFilters.length !== 0 && isContained
    }
  }
}
</script>
