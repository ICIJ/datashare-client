import { createApp } from 'vue'
import { flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import { useRefreshRouteFromStart } from '@/composables/useRefreshRouteFromStart'
import { useSearchStore } from '@/store/modules'

describe('useRefreshRouteFromStart', () => {
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

  it('pushes a route to page one with the store query and a fresh stamp', async () => {
    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    const searchStore = useSearchStore()
    searchStore.setQuery('+Paris +London')
    searchStore.setFrom(2)
    const initialStamp = searchStore.toRouteQueryWithStamp.stamp

    const { refreshRouteFromStart } = withSetup(() => useRefreshRouteFromStart(searchStore), core.plugins)
    await refreshRouteFromStart()
    await flushPromises()

    const { query } = core.router.currentRoute.value
    expect(query.q).toBe('+Paris +London')
    expect(query.from).toBe('0')
    expect(query.stamp).not.toBe(initialStamp)
  })

  it('refreshes the stamp on every call, so an unchanged query still resubmits', async () => {
    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    const searchStore = useSearchStore()

    const { refreshRouteFromStart } = withSetup(() => useRefreshRouteFromStart(searchStore), core.plugins)
    await refreshRouteFromStart()
    await flushPromises()
    const firstStamp = core.router.currentRoute.value.query.stamp

    await refreshRouteFromStart()
    await flushPromises()
    const secondStamp = core.router.currentRoute.value.query.stamp

    expect(secondStamp).not.toBe(firstStamp)
  })
})
