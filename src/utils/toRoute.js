import { isString, isObject } from 'lodash'
import { toValue } from 'vue'

/**
 * This function takes a route name (string) or a route object and returns
 * a standardized route object with `name`, `query`, and `params` properties.
 * @param {string|Object} to - The route name or route object.
 * @returns {Object} - A route object with `name`, `query`, and `params` properties.
 */
export function toRoute(to) {
  const value = toValue(to)
  const query = {}
  const params = {}

  if (isString(value)) {
    return { name: value, query, params }
  }

  if (isObject(value) && value.name) {
    return { query, params, ...value }
  }

  return { query, params }
}
