import { defineStore } from 'pinia'
import { reactive, computed, toRaw } from 'vue'
import { castArray, isEmpty, findLastIndex, sortBy } from 'lodash'
import { parseQuery, stringifyQuery } from 'vue-router'

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
   * Turn params string into an array.
   *
   * @private
   * @param {string} params - The search parameters string.
   * @param {string[]} [defaultValue=[]] - The default value for the indices property.
   * @returns {string} The params string with indices split into an array.
   */
  function withIndices(params, defaultValue = []) {
    const searchParams = new URLSearchParams(params.split('?', 2).pop())
    const split = value => value.split(',')
    const indices = castArray(searchParams.get('indices') ?? defaultValue)
      .map(split)
      .flat()
    searchParams.delete('indices')
    indices.forEach(index => searchParams.append('indices', index))
    return searchParams.toString()
  }

  /**
   * Pushes a new set of parameters into the steps array after processing its indices.
   *
   * The function transforms the `indices` property of the parameters by splitting comma-separated values,
   * flattening the array, and then adding the parameters to the steps.
   *
   * @public
   * @param {string} params - The search parameters string.
   */
  function push(params = '') {
    if (endsWith(params)) return
    const searchParams = new URLSearchParams(withIndices(params))
    steps.push([...searchParams.entries()])
  }

  /**
   * Pushes a new set of parameters into the steps array after processing its indices. The function
   * receives a query object and stringifies it before calling the `push` function.
   *
   * @public
   * @param {Object} query - The query object to push.
   */
  function pushSearchQuery(query) {
    return push(stringifyQuery(query))
  }

  /**
   * Checks if a given set of parameters already endsWith in the steps.
   *
   * @private
   * @param {string} params - The parameters to check.
   * @returns {boolean} True if the parameters is the same as the last steps; false otherwise.
   */
  function endsWith(params) {
    const searchParams = new URLSearchParams(withIndices(params))
    const entries = [...searchParams.entries()]
    const lastStep = steps.slice(-1).pop()
    const { $additions, $deletions } = diff(toRaw(lastStep), entries)
    return isEmpty($additions) && isEmpty($deletions)
  }

  /**
   * Computed property that returns the "journey" array. It computes a diff (addition and $deletion)
   * between each step and its previous step using the `diff` utility.
   */
  const journey = computed(() => {
    return steps.reduce((result, step, index) => {
      const query = toRaw(step)
      const previousQuery = index === 0 ? [] : toRaw(steps[index - 1])
      return [...result, { ...diff(previousQuery, query), step }]
    }, [])
  })

  /**
   * Computed property that returns the last step as URLSearchParams. It uses the
   * full journey to make sure each param is added in the right order.
   */
  const endSearchParams = computed(() => {
    const searchParams = new URLSearchParams()
    const lastStep = steps.slice(-1).pop()

    const sortedEntries = sortBy(lastStep, ([key, value]) => {
      return findLastIndex(journey.value, ({ $additions }) => {
        return $additions?.[key]?.includes(value)
      })
    })

    sortedEntries.forEach(([key, value]) => searchParams.append(key, value))

    return uniqueIndicesSearchParam(searchParams)
  })

  /**
   * Computed property that returns the last step as a parsed query object using
   * vue-router `parseQuery` utility.
   *
   * @see https://next.router.vuejs.org/api
   */
  const endSearchQuery = computed(() => {
    return parseQuery(endSearchParams.value.toString())
  })

  /**
   * Removes multiple indices params from the search parameters to transform
   * them into a comma separated string.
   *
   * @private
   * @param {URLSearchParams} searchParams - The search parameters to process.
   * @returns {URLSearchParams} The search parameters with the indices as a single string.
   */
  function uniqueIndicesSearchParam(searchParams) {
    const indices = searchParams.getAll('indices')
    searchParams.set('indices', indices.join(','))
    return searchParams
  }

  /**
   * Returns the last index in the journey where a given parameter's changes include the specified value.
   *
   * The function searches through the journey diff objects looking into `$additions` or `$updates`
   * to determine if the value exists.
   *
   * @public
   * @param {string} param - The parameter to check in the diff object.
   * @param {*} value - The value to search for within the parameter.
   * @returns {number} The last index that meets the condition, or -1 if not found.
   */
  function paramLastIndex(param, value) {
    return findLastIndex(journey.value, ({ $additions }) => {
      return $additions?.[param]?.includes(value)
    })
  }

  return {
    steps,
    push,
    pushSearchQuery,
    journey,
    endSearchParams,
    endSearchQuery,
    paramLastIndex
  }
})
