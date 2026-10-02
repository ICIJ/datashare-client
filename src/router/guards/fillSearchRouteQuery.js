import isUndefined from 'lodash/isUndefined'
import omitBy from 'lodash/omitBy'

import { useSearchStore } from '@/store/modules'

/**
 * This navigation guard adds the search params missing from the route query (sort, perPage...)
 * with their value from the store. Normalizing the URL here, with a redirect, adds no history
 * entry: if the view mirrored its state into the URL after landing, the back button would lead
 * back to the very same page.
 *
 * @param {Object} to - The target route object.
 * @returns {Object|null} - Returns a new route object with the missing query parameters.
 */
export const fillSearchRouteQuery = (to) => {
  const { name, params } = to
  const query = omitBy({ ...useSearchStore().toRouteQuery, ...to.query }, isUndefined)
  if (Object.keys(query).some(key => !(key in to.query))) {
    return { name, params, query }
  }
}
