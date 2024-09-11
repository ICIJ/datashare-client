import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { debounce, identity, noop, castArray, isString, isObject, isFunction, isUndefined } from 'lodash'

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
 */
const applyBatchedUpdates = debounce((router, route) => {
  if (Object.keys(batchedUpdates).length > 0) {
    const newQuery = { ...route.query, ...batchedUpdates }
    router.push({ query: newQuery }) // Apply the batched updates to the query
    batchedUpdates = {} // Reset the batch after applying
  }
}, 50)

/**
 * Function to batch query parameter updates
 * Collects changes and applies them using the debounced function
 *
 * @param {Object} router - The Vue Router instance
 * @param {Object} route - The current Vue Router route instance
 * @param {string} queryParams - The query parameters to update
 * @param {*} value - The new values for each query parameter
 */
function batchQueryParamUpdate(router, route, queryParams, values) {
  queryParams.forEach((param, index) => {
    batchedUpdates[param] = values[index]
  })
  applyBatchedUpdates(router, route)
}

/**
 * Synchronizes a single URL query parameter with Vuex store or a custom getter/setter.
 *
 * This function is designed for handling a single URL query parameter and keeping it
 * in sync with the Vuex store or custom getter/setter. It ensures bidirectional synchronization
 * between the URL and the store or reactive state.
 *
 * @param {string} queryParam - The query parameter to sync.
 * @param {string|Object} getOrGetters - Vuex getter string or custom getter/setter object.
 * @param {string|Function} setMutation - Vuex mutation string or custom setter function.
 * @param {Object} [options={}] - Optional configurations, e.g., a transform function to process the value.
 * @returns {ComputedRef} - A computed reference to the synchronized value.
 */
export function useUrlParamWithStore(queryParam, getOrGetters, setMutation, options = {}) {
  const route = useRoute()
  const router = useRouter()
  const store = useStore()

  // Determine the transform function, defaulting to identity (no transformation)
  const transform = isString(getOrGetters) ? options.transform || identity : getOrGetters.transform || identity

  // Determine the getter function from Vuex or a custom getter
  const getValue = isString(getOrGetters)
    ? () => store.getters[getOrGetters]
    : // Fallback to noop if no getter is provided
      getOrGetters?.get ?? noop

  // Determine the setter function from Vuex mutation or custom setter
  const setValue = isString(setMutation)
    ? (value) => store.commit(setMutation, value)
    : // Do nothing if the setter is not set
      (value) => getOrGetters?.set(value)

  // Create a computed property that synchronizes the query parameter with the Vuex store
  const param = computed({
    get() {
      const value = route.query[queryParam]
      // If the query parameter exists in the URL, transform and return it, else return the value from the store
      return value !== undefined ? transform(value) : getValue()
    },
    set(value) {
      setValue(value)
      // Batch the update to the query parameter in the URL
      batchQueryParamUpdate(router, route, [queryParam], [value])
    }
  })

  // Watch the Vuex store value directly and update the URL when it changes
  watch(getValue, (newValue) => {
    if (newValue !== route.query[queryParam]) {
      batchQueryParamUpdate(router, route, [queryParam], [newValue])
    }
  })

  return param
}

/**
 * Synchronizes multiple URL query parameters with Vuex store or custom getter/setter.
 *
 * This function is designed to handle multiple URL query parameters and keep them
 * in sync with the Vuex store or a custom getter/setter. It ensures bidirectional
 * synchronization between the URL and the store or reactive state for multiple parameters.
 *
 * @param {string[]} queryParams - The query parameters to sync.
 * @param {string|Object} getOrGetters - Vuex getter string or custom getter/setter object.
 * @param {string|Function} setMutation - Vuex mutation string or custom setter function.
 * @param {Object} [options={}] - Optional configurations, e.g., a transform function to process the values.
 * @returns {ComputedRef} - A computed reference to the synchronized values.
 */
