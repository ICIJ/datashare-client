<template>
  <div class="applied-search-filters d-flex flex-wrap pt-1" v-if="filters.length">
    <applied-search-filters-item v-for="(filter, index) in filters" :key="index" :filter="filter"></applied-search-filters-item>
    <reset-filters-button variant="link" class="text-muted badge font-weight-normal" auto-hiding></reset-filters-button>
  </div>
</template>

<script>
import { map, parseInt } from 'lodash'

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
      map(this.$store.getters['search/retrieveQueryTerms'], term => {
        term.value = term.label
        filters.push(term)
      })
      map(this.$store.getters['search/instantiatedFilters'], filter => {
        const integers = []
        if (filter.name === 'creationDate') {
          filter.values.forEach((value) => {
            integers.push(parseInt(value))
          })
        }
        const values = (integers.length !== 0) ? [...new Set(integers)] : filter.values
        map(values, value => {
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
