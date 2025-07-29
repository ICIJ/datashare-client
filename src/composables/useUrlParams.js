import { isObject, identity, isUndefined } from 'lodash'
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { whenIsRoute } from './whenIsRoute'

import { batchQueryParamUpdate } from '@/composables/useUrlParam'

/**
 * Synchronizes multiple URL query parameters with reactive values.
 *
 * This function is for handling multiple URL query parameters and keeping them
 * in sync with reactive values. It allows for bidirectional synchronization
 * between the URL and the reactive values for multiple parameters.
 *
 * @param {string[]} queryParams - The query parameters to sync.
 * @param {string|Object} [initialOrOptions={}] - Either an initial value or an options object (e.g., initialValue/transform methods).
 * @returns {ComputedRef} - A computed reference to the synchronized values.
 */

export function useUrlParams(queryParams, initialOrOptions = {}) {
  const route = useRoute()
  const router = useRouter()

  // Handle both simple initial value or options object
  const options = isObject(initialOrOptions) ? initialOrOptions : { initialValue: initialOrOptions }
  const { initialValue = null, transform = identity, to = null } = options

  // Determine the getter function (from options or fallback to initialValue)
  const get = () => {
    const values = queryParams.map(param => route.query[param])
    // If all query parameters exist in the URL, transform and return them, else return the reactive values
    return (values.some(isUndefined) ? initialValue : values).map(transform)
  }

  // Determine the setter function (from options or fallback to updating the query parameters in the URL)
  const set = values => batchQueryParamUpdate(router, route, to, queryParams, values.map(transform))

  // Create a computed property that synchronizes the query parameters with the reactive values
  const param = computed({ get, set })

  // Watch the query parameters in the URL and sync them with the reactive values when they change
  watch(
    get,
    whenIsRoute(to, (newValues) => {
      param.value = newValues.some(isUndefined) ? get() : newValues.map(transform)
    })
  )

  return param
}
