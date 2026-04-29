import { createApp, nextTick } from 'vue'

import CoreSetup from '~tests/unit/CoreSetup'
import { useSearchFilter } from '@/composables/useSearchFilter'
import { useAppStore, useSearchStore } from '@/store/modules'
import { SEARCH_OPERATORS } from '@/enums/searchOperators'

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
    it('restores searchOperator from route query to app settings', async () => {
      const core = CoreSetup.init().useAll().useRouterWithoutGuards()
      const { refreshSearchFromRoute } = withSetup(() => useSearchFilter(), core.plugins)
      const searchStore = useSearchStore()
      vi.spyOn(searchStore, 'query').mockResolvedValue(undefined)

      await core.router.push({ name: 'search', query: { searchOperator: SEARCH_OPERATORS.AND } })
      await refreshSearchFromRoute()

      expect(useAppStore().getSettings('search', 'searchOperator')).toBe(SEARCH_OPERATORS.AND)
      vi.restoreAllMocks()
    })
  })
})
