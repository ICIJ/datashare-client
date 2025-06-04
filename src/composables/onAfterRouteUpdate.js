import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import { onMounted, toRef, watch } from 'vue'

/**
 * Run a callback after the route is updated.
 *
 * @param {function} callback - Function to run after the route updates. Receives `to` and `from`.
 * @param {object} options - Options for the callback.
 * @param {boolean} options.immediate - Whether to run the callback immediately on mount. Defaults to true.
 * @returns {void}
 */
export function onAfterRouteUpdate(callback, { immediate = true } = {}) {
  const route = useRoute()
  let lastRoute = { ...route }

  // Run on mount
  if (immediate) {
    onMounted(() => callback(route, lastRoute))
  }

  // Detect route updates via navigation guard
  onBeforeRouteUpdate((to, from, next) => {
    next(() => {
      queueMicrotask(() => {
        callback(to, from)
        lastRoute = { ...to }
      })
    })
  })

  // Also track reactive route changes (e.g., query or hash updates)
  watch(toRef(route, 'fullPath'), (fullPath) => {
    if (fullPath !== lastRoute.fullPath) {
      queueMicrotask(() => {
        callback(route, lastRoute)
        lastRoute = { ...route }
      })
    }
  })
}
