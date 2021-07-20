<template>
  <div class="applied-search-filters d-flex flex-wrap pt-1" v-if="filters.length">
    <applied-search-filters-item v-for="(filter, index) in filters" :key="index" :filter="filter" hide-filter-label />
    <reset-filters-button variant="link" class="text-muted badge font-weight-normal" auto-hiding />
  </div>
</template>

<script>
import { parseInt } from 'lodash'

import AppliedSearchFiltersItem from '@/components/AppliedSearchFiltersItem'
import ResetFiltersButton from '@/components/ResetFiltersButton'
import { FilterDate } from '@/store/filters'

/**
 * A list of applied search filters.
 */
export default {
  name: 'AppliedSearchFilters',
  components: {
    AppliedSearchFiltersItem,
    ResetFiltersButton
  },
  computed: {
    filters () {
      const filters = []
      this.$store.getters['search/retrieveQueryTerms'].forEach(term => {
        term.value = term.label
        filters.push(term)
      })
      this.$store.getters['search/instantiatedFilters'].forEach(filter => {
        filter.values.forEach(value => {
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
