import { toValue } from 'vue'

import { onRouteLeaveCondition } from './onRouteLeaveCondition'

/**
 * Registers a navigation guard that executes a callback when leaving the current route with a matching name.
 *
 * @param {string} name - The name of the current route to match.
 * @param {Function} callback - The callback function to execute.
 */

export function onRouteLeaveMatch(name, callback) {
  onRouteLeaveCondition((to, from) => toValue(name) === null || from.name === toValue(name), callback)
}
