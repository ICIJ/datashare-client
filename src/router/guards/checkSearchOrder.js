import { useSearchStore } from '@/store/modules'

/**
 * This navigation guard checks the 'order' query parameter in the route.
 * A missing or invalid order falls back to the one from the search settings.
 *
 * @param {Object} to - The target route object.
 * @returns {Object|null} - Returns a new route object with the 'order' query
 */
export const checkSearchOrder = (to) => {
  const { name, params } = to
  const { order } = to.query

  if (!['asc', 'desc'].includes(order)) {
    const query = { ...to.query, order: useSearchStore().orderBy === 'asc' ? 'asc' : 'desc' }
    return { name, params, query }
  }
}
