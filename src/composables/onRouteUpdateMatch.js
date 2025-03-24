import { onRouteUpdateCondition } from './onRouteUpdateCondition'

/**
 * Registers a navigation guard that executes a callback when updating to a route with a matching name.
 *
 * @param {string} name - The name of the target route to match.
 * @param {Function} callback - The callback function to execute.
 */

export function onRouteUpdateMatch(name = null, callback) {
  onRouteUpdateCondition((to) => name === null || to.name === name, callback)
}
