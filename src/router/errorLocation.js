/**
 * Builds a location to the catch-all error route that keeps the URL of the
 * failed route, so reloading the page retries it instead of landing on `#/`.
 * The failed route is replaced in the history: going back to it would only
 * fail again and redirect to the error page in a loop.
 * @param {import('vue-router').RouteLocation} route - The route that failed.
 * @param {object} [state={}] - Error page props stored in `history.state`.
 * @returns {import('vue-router').RouteLocationRaw}
 */
export function errorLocation({ path, query, hash }, state = {}) {
  // Route params are decoded, while `path` is encoded: decode each segment
  // so the router does not encode it twice.
  const segments = path.substring(1).split('/')
  const pathMatch = segments.map(decodeURIComponent)
  return { name: 'error', params: { pathMatch }, query, hash, state, replace: true }
}
