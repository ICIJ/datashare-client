<template>
  <filter-boilerplate v-bind="$props" ref="filter" />
</template>

<script>
import FilterBoilerplate from '@/components/filter/FilterBoilerplate'
import filters from '@/mixins/filters'

/**
 * A Filter component to list unique text values.
 */
export default {
  name: 'FilterAbstract',
  components: {
    FilterBoilerplate
  },
  mixins: [filters]
}
</script>
