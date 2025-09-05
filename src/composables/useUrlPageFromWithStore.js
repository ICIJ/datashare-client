import { toNumber } from 'lodash'
import { computed } from 'vue'

import { setNumberRef } from './useUrlParam'
import { useUrlParamWithStore } from './useUrlParamWithStore'

/**
 * Creates a reactive page number synchronized with the 'from' URL query parameter and Vuex store.
 *
 * This composable function calculates the page number based on the 'from' query parameter and 'perPage' value,
 * keeping the page number and 'from' values in sync, and synchronizing with the Vuex store.
 *
 * @param {Object} [options] - Configuration options.
 * @param {number} [options.perPage=25] - The number of items per page.
 * @param {Function|null} [options.to=null] - An optional function to transform the value when updating the URL parameter.
 * @param {Function} [options.get] - Getter function to get the value.
 * @param {Function} [options.set] - Setter function to set the value.
 * @returns {ComputedRef<number>} - A computed reactive reference to the current page number.
 */

export function useUrlPageFromWithStore({ perPage = 25, to = null, get, set, ...options } = {}) {
  const transform = toNumber
  const from = useUrlParamWithStore('from', { get, set, to, transform, ...options })
  return computed({
    set: value => setNumberRef(from, (value - 1) * perPage),
    get: () => Math.floor(from.value / perPage) + 1
  })
}
