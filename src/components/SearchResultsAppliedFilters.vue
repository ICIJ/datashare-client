<template>
  <div class="search-results-header__applied-filters" v-if="filters.length">
    <search-results-applied-filter v-for="(filter, index) in filters" :key="index" :filter="filter" />
    <reset-filters-button variant="link" class="text-muted badge font-weight-normal" auto-hiding />
  </div>
</template>

<script>
import ResetFiltersButton from '@/components/ResetFiltersButton'
import SearchResultsAppliedFilter from '@/components/SearchResultsAppliedFilter'
import { FilterDate } from '@/store/filters'
import map from 'lodash/map'

export default {
  name: 'SearchResultsAppliedFilters',
  components: {
    ResetFiltersButton,
    SearchResultsAppliedFilter
  },
  computed: {
    filters () {
      const filters = []
      map(this.$store.getters['search/retrieveQueryTerms'], term => {
        term.value = term.label
        filters.push(term)
      })
      map(this.$store.getters['search/instantiatedFilters'], filter => {
        map(filter.values, value => {
          let label = filter.itemLabel ? filter.itemLabel({ key: value, key_as_string: value }) : value
          label = this.$te(label) ? this.$t(label) : label
          if (filter.component === new FilterDate().component && Number.isInteger(label)) {
            const date = new Date(parseInt(label))
            label = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2)
          }
          filters.push({ name: filter.name, label, value, negation: filter.reverse })
        })
      })
      return filters
    }
  }
}
</script>
