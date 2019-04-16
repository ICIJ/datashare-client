<template>
  <div class="search-results__header__applied-filters py-1" v-if="filters.length">
    <search-results-applied-filter v-for="(filter, index) in filters" :key="index" :filter="filter" />
  </div>
</template>

<script>
import SearchResultsAppliedFilter from '@/components/SearchResultsAppliedFilter'
import compact from 'lodash/compact'
import concat from 'lodash/concat'
import filter from 'lodash/filter'
import map from 'lodash/map'
import split from 'lodash/split'
import uniq from 'lodash/uniq'

export default {
  name: 'SearchResultsAppliedFilters',
  components: {
    SearchResultsAppliedFilter
  },
  computed: {
    filters () {
      let filters = []
      map(filter(compact(uniq(split(this.$store.state.search.query, ' '))), i => i !== '*'), value => {
        filters = concat(filters, { value: value })
      })
      map(this.$store.state.search.facets, facet => {
        map(facet.values, value => {
          filters = concat(filters, { value: value, name: facet.name })
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
