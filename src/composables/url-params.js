import { computed, watch, ref } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router'
import { useStore } from 'vuex'
import { compact, debounce, identity, noop, isEqual, isString, isObject, isUndefined, toNumber } from 'lodash'

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
function batchQueryParamUpdate(router, route, to = null, queryParams = [], values = {}) {
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
function setNumberRef(reference, value) {
  return !eqNumber(reference.value, value) && (reference.value = value)
}

/**
 * Executes a callback function when the current route matches the specified name.
 *
 * This composable returns a function that, when called, checks if the current route's name matches the provided name.
 * If the route matches (or if no name is specified), it invokes the provided callback with the given arguments.
 *
 * @param {string|null} [name=null] - The name of the route to match. If null, the callback is always executed.
 * @param {Function} [callback=() => {}] - The callback function to execute when the route matches.
 * @returns {Function} - A function that accepts any arguments and invokes the callback if the route matches
 */
export function whenIsRoute(name = null, callback = noop) {
  const route = useRoute()
  return (...args) => {
    if (!name || route.name === name) {
      callback.apply(null, args)
    }
  }
}

/**
 * Executes a callback function when the current route doesn't match the specified name.
 *
 * This composable returns a function that, when called, checks if the current route's still name matches the provided name.
 * If the route doesn't match (and if no name is specified), it invokes the provided callback with the given arguments.
 *
 * @param {string|null} [name=null] - The name of the route to match. If null, the callback is never executed.
 * @param {Function} [callback=() => {}] - The callback function to execute when the route doesn't match.
 * @returns {Function} - A function that accepts any arguments and invokes the callback if the route doesn't match
 */
export function whenDifferentRoute(name = null, callback = noop, to = null) {
  const route = to ?? useRoute()
  return (...args) => {
    if (name && route.name !== name) {
      callback.apply(null, args)
    }
  }
}

/**
 * Registers a navigation guard that executes a callback when the provided condition function returns true during a route update.
 *
 * @param {Function} condition - A function that receives (to, from) and returns a boolean.
 * @param {Function} callback - The callback function to execute when the condition is true.
 */
export function onRouteUpdateCondition(condition, callback) {
  onBeforeRouteUpdate((to, from) => {
    if (condition(to, from)) {
      callback(to, from)
    }
  })
}

/**
 * Registers a navigation guard that executes a callback when updating to a route with a matching name.
 *
 * @param {string} name - The name of the target route to match.
 * @param {Function} callback - The callback function to execute.
 */
export function onRouteUpdateMatch(name, callback) {
  onRouteUpdateCondition((to, from) => name && to.name === name, callback)
}

/**
 * Registers a navigation guard that executes a callback when updating to a route with a different name.
 *
 * @param {string} name - The name of the route to not match.
 * @param {Function} callback - The callback function to execute.
 */
export function onRouteUpdateNotMatch(name, callback) {
  onRouteUpdateCondition((to, from) => name && to.name !== name, callback)
}

/**
 * Registers a navigation guard that executes a callback when the provided condition function returns true during a route leave.
 *
 * @param {Function} condition - A function that receives (to, from) and returns a boolean.
 * @param {Function} callback - The callback function to execute when the condition is true.
 */
export function onRouteLeaveCondition(condition, callback) {
  onBeforeRouteLeave((to, from) => {
    if (condition(to, from)) {
      callback(to, from)
    }
  })
}

/**
 * Registers a navigation guard that executes a callback when leaving the current route with a matching name.
 *
 * @param {string} name - The name of the current route to match.
 * @param {Function} callback - The callback function to execute.
 */
export function onRouteLeaveMatch(name, callback) {
  onRouteLeaveCondition((to, from) => name && from.name === name, callback)
}

/**
 * Registers a navigation guard that executes a callback when leaving the current route with a different name.
 *
 * @param {string} name - The name of the route to not match.
 * @param {Function} callback - The callback function to execute.
 */
export function onRouteLeaveNotMatch(name, callback) {
  onRouteLeaveCondition((to, from) => name && from.name !== name, callback)
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
  const to = isString(getOrGetters) ? options.to : getOrGetters.to

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
  const to = isString(getOrGetters) ? options.to : getOrGetters.to

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
    const values = queryParams.map((param) => route.query[param])
    // If all query parameters exist in the URL, transform and return them, else return the reactive values
    return (values.some(isUndefined) ? initialValue : values).map(transform)
  }

  // Determine the setter function (from options or fallback to updating the query parameters in the URL)
  const set = (values) => batchQueryParamUpdate(router, route, to, queryParams, values.map(transform))

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

/**
 * Creates a reactive page number synchronized with the 'from' URL query parameter.
 *
 * This composable function calculates the page number based on the 'from' query parameter and 'perPage' value.
 * It keeps the 'page' and 'from' values in sync, updating one when the other changes.
 *
 * @param {Object} [options] - Configuration options.
 * @param {number} [options.initialValue=1] - The initial value for the 'from' query parameter.
 * @param {number} [options.perPage=25] - The number of items per page.
 * @param {Function|null} [options.to=null] - An optional function to transform the value when updating the URL parameter.
 * @returns {ComputedRef<number>} - A computed reactive reference to the current page number.
 */
export function useUrlPageFrom({ initialValue = 1, perPage = 25, to = null } = {}) {
  const transform = toNumber
  const from = useUrlParam('from', { initialValue, transform, to })
  return computed({
    set: (value) => setNumberRef(from, (value - 1) * perPage),
    get: () => Math.floor(from.value / perPage) + 1
  })
}

/**
 * Creates a reactive page number synchronized with the 'from' URL query parameter and Vuex store.
 *
 * This composable function calculates the page number based on the 'from' query parameter and 'perPage' value,
 * keeping the page number and 'from' values in sync, and synchronizing with the Vuex store.
 *
 * @param {Object} [options] - Configuration options.
 * @param {number} [options.perPage=25] - The number of items per page.
 * @param {Function|null} [options.to=null] - An optional function to transform the value when updating the URL parameter.
 * @param {string|Function} [options.get] - A Vuex getter name or a custom getter function to get the value.
 * @param {string|Function} [options.set] - A Vuex mutation name or a custom setter function to set the value.
 * @returns {ComputedRef<number>} - A computed reactive reference to the current page number.
 */
export function useUrlPageFromWithStore({ perPage = 25, to = null, get, set, ...options } = {}) {
  const store = useStore()
  const transform = toNumber
  const getOrGetter = isString(get) ? () => store.getter[get] : get
  const setOrSetter = isString(set) ? (value) => store.commit(set, value) : set
  const from = useUrlParamWithStore('from', { get: getOrGetter, set: setOrSetter, to, transform, ...options })
  return computed({
    set: (value) => setNumberRef(from, (value - 1) * perPage),
    get: () => Math.floor(from.value / perPage) + 1
  })
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
