import { noop, identity, isEqual } from 'lodash'
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { batchQueryParamUpdate } from '@/composables/useUrlParam'

/**
 * Synchronizes a single URL query parameter with Vuex store or a custom getter/setter.
 *
 * This function is designed for handling a single URL query parameter and keeping it
 * in sync with the store or custom getter/setter. It ensures bidirectional synchronization
 * between the URL and the store or reactive state.
 *
 * @param {string} queryParam - The query parameter to sync.
 * @param {Object} [options={}] - Configurations, e.g., a transform function to process the value.
 * @param {Function} [options.get] - Getter function to retreive the value
 * @param {Function} [options.set] - Setter function to update the value
 * @returns {ComputedRef} - A computed reference to the synchronized value.
 */

export function useUrlParamWithStore(queryParam, options = {}) {
  const route = useRoute()
  const router = useRouter()

  const getValue = options.get || noop
  const setValue = options.set || noop
  const transform = options.transform || identity
  const to = options.to || null

  // Get and transform the route value
  const getRouteValue = () => {
    const value = route.query[queryParam]
    return value !== undefined ? transform(value) : null
  }

  // Create a computed property that synchronizes the query parameter with the Vuex store
  const param = computed({
    get() {
      // If the query parameter exists in the URL, transform and return it, else return the value from the store
      return getRouteValue() ?? getValue()
    },
    set(value) {
      setValue(value)
      // Batch the update to the query parameter in the URL
      batchQueryParamUpdate(router, route, to, [queryParam], [value])
    }
  })

  // Watch the Vuex store value directly and update the URL when it changes
  watch(getValue, (newValue) => {
    if ((!to || route.name === to) && newValue !== getRouteValue()) {
      batchQueryParamUpdate(router, route, to, [queryParam], [newValue])
    }
  })

  // Initialize the store value with the URL value if they are different
  if (getRouteValue() && !isEqual(getRouteValue(), getValue())) {
    setValue(getRouteValue())
  }

  return param
}
