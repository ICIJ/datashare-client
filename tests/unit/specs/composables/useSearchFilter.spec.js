import { createApp, nextTick } from 'vue'

import CoreSetup from '~tests/unit/CoreSetup'
import { useSearchFilter } from '@/composables/useSearchFilter'
import { useAppStore } from '@/store/modules'
import { SEARCH_OPERATORS } from '@/enums/searchOperators'

describe('useSearchFilter', () => {
  function withSetup(composable, plugins) {
    const app = createApp({
      setup() {
        composable()
        return {}
      }
    })
    plugins.forEach(plugin => {
      Array.isArray(plugin) ? app.use(...plugin) : app.use(plugin)
    })
    app.mount(document.createElement('div'))
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
})
