import { noop } from 'lodash'
import { useRoute } from 'vue-router'

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
