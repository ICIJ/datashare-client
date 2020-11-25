<template>
  <filter-boilerplate v-bind="$props" ref="filter" />
</template>

<script>
import FilterBoilerplate from '@/components/FilterBoilerplate'
import filters from '@/mixins/filters'

/**
 * A Filter component to list unique text values.
 */
export default {
  name: 'FilterText',
  components: {
    FilterBoilerplate
  },
  mixins: [filters]
}
</script>
