import { noop, identity, isUndefined, compact } from 'lodash'
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { whenIsRoute } from './whenIsRoute'

import { batchQueryParamUpdate } from '@/composables/useUrlParam'

/**
 * Synchronizes multiple URL query parameters with Vuex store or custom getter/setter.
 *
 * This function is designed to handle multiple URL query parameters and keep them
 * in sync with the Vuex store or a custom getter/setter. It ensures bidirectional
 * synchronization between the URL and the store or reactive state for multiple parameters.
 *
 * @param {string[]} queryParams - The query parameters to sync.
 * @param {Object} [options={}] - Configurations, e.g., a transform function to process the values.
 * @param {Function} [options.get] - Getter function to retreive the values
 * @param {Function} [options.set] - Setter function to update the values
 * @returns {ComputedRef} - A computed reference to the synchronized values.
 */

export function useUrlParamsWithStore(queryParams, options = {}) {
  const route = useRoute()
  const router = useRouter()

  const getValue = options.get || noop
  const setValue = options.set || noop
  const transform = options.transform || identity
  const to = options.to || null

  // Get and transform the route value
  const getRouteValues = () => {
    const values = queryParams.map((param) => route.query[param])
    // If all query parameters exist in the URL, transform and return them, else return the values from the store
    return values.every(isUndefined) ? null : values.map(transform)
  }

  // Create a computed property that synchronizes the query parameters with the Vuex store
  const param = computed({
    get() {
      return getRouteValues() ?? getValue()
    },
    set(values) {
      setValue(...values)
      // Batch the update to multiple query parameters in the URL
      batchQueryParamUpdate(router, route, to, queryParams, values)
    }
  })

  // Watch the Vuex store value directly and update the URL when it changes
  watch(
    getValue,
    whenIsRoute(to, (values) => {
      batchQueryParamUpdate(router, route, to, queryParams, values)
    })
  )

  // Initialize the store value with the URL value if they are different
  if (getRouteValues() && getRouteValues() !== getValue()) {
    setValue(...getRouteValues())
  }

  return param
}
