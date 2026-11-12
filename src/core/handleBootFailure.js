import { errorLocation } from '@/router/errorLocation'
import { useAppStore } from '@/store/modules'

/**
 * Handles a failed core boot sequence. On a 401 (unauthenticated in server
 * mode), stores the URL the user originally requested so the router guard
 * can restore it after login, then redirects to the login page. Any other
 * error redirects to the error page, with the status code when the server
 * answered or the `serverUnreachable` reason when it did not.
 * @param {Core} core - The core instance whose `ready` promise rejected.
 * @param {Error} error - The boot error.
 * @returns {Promise} Resolves once the redirect navigation has settled.
 */
export function handleBootFailure(core, error) {
  const unauthorized = error?.response?.status === 401
  // The router uses createWebHashHistory (see Core.js), so the requested
  // route lives entirely in the URL hash (e.g. `#/settings?foo=bar`), not
  // in pathname/search. Slicing off the leading `#` yields the route path
  // the router guard expects (`/settings?foo=bar`).
  const route = window.location.hash.slice(1) || '/'
  if (unauthorized) {
    useAppStore(core.pinia).setRedirectAfterLogin(route)
    core.auth.reset()
  }
  core.useRouter().mount()
  if (unauthorized) {
    return core.router.push({ name: 'login' })
  }
  // history.state must be structured-clonable; axios errors carry non-cloneable
  // functions on `error.config` (transformRequest/transformResponse), so only
  // the message, the status code and a reason are forwarded, not the error itself.
  const message = error?.message ?? String(error)
  const status = error?.response?.status
  const state = status ? { error: message, code: status } : { error: message, reason: 'serverUnreachable' }
  const failedRoute = core.router.resolve(route)
  return core.router.push(errorLocation(failedRoute, state))
}
