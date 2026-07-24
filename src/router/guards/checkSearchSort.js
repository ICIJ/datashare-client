import { find } from 'lodash'

import settings from '@/utils/settings'

/**
 * This navigation guard replaces a unique sort query parameter with a pair of sort and order query parameters
 * based on the search properties. This way we can ensure retro-compatibility with
 * the former sort query parameter which used to contain both the sort field and the order.
 *
 * @param {Object} to - The target route object.
 * @returns {Object|null} - Returns a new route object with the updated query parameters.
 */
export const checkSearchSort = (to) => {
  const { name, params } = to
  const { property: sort = null, desc } = find(settings.legacySearchSortFields, { name: to.query.sort }) ?? {}
  const order = desc ? 'desc' : 'asc'
  // Only redirect if the sort field is found and the query would actually change.
  // Without the second check, a legacy name that maps to the same property (e.g. "path" → "path")
  // would redirect to an identical URL, causing an infinite navigation loop.
  if (sort && (sort !== to.query.sort || order !== to.query.order)) {
    const query = { ...to.query, sort, order }
    return { name, params, query }
  }
}
