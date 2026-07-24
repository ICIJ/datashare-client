import { createApp } from 'vue'

import CoreSetup from '~tests/unit/CoreSetup'
import { useContentTypeGroupedView } from '@/composables/useContentTypeGroupedView'
import { useAppStore } from '@/store/modules'

describe('useContentTypeGroupedView', () => {
  // Mount the composable inside a throwaway app so inject()/Pinia work.
  function withSetup(plugins) {
    let result
    const app = createApp({
      setup() {
        result = useContentTypeGroupedView()
        return {}
      }
    })
    plugins.forEach(plugin => app.use(plugin))
    app.mount(document.createElement('div'))
    return result
  }

  let core

  beforeEach(() => {
    core = CoreSetup.init().useAll()
    // The setting persists to localStorage, which a fresh Pinia rehydrates —
    // reset it so each test starts from the flat-view baseline regardless of
    // execution order.
    useAppStore().setSettings('search', 'groupedContentTypeView', false)
  })

  it('defaults to the flat view (false)', () => {
    useAppStore().setSettings('search', 'groupedContentTypeView', undefined)
    const grouped = withSetup(core.plugins)
    expect(grouped.value).toBe(false)
  })

  it('persists the value to the search settings when set to true', () => {
    const grouped = withSetup(core.plugins)
    grouped.value = true
    expect(useAppStore().getSettings('search', 'groupedContentTypeView')).toBe(true)
  })

  it('reflects pre-existing persisted state', () => {
    useAppStore().setSettings('search', 'groupedContentTypeView', true)
    const grouped = withSetup(core.plugins)
    expect(grouped.value).toBe(true)
  })

  it('persists false when toggled back off', () => {
    const grouped = withSetup(core.plugins)
    grouped.value = true
    grouped.value = false
    expect(useAppStore().getSettings('search', 'groupedContentTypeView')).toBe(false)
  })
})
