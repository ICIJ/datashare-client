const STORAGE_KEY = 'ds_redirect_sources'

function readSources() {
  const stored = window.sessionStorage.getItem(STORAGE_KEY)
  return JSON.parse(stored ?? '[]')
}

/**
 * Remembers the URL a guard redirected away from. Vue Router pushes a guard
 * redirect triggered by a URL change, so the browser history keeps that URL.
 * @param {import('vue-router').RouteLocationNormalized} to
 */
export function recordRedirectSource(to) {
  const path = to.redirectedFrom?.fullPath
  if (!path) {
    return
  }
  const sources = new Set(readSources())
  sources.add(path)
  const serialized = JSON.stringify([...sources])
  window.sessionStorage.setItem(STORAGE_KEY, serialized)
}

/**
 * Going back to a redirect source only runs its redirect again.
 * @param {string} path
 * @returns {boolean}
 */
export function isRedirectSource(path) {
  return readSources().includes(path)
}
