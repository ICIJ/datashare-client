import { createRouter, createMemoryHistory } from 'vue-router'

import { routes } from '@/router/index'

// Regression guard: the search route's views are heavy (facets, filters,
// document viewer) and were deliberately made lazy to keep them out of the
// core bundle (see todo.md §3 "Router"). This asserts they stay dynamic
// `import()`s rather than checking bundle size, so an eager import
// regression fails fast in CI instead of only showing up in a bundle
// analyzer weeks later.
function findRoute(routes, name) {
  for (const route of routes) {
    if (route.name === name) return route
    if (route.children) {
      const found = findRoute(route.children, name)
      if (found) return found
    }
  }
  return null
}

// Vitest's SSR transform rewrites `import(...)` to `__vite_ssr_dynamic_import__(...)`
// before this file ever sees it, so match both — the real build (which this
// guards against) always emits the plain `import(` form.
function isDynamicImport(loader) {
  return typeof loader === 'function' && /import\(|dynamic_import/.test(loader.toString())
}

describe('router routes', () => {
  it('lazy-loads the search route views', () => {
    const search = findRoute(routes, 'search')
    expect(isDynamicImport(search.components.default)).toBe(true)
    expect(isDynamicImport(search.components.filters)).toBe(true)
    expect(isDynamicImport(search.components.settings)).toBe(true)
  })

  it('lazy-loads the document view route', () => {
    const document = findRoute(routes, 'document')
    expect(isDynamicImport(document.component)).toBe(true)
  })

  describe('project overview tabs', () => {
    const buildRouter = () => createRouter({ routes, history: createMemoryHistory() })

    it.each([
      ['project.view.overview.insights', '/projects/foo/insights'],
      ['project.view.overview.paths', '/projects/foo/paths'],
      ['project.view.overview.graph', '/projects/foo/graph'],
      ['project.view.overview.details', '/projects/foo/details'],
      ['project.view.overview.history', '/projects/foo/history']
    ])('resolves %s to its own URL', (name, path) => {
      const router = buildRouter()
      expect(router.resolve({ name, params: { name: 'foo' } }).path).toBe(path)
    })

    // Unlike resolve(), push() awaits the lazy component chain of every matched
    // record, which takes well over the default 10s timeout here. It is the only
    // way to exercise the redirect, since resolve() does not follow one.
    it('redirects the project root to the insights tab', async () => {
      const router = buildRouter()
      await router.push('/projects/foo')
      expect(router.currentRoute.value.name).toBe('project.view.overview.insights')
    }, 30000)
  })
})
