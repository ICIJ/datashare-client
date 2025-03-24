import { onBeforeRouteUpdate } from 'vue-router'

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
