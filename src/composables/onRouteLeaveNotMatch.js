import { toValue } from 'vue'

import { onRouteLeaveCondition } from './onRouteLeaveCondition'

/**
 * Registers a navigation guard that executes a callback when leaving the current route with a different name.
 *
 * @param {string} name - The name of the route to not match.
 * @param {Function} callback - The callback function to execute.
 */

export function onRouteLeaveNotMatch(name, callback) {
  onRouteLeaveCondition((to, from) => toValue(name) === null || from.name !== toValue(name), callback)
}
