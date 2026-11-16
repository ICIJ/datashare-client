// Vue Router keeps a segment it cannot decode (e.g. a lone `%`) as is, so do the same.
function decodeSegment(segment) {
  try {
    return decodeURIComponent(segment)
  }
  catch {
    return segment
  }
}

/**
 * Error page props for a failed request: the status code when the server
 * answered, the `serverUnreachable` reason when it did not.
 * history.state must be structured-clonable; axios errors carry non-cloneable
 * functions on `error.config` (transformRequest/transformResponse), so only
 * the message, the status code and a reason are forwarded, not the error itself.
 * @param {Error} error - The failed request error.
 * @returns {object}
 */
export function errorStateFrom(error) {
  const message = error?.message ?? String(error)
  const status = error?.response?.status
  const state = { error: message }
  // Axios sets `request` once a request was sent: without a response, the server never answered.
  const isUnanswered = !!error?.request && !status
  if (status) {
    state.code = status
  }
  else if (isUnanswered) {
    state.reason = 'serverUnreachable'
  }
  return state
}

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
  const pathMatch = segments.map(decodeSegment)
  const blank = {
    title: undefined,
    description: undefined,
    error: undefined,
    code: undefined,
    details: undefined,
    reason: undefined
  }
  const nextState = { ...blank, ...state }
  return { name: 'error', params: { pathMatch }, query, hash, state: nextState, replace: true }
}
