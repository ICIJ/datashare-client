import { difference, isEqual, isObject, isArray, intersection, pick } from 'lodash'

/**
 * Compares two objects and returns the differences in additions, deletions, and updates.
 * @param {Object} previousObj - The original object.
 * @param {Object} obj - The new object.
 * @returns {Object} An object containing additions, deletions, and updates.
 */
export default function diff(previousObj, obj) {
  const oldKeys = Object.keys(previousObj)
  const newKeys = Object.keys(obj)

  const additionsKeys = difference(newKeys, oldKeys)
  const deletionsKeys = difference(oldKeys, newKeys)
  const updatesKeys = getUpdatedKeys(previousObj, obj, oldKeys, newKeys)

  return {
    $additions: pick(obj, additionsKeys),
    $deletions: pick(previousObj, deletionsKeys),
    $updates: getUpdates(previousObj, obj, updatesKeys)
  }
}

/**
 * Identifies keys that have been updated between two objects.
 * @param {Object} previousObj - The original object.
 * @param {Object} obj - The new object.
 * @param {Array} oldKeys - The keys from the original object.
 * @param {Array} newKeys - The keys from the new object.
 * @returns {Array} An array of keys that have different values between the two objects.
 */
function getUpdatedKeys(previousObj, obj, oldKeys, newKeys) {
  const commonKeys = intersection(oldKeys, newKeys)
  return commonKeys.filter((key) => !isEqual(previousObj[key], obj[key]))
}

/**
 * Constructs the updates object by analyzing the differences between the values of the updated keys.
 * @param {Object} previousObj - The original object.
 * @param {Object} obj - The new object.
 * @param {Array} updatesKeys - The keys that have different values between the two objects.
 * @returns {Object} An object representing the updates, with differences in arrays or nested objects.
 */
function getUpdates(previousObj, obj, updatesKeys) {
  return updatesKeys.reduce((updates, key) => {
    const oldValue = previousObj[key]
    const newValue = obj[key]

    if (isArray(oldValue) && isArray(newValue)) {
      updates[key] = getArrayDifferences(oldValue, newValue)
    } else if (isObject(oldValue) && isObject(newValue)) {
      const nestedDiff = diff(oldValue, newValue)
      if (hasDifferences(nestedDiff)) {
        updates[key] = nestedDiff
      }
    } else {
      updates[key] = { oldValue, newValue }
    }

    return updates
  }, {})
}

/**
 * Gets the differences between two arrays, identifying additions and deletions.
 * @param {Array} oldArray - The original array.
 * @param {Array} newArray - The new array.
 * @returns {Object} An object containing additions and deletions in the array.
 */
function getArrayDifferences(oldArray, newArray) {
  const arrayAdditions = difference(newArray, oldArray)
  const arrayDeletions = difference(oldArray, newArray)

  const result = {}
  if (arrayAdditions.length) result.$additions = arrayAdditions
  if (arrayDeletions.length) result.$deletions = arrayDeletions

  return result
}

/**
 * Checks if the nested differences object has any additions, deletions, or updates.
 * @param {Object} nestedDiff - The object representing nested differences.
 * @returns {boolean} True if there are any differences, false otherwise.
 */
function hasDifferences({ additions = {}, deletions = {}, updates = {} }) {
  return !!(Object.keys(additions) || Object.keys(deletions) || Object.keys(updates))
}
