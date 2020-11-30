<template>
  <div class="applied-search-filters d-flex flex-wrap pt-1" v-if="filters.length">
    <applied-search-filters-item v-for="(filter, index) in filters" :key="index" :filter="filter"></applied-search-filters-item>
    <reset-filters-button variant="link" class="text-muted badge font-weight-normal" auto-hiding></reset-filters-button>
  </div>
</template>

<script>
import ResetFiltersButton from '@/components/ResetFiltersButton'
import AppliedSearchFiltersItem from '@/components/AppliedSearchFiltersItem'
import { FilterDate } from '@/store/filters'
import map from 'lodash/map'
import parseInt from 'lodash/parseInt'

/**
 * A list of applied search filters.
 */
export default {
  name: 'AppliedSearchFilters',
  components: {
    ResetFiltersButton,
    AppliedSearchFiltersItem
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
          if (filter.component === new FilterDate().component && parseInt(label)) {
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
