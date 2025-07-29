import { toNumber } from 'lodash'
import { computed } from 'vue'

import { setNumberRef } from './useUrlParam'

import { useUrlParam } from '@/composables/useUrlParam'

/**
 * Creates a reactive page number synchronized with the 'from' URL query parameter.
 *
 * This composable function calculates the page number based on the 'from' query parameter and 'perPage' value.
 * It keeps the 'page' and 'from' values in sync, updating one when the other changes.
 *
 * @param {Object} [options] - Configuration options.
 * @param {number} [options.initialValue=1] - The initial value for the 'from' query parameter.
 * @param {number} [options.perPage=25] - The number of items per page.
 * @param {Function|null} [options.to=null] - An optional function to transform the value when updating the URL parameter.
 * @returns {ComputedRef<number>} - A computed reactive reference to the current page number.
 */

export function useUrlPageFrom({ initialValue = 1, perPage = 25, to = null } = {}) {
  const transform = toNumber
  const from = useUrlParam('from', { initialValue, transform, to })
  return computed({
    set: value => setNumberRef(from, (value - 1) * perPage),
    get: () => Math.floor(from.value / perPage) + 1
  })
}
