import { createApp, nextTick } from 'vue'

import CoreSetup from '~tests/unit/CoreSetup'
import { useSearchFilter } from '@/composables/useSearchFilter'
import { useAppStore, useSearchStore } from '@/store/modules'
import { SEARCH_OPERATORS } from '@/enums/searchOperators'

vi.mock('@/views/App', () => ({ default: { template: '<router-view />' } }))
vi.mock('@/views/Search/Search', () => ({ default: { template: '<div />' } }))
vi.mock('@/views/Search/SearchFilters', () => ({ default: { template: '<div />' } }))
vi.mock('@/views/Search/SearchSettings', () => ({ default: { template: '<div />' } }))

describe('useSearchFilter', () => {
  function withSetup(composable, plugins) {
    let result
    const app = createApp({
      setup() {
        result = composable()
        return {}
      }
    })
    plugins.forEach(plugin => app.use(plugin))
    app.mount(document.createElement('div'))
    return result
  }

  describe('watchOperator', () => {
    it('calls callback when search operator changes from OR to AND', async () => {
      const core = CoreSetup.init().useAll().useRouterWithoutGuards()
      const callback = vi.fn()

      withSetup(() => {
        const { watchOperator } = useSearchFilter()
        watchOperator(callback)
      }, core.plugins)

      const appStore = useAppStore()
      appStore.setSettings('search', 'searchOperator', SEARCH_OPERATORS.AND)
      await nextTick()

      expect(callback).toHaveBeenCalledOnce()
    })

    it('calls callback when search operator changes from AND to OR', async () => {
      const core = CoreSetup.init().useAll().useRouterWithoutGuards()
      const callback = vi.fn()

      withSetup(() => {
        const { watchOperator } = useSearchFilter()
        watchOperator(callback)
      }, core.plugins)

      const appStore = useAppStore()
      appStore.setSettings('search', 'searchOperator', SEARCH_OPERATORS.AND)
      await nextTick()
      callback.mockClear()
      appStore.setSettings('search', 'searchOperator', SEARCH_OPERATORS.OR)
      await nextTick()

      expect(callback).toHaveBeenCalledOnce()
    })

    it('does not call callback when an unrelated setting changes', async () => {
      const core = CoreSetup.init().useAll().useRouterWithoutGuards()
      const callback = vi.fn()

      withSetup(() => {
        const { watchOperator } = useSearchFilter()
        watchOperator(callback)
      }, core.plugins)

      const appStore = useAppStore()
      appStore.setSettings('search', 'perPage', '50')
      await nextTick()

      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('refreshSearchFromRoute', () => {
    beforeEach(() => {
      vi.spyOn(useSearchStore(), 'query').mockResolvedValue(undefined)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('restores searchOperator from route query to app settings', async () => {
      const core = CoreSetup.init().useAll().useRouterWithoutGuards()
      const { refreshSearchFromRoute } = withSetup(() => useSearchFilter(), core.plugins)

      await core.router.push({ name: 'search', query: { searchOperator: SEARCH_OPERATORS.AND } })
      await refreshSearchFromRoute()

      expect(useAppStore().getSettings('search', 'searchOperator')).toBe(SEARCH_OPERATORS.AND)
    })

    it('ignores invalid searchOperator values from route query', async () => {
      const core = CoreSetup.init().useAll().useRouterWithoutGuards()
      const { refreshSearchFromRoute } = withSetup(() => useSearchFilter(), core.plugins)

      await core.router.push({ name: 'search', query: { searchOperator: 'FOOBAR' } })
      await refreshSearchFromRoute()

      expect(useAppStore().getSettings('search', 'searchOperator')).toBe(SEARCH_OPERATORS.OR)
    })

    it('restores searchOperator from route query using refreshSearchFromRouteStart', async () => {
      const core = CoreSetup.init().useAll().useRouterWithoutGuards()
      const { refreshSearchFromRouteStart } = withSetup(() => useSearchFilter(), core.plugins)

      await core.router.push({ name: 'search', query: { searchOperator: SEARCH_OPERATORS.AND } })
      await refreshSearchFromRouteStart()

      expect(useAppStore().getSettings('search', 'searchOperator')).toBe(SEARCH_OPERATORS.AND)
    })

    it('ignores invalid searchOperator values from route query in refreshSearchFromRouteStart', async () => {
      const core = CoreSetup.init().useAll().useRouterWithoutGuards()
      const { refreshSearchFromRouteStart } = withSetup(() => useSearchFilter(), core.plugins)

      await core.router.push({ name: 'search', query: { searchOperator: 'FOOBAR' } })
      await refreshSearchFromRouteStart()

      expect(useAppStore().getSettings('search', 'searchOperator')).toBe(SEARCH_OPERATORS.OR)
    })
  })
})
