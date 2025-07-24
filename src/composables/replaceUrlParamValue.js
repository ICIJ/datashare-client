import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/**
 * Replaces a URL query parameter value with a new one.
 *
 * @param {Object} options - The options object.
 * @param {string} options.name - The name of the query parameter to replace.
 * @param {string} options.oldValue - The value to be replaced.
 * @param {string} options.newValue - The new value to set for the query parameter
 *
 * @example
 * // Simple replacement
 * replaceUrlParamValue({ name: 'tab', oldValue: 'extracted-text', newValue: 'text' })
 */
export function replaceUrlParamValue({ name, oldValue, newValue }) {
  const route = useRoute()
  const router = useRouter()

  const apply = () => {
    const currentValue = route.query[name]

    // Check if the current value matches the old value
    if (currentValue !== oldValue) {
      return
    }

    const query = { ...route.query }
    // Update the query parameter with the new value
    query[name] = newValue

    // Redirect to the new route with updated query parameters
    router.replace({ query })
  }

  // Watch for changes in the route and apply the replacement
  watch(() => route.query[name], apply, { immediate: true })
}
