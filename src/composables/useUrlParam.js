import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { debounce, identity, isObject, toNumber } from 'lodash'

import { whenIsRoute } from '@/composables/whenIsRoute'

/**
 * Global object to store batched updates
 * Used to collect updates before applying them all at once
 */
let batchedUpdates = {}

/**
 * Debounced function to apply batched updates to the query parameters
 * Updates are only applied after a 50ms delay to group multiple updates together.
 *
 * @param {Object} router - The Vue Router instance
 * @param {Object} route - The current Vue Router route instance
 * @param {String} to - The name of the target route
 */
const applyBatchedUpdates = debounce((router, route, to) => {
  if (Object.keys(batchedUpdates).length > 0) {
    const newQuery = { ...route.query, ...batchedUpdates }
    // Apply the batched updates to the query
    if (!to || route.name === to) {
      router.push({ query: newQuery })
    } else {
      router.push({ name: to, query: newQuery })
    }
    // Reset the batch after applying
    batchedUpdates = {}
  }
}, 50)

/**
 * Function to batch query parameter updates
 * Collects changes and applies them using the debounced function
 *
 * @param {Object} router - The Vue Router instance
 * @param {Object} route - The current Vue Router route instance
 * @param {String} to - The name of the target route
 * @param {String[]} queryParams - The query parameters to update
 * @param {*} value - The new values for each query parameter
 */
export function batchQueryParamUpdate(router, route, to = null, queryParams = [], values = {}) {
  queryParams.forEach((param, index) => {
    batchedUpdates[param] = values[index]
  })
  applyBatchedUpdates(router, route, to)
}

/**
 * Checks if two values are equal when converted to numbers.
 *
 * @param {*} a - The first value to compare.
 * @param {*} b - The second value to compare.
 * @returns {boolean} - True if both values are equal when converted to numbers, false otherwise.
 */
function eqNumber(a, b) {
  return toNumber(a) === toNumber(b)
}

/**
 * Sets the value of a reactive reference if the new value is different when converted to a number.
 *
 * @param {Ref} reference - The reactive reference to set.
 * @param {*} value - The new value to set.
 * @returns {boolean} - True if the value was updated, false otherwise.
 */
export function setNumberRef(reference, value) {
  return !eqNumber(reference.value, value) && (reference.value = value)
}

/**
 * Synchronizes a single URL query parameter with a reactive value.
 *
 * This function is for handling a single URL query parameter and keeping it
 * in sync with a reactive value. It allows for bidirectional synchronization
 * between the URL and the reactive value.
 *
 * @param {string} queryParam - The query parameter to sync.
 * @param {string|Object} [initialOrOptions={}] - Either an initial value or an options object (e.g., initialValue/transform methods).
 * @returns {ComputedRef} - A computed reference to the synchronized value.
 */
export function useUrlParam(queryParam, initialOrOptions = {}) {
  const route = useRoute()
  const router = useRouter()

  // Handle both simple initial value or options object
  const options = isObject(initialOrOptions) ? initialOrOptions : { initialValue: initialOrOptions }
  const { initialValue = null, transform = identity, to = null } = options

  const get = () => transform(route.query[queryParam] ?? initialValue)
  const set = (value) => batchQueryParamUpdate(router, route, to, [queryParam], [transform(value)])

  // Create a computed property that synchronizes the query parameter with the reactive value
  const param = computed({ get, set })

  // Watch the query parameter in the URL and sync it with the reactive value when it changes
  watch(
    get,
    whenIsRoute(to, (value) => {
      param.value = value
    })
  )

  return param
}
