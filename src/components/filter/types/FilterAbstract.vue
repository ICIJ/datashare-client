<template>
  <filter-boilerplate
    @add-filter-values="value => $emit('add-filter-values', value)"
    ref="filter"
    v-bind="$props" />
</template>

<script>
import camelCase from 'lodash/camelCase'
import flatten from 'lodash/flatten'
import get from 'lodash/get'
import noop from 'lodash/noop'
import reduce from 'lodash/reduce'

import FilterBoilerplate from '@/components/filter/FilterBoilerplate'
import filters from '@/mixins/filters'

/**
 * A Filter component to list unique text values.
 */
export default {
  name: 'FilterAbstract',
  mixins: [filters],
  components: {
    FilterBoilerplate
  },
  props: {
    // Temporary import of the props from FilterBoilerplate
    ...FilterBoilerplate.props
  },
  async mounted () {
    await this.$nextTick()
    this.mounted = true
  },
  computed: {
    root () {
      return get(this, '$refs.filter', {})
    }
  },
  methods: {
    // Returns all props without the givens keys
    propsWithout (...keys) {
      keys = flatten(keys).map(camelCase)
      return reduce(this.$props, (props, value, key) => {
        if (keys.indexOf(key) === -1) {
          props[key] = value
        }
        return props
      }, {})
    },
    async bindOnRoot (...args) {
      if (!this.mounted) {
        await this.$nextTick()
      }
      // Bind the function with safety net in case no "root" is mounted yet
      return get(this, 'root.$on', noop).call(this, ...args)
    }
  }
}
</script>
