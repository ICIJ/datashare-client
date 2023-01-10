<template>
  <filter-boilerplate
    ref="filter"
    v-bind="$props"
    @add-filter-values="(value) => $emit('add-filter-values', value)"
  ></filter-boilerplate>
</template>

<script>
import { camelCase, flatten, get, noop, reduce } from 'lodash'

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
  mixins: [filters],
  props: {
    // Temporary import of the props from FilterBoilerplate
    ...FilterBoilerplate.props
  },
  computed: {
    root() {
      return get(this, '$refs.filter', {})
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
    },
    async bindOnRoot(...args) {
      if (!this.mounted) {
        await this.$nextTick()
      }
      // Bind the function with safety net in case no "root" is mounted yet
      return get(this, 'root.$on', noop).call(this, ...args)
    }
  }
}
</script>
