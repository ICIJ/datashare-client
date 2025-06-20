/**
 * This navigation guard checks the 'order' query parameter in the route.
 *
 * @param {Object} to - The target route object.
 * @returns {Object|null} - Returns a new route object with the 'order' query
 */
export const checkSearchOrder = (to) => {
  const { name, params } = to
  const { order } = to.query

  if (!['asc', 'desc'].includes(order)) {
    const query = { ...to.query, order: 'asc' }
    return { name, params, query }
  }
}
