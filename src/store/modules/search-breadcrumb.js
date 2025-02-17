import { defineStore } from 'pinia'
import { reactive, computed, toRaw } from 'vue'
import { castArray, findLastIndex, flatten } from 'lodash'

import diff from '@/utils/diff'

/**
 * Store for managing search breadcrumb steps.
 *
 * @returns {object} The store instance.
 */
export const useSearchBreadcrumbStore = defineStore('searchBreadcrumb', () => {
  /**
   * Reactive array of query steps.
   * @type {Array<Object>}
   */
  const steps = reactive([])

  /**
   * Pushes a new query into the steps array after processing its indices.
   *
   * The function transforms the `indices` property of the query by splitting comma-separated values,
   * flattening the array, and then adding the query to the steps.
   *
   * @private
   * @param {Object} query - The query object.
   * @param {string|string[]} [query.indices] - The indices associated with the query.
   */
  function pushInternal(query) {
    const split = (value) => value.split(',')
    query.indices = flatten(castArray(query.indices).map(split))
    steps.push(query)
  }

  /**
   * Checks if a given query already exists in the steps.
   *
   * @param {Object} query - The query object to check.
   * @returns {boolean} True if the query exists in the steps; false otherwise.
   */
  function exists(query) {
    return steps.includes(query)
  }

  /**
   * Conditionally pushes a new query to the steps if it does not already exist.
   *
   * @param {Object} query - The query object to push.
   */
  function push(query) {
    if (!exists(query)) {
      pushInternal(query)
    }
  }

  /**
   * Computed property that returns the "journey" array.
   *
   * It computes a diff between each step and its previous step using the `diff` utility.
   *
   * @type {import('vue').ComputedRef<Array<Object>>}
   */
  const journey = computed(() => {
    return steps.reduce((result, step, index) => {
      const query = toRaw(step)
      const previousQuery = index === 0 ? {} : toRaw(steps[index - 1])
      return [...result, { ...diff(previousQuery, query) }]
    }, [])
  })

  /**
   * Returns the last index in the journey where a given parameter's changes include the specified value.
   *
   * The function searches through the journey diff objects looking into `$additions` or `$updates`
   * to determine if the value exists.
   *
   * @param {string} param - The parameter to check in the diff object.
   * @param {*} value - The value to search for within the parameter.
   * @returns {number} The last index that meets the condition, or -1 if not found.
   */
  function paramLastIndex(param, value) {
    return findLastIndex(journey.value, ({ $additions, $updates }) => {
      return $additions?.[param]?.includes(value) || $updates?.[param]?.newValue?.includes(value)
    })
  }

  return {
    steps,
    push,
    exists,
    journey,
    paramLastIndex
  }
})
