import { noop } from 'lodash'
import { useRoute } from 'vue-router'

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
