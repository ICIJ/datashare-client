import keys from 'lodash/keys'
import some from 'lodash/some'
import matches from 'lodash/matches'
import isObject from 'lodash/isObject'
import isArray from 'lodash/isArray'
/**
 * Finds the path of a value within an object.
 *
 * @param {Object|Array} obj - The object or array to search within.
 * @param {Object} valueToFind - The value to find within the object.
 * @returns {string|null} - The path to the value if found, otherwise null.
 */
export function findPath(obj, valueToFind) {
  const match = matches(valueToFind)
  let resultPath = null

  function search(currentObj, currentPath) {
    if (match(currentObj)) {
      resultPath = currentPath
      return true
    }

    if (isObject(currentObj) || isArray(currentObj)) {
      return some(keys(currentObj), key => search(currentObj[key], currentPath ? `${currentPath}.${key}` : key))
    }

    return false
  }

  search(obj, '')
  return resultPath
}

export default findPath
