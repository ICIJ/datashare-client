<template>
  <filter-boilerplate
    ref="filter"
    v-bind="$props"
    @add-filter-values="(value) => $emit('add-filter-values', value)"
  ></filter-boilerplate>
</template>

<script>
import { camelCase, flatten, get, reduce } from 'lodash'

import FilterBoilerplate from '@/components/Filter/FilterBoilerplate'
import filters from '@/mixins/filters'

/**
 * A Filter component to list unique text values.
 */
export default {
  name: 'FilterAbstract',
  components: {
    FilterBoilerplate
  },
  mixins: [filters],
  props: {
    // Temporary import of the props from FilterBoilerplate
    ...FilterBoilerplate.props
  },
  data() {
    return {
      mounted: false
    }
  },
  computed: {
    root() {
      return this.mounted ? get(this, '$refs.filter', {}) : {}
    }
  },
  async mounted() {
    await this.$nextTick()
    this.mounted = true
  },
  methods: {
    // Returns all props without the givens keys
    propsWithout(...keys) {
      keys = flatten(keys).map(camelCase)
      return reduce(
        this.$props,
        (props, value, key) => {
          if (keys.indexOf(key) === -1) {
            props[key] = value
          }
          return props
        },
        {}
      )
    }
  }
}
</script>
