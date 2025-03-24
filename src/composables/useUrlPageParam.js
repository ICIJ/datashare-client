import { useUrlParam } from '@/composables/useUrlParam'

/**
 * Creates a reactive page number synchronized with the 'page' URL query parameter.
 *
 * @param {number} [max=Infinity] - The maximum page number allowed.
 * @returns {ComputedRef<number>} - A computed reactive reference to the current page number.
 */

export function useUrlPageParam(max = Infinity) {
  return useUrlParam('page', {
    transform: (value) => Math.min(parseInt(value), max),
    initialValue: 1
  })
}
