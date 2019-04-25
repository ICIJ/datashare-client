<template>
  <div class="search-results__header__applied-filters py-1" v-if="filters.length">
    <search-results-applied-filter v-for="(filter, index) in filters" :key="index" :filter="filter" />
  </div>
</template>

<script>
import SearchResultsAppliedFilter from '@/components/SearchResultsAppliedFilter'
import concat from 'lodash/concat'
import map from 'lodash/map'

export default {
  name: 'SearchResultsAppliedFilters',
  components: {
    SearchResultsAppliedFilter
  },
  computed: {
    filters () {
      let filters = []
      map(this.$store.getters['search/retrieveQueryTerms'], term => {
        filters = concat(filters, { value: term })
      })
      map(this.$store.state.search.facets, facet => {
        map(facet.values, value => {
          const label = facet.itemLabel ? facet.itemLabel({ key: value }) : value
          const translatedLabel = this.$te(label) ? this.$t(label) : label
          filters = concat(filters, { value: translatedLabel, name: facet.name })
        })
      })
      return filters
    }
  }
}
</script>

<style lang="scss">
  .search-results__header__applied-filters {
    border-bottom: 1px solid $gray-200;
  }
</style>
