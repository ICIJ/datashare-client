import { omit } from 'lodash'

/**
 * This navigation guard replace the 'size' query parameter with 'perPage' in the route.
 *
 * @param {Object} to - The target route object.
 * @returns {Object|null} - Returns a new route object with the 'order' query
 */
export const replaceSizeToPerPage = (to) => {
  const { name, params } = to
  const { size = null } = to.query
  // If 'size' query parameter exists, replace it with 'perPage'
  if (size) {
    const query = omit({ ...to.query, perPage: size }, 'size')
    return { name, params, query }
  }
}
