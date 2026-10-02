import { useRouter } from 'vue-router'

/**
 * Push a freshly stamped route to the first page of the search, so the search
 * always resubmits even when the query and filters haven't changed.
 *
 * @param {object} searchStore - The search store instance to push a route for.
 * @returns {{ refreshRouteFromStart: Function }}
 */
export function useRefreshRouteFromStart(searchStore) {
  const router = useRouter()

  function refreshRouteFromStart() {
    searchStore.refreshStamp()
    const query = { ...searchStore.toRouteQueryWithStamp, from: 0 }
    return router.push({ name: 'search', query })
  }

  return { refreshRouteFromStart }
}
