import { computed, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import {
  compact,
  debounce,
  identity,
  noop,
  castArray,
  isEqual,
  isString,
  isObject,
  isFunction,
  isUndefined,
  toNumber
} from 'lodash'

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
 * @param {String[]} queryParams - The query parameters to update
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

  // Determine the transform function, defaulting to identity (no transformation)
  const transform = isString(getOrGetters) ? options.transform || identity : getOrGetters.transform || identity

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
      batchQueryParamUpdate(router, route, [queryParam], [value])
    }
  })

  // Watch the Vuex store value directly and update the URL when it changes
  watch(getValue, (newValue) => {
    if (newValue !== getRouteValue()) {
      batchQueryParamUpdate(router, route, [queryParam], [newValue])
    }
  })

  // Initialize the store value with the URL value if they are different
  if (getRouteValue() && !isEqual(getRouteValue(), getValue())) {
    setValue(getRouteValue())
  }

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

  // Determine the getter function from Vuex or a custom getter
  const getValue = isString(getOrGetters)
    ? () => store.getters[getOrGetters]
    : // Fallback to noop if no getter is provided
      getOrGetters.get || noop

  // Determine the setter function from Vuex mutation or custom setter
  const setValue = isString(setMutation)
    ? (values) => store.commit(setMutation, values)
    : (values) => getOrGetters?.set(...values)

  // Determine the transform function, defaulting to identity (no transformation)
  const transform = isString(getOrGetters) ? options.transform || identity : getOrGetters.transform || identity

  // Get and transform the route value
  const getRouteValue = () => {
    const values = queryParams.map((param) => route.query[param])
    // If all query parameters exist in the URL, transform and return them, else return the values from the store
    return values.every(isUndefined) ? null : compact(values).map(transform)
  }

  // Create a computed property that synchronizes the query parameters with the Vuex store
  const param = computed({
    get() {
      return getRouteValue() ?? getValue()
    },
    set(values) {
      setValue(values)
      // Batch the update to multiple query parameters in the URL
      batchQueryParamUpdate(router, route, queryParams, values)
    }
  })

  // Watch the Vuex store value directly and update the URL when it changes
  watch(getValue, (newValues) => {
    batchQueryParamUpdate(router, route, queryParams, newValues)
  })

  // Initialize the store value with the URL value if they are different
  if (getRouteValue() && getRouteValue() !== getValue()) {
    setValue(getRouteValue())
  }

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
 * @param {string|Object} [initialOrOptions={}] - Either an initial value or an options object (e.g., initialValue/transform methods).
 * @returns {ComputedRef} - A computed reference to the synchronized value.
 */
export function useUrlParam(queryParam, initialOrOptions = {}) {
  const route = useRoute()
  const router = useRouter()

  // Handle both simple initial value or options object
  const options = isObject(initialOrOptions) ? initialOrOptions : { initialValue: initialOrOptions }
  const { initialValue = null, transform = identity } = options

  const get = () => transform(route.query[queryParam] ?? initialValue)
  const set = (value) => batchQueryParamUpdate(router, route, [queryParam], [transform(value)])

  // Create a computed property that synchronizes the query parameter with the reactive value
  const param = computed({ get, set })

  // Watch the query parameter in the URL and sync it with the reactive value when it changes
  watch(get, (value) => {
    param.value = value
  })

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

/**
 * Creates a reactive page number synchronized with the 'from' URL query parameter.
 *
 * This composable function calculates the page number based on the 'from' query parameter and 'perPage' value.
 * It keeps the 'page' and 'from' values in sync, updating one when the other changes.
 *
 * @param {Object} [options] - Configuration options.
 * @param {number} [options.initialValue=1] - The initial value for 'from' query parameter.
 * @param {number} [options.perPage=25] - The number of items per page.
 * @returns {Ref<number>} - A reactive reference to the current page number.
 */
export function useUrlPageFrom({ initialValue = 1, perPage = 25 } = {}) {
  const from = useUrlParam('from', { initialValue, transform: toNumber })
  const page = ref((initialValue - 1) * perPage)
  // Check if two values are equal numbers
  const eqNumber = (a, b) => toNumber(a) === toNumber(b)
  // Helper function to set the value if it has changed
  const set = (reference, value) => !eqNumber(reference.value, value) && (reference.value = value)
  // Update the page number when the 'from' value changes
  watch(from, (value) => set(page, Math.floor(value / perPage) + 1), { immediate: true })
  // Update the 'from' value when the page number changes
  watch(page, (value) => set(from, (value - 1) * perPage))
  return page
}

/**
 * Replaces a URL query parameter with a new one, optionally transforming the value.
 *
 * This function checks if the 'from' query parameter exists in the current route's query.
 * If it does, it removes 'from' and adds 'to' to the query parameters.
 * - If 'to' is a string, it assigns the value of 'from' to the new parameter named 'to'.
 * - If 'to' is a function, it calls the function with the value of 'from' and merges the returned object into the query.
 *
 * @param {Object} options - The options object.
 * @param {string} options.from - The name of the query parameter to replace.
 * @param {string|Function} options.to - The name of the new query parameter, or a function that returns an object of new parameters.
 * @returns {void}
 *
 * @example
 * // Simple replacement
 * replaceUrlParam({ from: 'size', to: 'perPage' })
 *
 * // Transformation to multiple parameters
 * replaceUrlParam({
 *   from: 'sort',
 *   to: (value) => ({
 *     sortBy: value.toLowerCase(),
 *     order: 'desc',
 *   }),
 * })
 */
export function replaceUrlParam({ from, to }) {
  const route = useRoute()
  const router = useRouter()

  const apply = () => {
    const value = route.query[from]

    // Check if the 'from' query parameter exists
    if (value === undefined) {
      return
    }

    const query = { ...route.query }
    // Remove the old parameter
    delete query[from]

    if (typeof to === 'string') {
      // Redirect to the new route with updated query parameters
      router.replace({ query: { ...query, [to]: value } })
    }

    if (typeof to === 'function') {
      // Apply the transformation function to get new parameters
      const transformedParams = to(value)
      // Ensure that transformedParams is an object
      if (transformedParams && typeof transformedParams === 'object') {
        router.replace({ query: { ...query, ...transformedParams } })
      }
    }
  }

  apply()
  // We don't use the onBeforeRouteUpdate guard because for some reasons
  // it is not triggered when used in tests.
  watch(() => route.query, apply)
}
