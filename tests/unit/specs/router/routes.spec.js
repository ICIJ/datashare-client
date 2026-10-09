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
      // Insights is the project landing tab, so it stays on the bare project URL.
      ['project.view.overview.insights', '/projects/foo'],
      ['project.view.overview.paths', '/projects/foo/paths'],
      ['project.view.overview.graph', '/projects/foo/graph'],
      ['project.view.overview.details', '/projects/foo/details'],
      ['project.view.overview.history', '/projects/foo/history']
    ])('resolves %s to its own URL', (name, path) => {
      const router = buildRouter()
      expect(router.resolve({ name, params: { name: 'foo' } }).path).toBe(path)
    })

    // The generous timeout covers a cold run, where this first push pays for
    // transforming the whole lazy component chain it matches.
    it('lands on the insights tab from the bare project URL', async () => {
      const router = buildRouter()
      await router.push('/projects/foo')
      expect(router.currentRoute.value.name).toBe('project.view.overview.insights')
    }, 30000)

    // Insights sharing the project URL must not make its tab look active from a
    // sibling tab, which is what the five empty paths used to do.
    it('does not match insights when another tab is open', () => {
      const router = buildRouter()
      const names = router.resolve({ name: 'project.view.overview.paths', params: { name: 'foo' } })
        .matched.map(record => record.name)
      expect(names).toContain('project.view.overview.paths')
      expect(names).not.toContain('project.view.overview.insights')
    })
  })
})
