import { onRouteUpdateCondition } from './onRouteUpdateCondition'

/**
 * Registers a navigation guard that executes a callback when updating to a route with a different name.
 *
 * @param {string} name - The name of the route to not match.
 * @param {Function} callback - The callback function to execute.
 */

export function onRouteUpdateNotMatch(name = null, callback) {
  onRouteUpdateCondition((to) => name === null || to.name !== name, callback)
}
