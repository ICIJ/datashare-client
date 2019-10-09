<template>
  <div class="search-results-header__applied-filters" v-if="filters.length">
    <search-results-applied-filter v-for="(filter, index) in filters" :key="index" :filter="filter" />
    <reset-filters-button variant="link" class="text-muted badge font-weight-normal" auto-hidding />
  </div>
</template>

<script>
import ResetFiltersButton from '@/components/ResetFiltersButton'
import SearchResultsAppliedFilter from '@/components/SearchResultsAppliedFilter'
import { FacetDate } from '@/store/facetsStore'
import map from 'lodash/map'

export default {
  name: 'SearchResultsAppliedFilters',
  components: {
    ResetFiltersButton,
    SearchResultsAppliedFilter
  },
  computed: {
    filters () {
      let filters = []
      map(this.$store.getters['search/retrieveQueryTerms'], term => {
        term.value = term.label
        filters.push(term)
      })
      map(this.$store.state.search.facets, facet => {
        map(facet.values, value => {
          let label = facet.itemLabel ? facet.itemLabel({ key: value, key_as_string: value }) : value
          label = this.$te(label) ? this.$t(label) : label
          if (facet.component === new FacetDate().component && Number.isInteger(label)) {
            const date = new Date(parseInt(label))
            label = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2)
          }
          filters.push({ name: facet.name, label, value, negation: facet.reverse })
        })
      })
      return filters
    }
  }
}
</script>
