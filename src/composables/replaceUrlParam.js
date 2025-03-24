import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

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
