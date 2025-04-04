import { noop, identity, isEqual } from 'lodash'
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { batchQueryParamUpdate } from '@/composables/useUrlParam'

/**
 * Synchronizes a single URL query parameter with store or a custom getter/setter.
 *
 * This function is designed for handling a single URL query parameter and keeping it
 * in sync with the store or custom getter/setter. It ensures bidirectional synchronization
 * between the URL and the store or reactive state.
 *
 * @param {string} queryParam - The query parameter to sync.
 * @param {Object} [options={}] - Configurations, e.g., a transform function to process the value.
 * @param {Function} [options.get] - Getter function to retreive the value
 * @param {Function} [options.set] - Setter function to update the value
 * @param {Function} [options.transform] - Function to transform the value before setting it
 * @param {any} [options.initialValue] - Initial value to set if the query parameter is not present
 * 
 * @returns {ComputedRef} - A computed reference to the synchronized value.
 */

export function useUrlParamWithStore(queryParam, options = {}) {
  const route = useRoute()
  const router = useRouter()

  const getStoreValue = options.get || noop
  const setStoreValue = options.set || noop
  const transform = options.transform || identity
  const initialValue = options.initialValue || null
  const to = options.to || null
  const correctRoute = computed(() => !to || route.name === to)

  // Get and transform the route value
  const getRouteValue = () => {
    const value = route.query[queryParam]
    return value !== undefined ? transform(value) : null
  }

  // Create a computed property that synchronizes the query parameter with the store
  const param = computed({
    get() {
      // If the query parameter exists in the URL, transform and return it, else return the value from the store
      return getRouteValue() ?? getStoreValue()
    },
    set(value) {
      setStoreValue(value)
      // Batch the update to the query parameter in the URL
      batchQueryParamUpdate(router, route, to, [queryParam], [value])
    }
  })

  // Watch the store value directly and update the URL when it changes
  watch(getStoreValue, (newValue) => {
    if (correctRoute.value && newValue !== getRouteValue()) {
      batchQueryParamUpdate(router, route, to, [queryParam], [newValue])
    }
  })

  // Watch the route value and update the store when it changes
  watch(getRouteValue, (newValue) => {
    if (newValue && correctRoute.value && newValue !== getStoreValue()) {
      setStoreValue(newValue)
    }
  })

  // Initialize the store value with the URL value if they are different
  if (getRouteValue() && !isEqual(getRouteValue(), getStoreValue())) {
    setStoreValue(getRouteValue())
  }

  // If the route value is not set and the store value is not set, set the initial value
  if (!getRouteValue() && !getStoreValue() && initialValue) {
    param.value = initialValue
  }

  return param
}