export function useUrlParamsWithStore(queryParams, getOrGetters, setMutation, options = {}) {
  const route = useRoute()
  const router = useRouter()
  const store = useStore()

  // Determine the transform function, defaulting to identity (no transformation)
  const transform = isString(getOrGetters) ? options.transform || identity : getOrGetters.transform || identity

  // Determine the getter function from Vuex or a custom getter
  const getValue = isString(getOrGetters)
    ? () => store.getters[getOrGetters]
    : // Fallback to noop if no getter is provided
      getOrGetters.get || noop

  // Determine the setter function from Vuex mutation or custom setter
  const setValue = isString(setMutation)
    ? (values) => store.commit(setMutation, values)
    : (values) => getOrGetters?.set(...values)

  // Create a computed property that synchronizes the query parameters with the Vuex store
  const param = computed({
    get() {
      const values = queryParams.map((param) => route.query[param])
      // If all query parameters exist in the URL, transform and return them, else return the values from the store
      return values.every(isUndefined) ? getValue() : values.map(transform)
    },
    set(values) {
      setValue(values)
      // Batch the update to multiple query parameters in the URL
      batchQueryParamUpdate(router, route, queryParams, values)
    }
  })

  // Watch the Vuex store value directly and update the URL when it changes
  watch(getValue, (newValues) => {
    const queryUpdate = {}
    queryParams.forEach((param, index) => {
      if (newValues[index] !== route.query[param]) {
        queryUpdate[param] = newValues[index]
      }
    })
    batchQueryParamUpdate(router, route, queryParams, newValues)
  })

  return param
}

/**
 * Synchronizes a single URL query parameter with a reactive value.
 *
 * This function is for handling a single URL query parameter and keeping it
 * in sync with a reactive value. It allows for bidirectional synchronization
 * between the URL and the reactive value.
 *
 * @param {string} queryParam - The query parameter to sync.
 * @param {string|Object} [initialOrOptions={}] - Either an initial value or an options object (e.g., get/set methods).
 * @returns {ComputedRef} - A computed reference to the synchronized value.
 */
export function useUrlParam(queryParam, initialOrOptions = {}) {
  const route = useRoute()
  const router = useRouter()

  // Handle both simple initial value or options object
  const options = isObject(initialOrOptions) ? initialOrOptions : { initialValue: initialOrOptions }
  const { initialValue = null, get, set, transform = identity } = options

  // Determine the getter function (from options or fallback to initialValue)
  const getValue = isFunction(get) ? get : () => initialValue

  // Determine the setter function (from options or fallback to updating the query parameter in the URL)
  const setValue = isFunction(set)
    ? (value) => set(transform(value))
    : (value) => batchQueryParamUpdate(router, route, [queryParam], [transform(value)])

  // Create a computed property that synchronizes the query parameter with the reactive value
  const param = computed({
    get() {
      const value = route.query[queryParam]
      // If the query parameter exists in the URL, transform and return it, else return the reactive value
      return isUndefined(value) ? getValue() : transform(value)
    },
    set: setValue
  })

  // Watch the query parameter in the URL and sync it with the reactive value when it changes
  watch(
    () => route.query[queryParam],
    (value) => {
      param.value = isUndefined(value) ? getValue() : transform(value)
    }
  )

  return param
}

/**
 * Synchronizes multiple URL query parameters with reactive values.
 *
 * This function is for handling multiple URL query parameters and keeping them
 * in sync with reactive values. It allows for bidirectional synchronization
 * between the URL and the reactive values for multiple parameters.
 *
 * @param {string[]} queryParams - The query parameters to sync.
 * @param {string|Object} [initialOrOptions={}] - Either an initial value or an options object (e.g., get/set methods).
 * @returns {ComputedRef} - A computed reference to the synchronized values.
 */
export function useUrlParams(queryParams, initialOrOptions = {}) {
  const route = useRoute()
  const router = useRouter()

  // Handle both simple initial value or options object
  const options = isObject(initialOrOptions) ? initialOrOptions : { initialValue: initialOrOptions }
  const { initialValue = null, get, set, transform = identity } = options

  // Determine the getter function (from options or fallback to initialValue)
  const getValue = isFunction(get) ? () => castArray(get()) : () => initialValue

  // Determine the setter function (from options or fallback to updating the query parameters in the URL)
  const setValue = isFunction(set)
    ? (values) => set(castArray(values))
    : (values) => batchQueryParamUpdate(router, route, queryParams, values)

  // Create a computed property that synchronizes the query parameters with the reactive values
  const param = computed({
    get() {
      const values = queryParams.map((param) => route.query[param])
      // If all query parameters exist in the URL, transform and return them, else return the reactive values
      return values.some(isUndefined) ? getValue() : values
    },
    set: setValue
  })

  // Watch the query parameters in the URL and sync them with the reactive values when they change
  watch(
    () => queryParams.map((param) => route.query[param]),
    (newValues) => {
      param.value = newValues.every((v) => v !== undefined) ? newValues.map(transform) : getValue()
    }
  )

  return param
}
