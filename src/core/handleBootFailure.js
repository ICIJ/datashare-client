import { useAppStore } from '@/store/modules'

/**
 * Handles a failed core boot sequence. On a 401 (unauthenticated in server
 * mode), stores the URL the user originally requested so the router guard
 * can restore it after login, then redirects to the login page. Any other
 * error redirects to the error page.
 * @param {import('@/core/Core').default} core - The core instance whose `ready` promise rejected.
 * @param {Error} error - The boot error.
 * @returns {Promise} Resolves once the redirect navigation has settled.
 */
export function handleBootFailure(core, error) {
  const unauthorized = error?.response?.status === 401
  if (unauthorized) {
    const { pathname, search, hash } = window.location
    useAppStore(core.pinia).setRedirectAfterLogin(pathname + search + hash)
    core.auth.reset()
  }
  core.useRouter().mount()
  if (unauthorized) {
    return core.router.push({ name: 'login' })
  }
  return core.router.push({ name: 'error', state: { error } })
}
