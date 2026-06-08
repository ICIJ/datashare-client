import { createApp } from 'vue'

import CoreSetup from '~tests/unit/CoreSetup'
import { useContentTypeCategoryCollapse } from '@/composables/useContentTypeCategoryCollapse'
import { useAppStore } from '@/store/modules'

describe('useContentTypeCategoryCollapse', () => {
  // Mount the composable inside a throwaway app so inject()/Pinia work.
  function withSetup(plugins) {
    let result
    const app = createApp({
      setup() {
        result = useContentTypeCategoryCollapse()
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
    // reset it so each test starts from the collapsed-by-default baseline
    // regardless of execution order.
    useAppStore().setSettings('search', 'expandedContentTypeCategories', [])
  })

  it('reports every category as collapsed by default', () => {
    const { isCollapsed } = withSetup(core.plugins)
    expect(isCollapsed('DOCUMENT')).toBe(true)
    expect(isCollapsed('AUDIO')).toBe(true)
  })

  it('expands a category when toggleCollapse is called with false', () => {
    const { isCollapsed, toggleCollapse } = withSetup(core.plugins)
    toggleCollapse('DOCUMENT', false)
    expect(isCollapsed('DOCUMENT')).toBe(false)
    expect(isCollapsed('AUDIO')).toBe(true)
  })

  it('re-collapses an expanded category when toggleCollapse is called with true', () => {
    const { isCollapsed, toggleCollapse } = withSetup(core.plugins)
    toggleCollapse('DOCUMENT', false)
    toggleCollapse('DOCUMENT', true)
    expect(isCollapsed('DOCUMENT')).toBe(true)
  })

  it('persists the expanded keys to the search settings', () => {
    const { toggleCollapse } = withSetup(core.plugins)
    toggleCollapse('DOCUMENT', false)
    const appStore = useAppStore()
    expect(appStore.getSettings('search', 'expandedContentTypeCategories')).toContain('DOCUMENT')
  })

  it('reflects pre-existing persisted expanded state', () => {
    const appStore = useAppStore()
    appStore.setSettings('search', 'expandedContentTypeCategories', ['AUDIO'])
    const { isCollapsed } = withSetup(core.plugins)
    expect(isCollapsed('AUDIO')).toBe(false)
    expect(isCollapsed('DOCUMENT')).toBe(true)
  })

  it('does not add a duplicate key when expanding an already-expanded category', () => {
    const { toggleCollapse } = withSetup(core.plugins)
    toggleCollapse('DOCUMENT', false)
    toggleCollapse('DOCUMENT', false)
    const appStore = useAppStore()
    const expanded = appStore.getSettings('search', 'expandedContentTypeCategories')
    expect(expanded.filter(key => key === 'DOCUMENT')).toHaveLength(1)
  })
})
