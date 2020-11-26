<template>
  <filter-boilerplate v-bind="$props" ref="filter" />
</template>

<script>
import filters from '@/mixins/filters'
import FilterBoilerplate from '@/components/filter/FilterBoilerplate'
/**
 * A Filter component to list unique date values by month.
 */
export default {
  name: 'FilterDate',
  components: {
    FilterBoilerplate
  },
  mixins: [filters]
}
</script>
