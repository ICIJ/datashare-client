import { shallowMount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import Search from '@/views/Search/Search'
import SearchSettings from '@/views/Search/SearchSettings'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: {
    updateProject: vi.fn(),
    removeProject: vi.fn()
  }
}))

// `batchQueryParamUpdate` debounces its router navigation by 50ms.
const flushDebouncedRouterUpdate = async () => {
  await new Promise(resolve => setTimeout(resolve, 60))
  await flushPromises()
}

describe('SearchSettings.vue', () => {
  let core

  beforeEach(() => {
    core = CoreSetup.init().useAll().useRouterWithoutGuards()
  })

  it('lands on a bare query with a URL the view has nothing to add to', async () => {
    // The minimal query the magnifying glass of Insights > Paths links to.
    const query = { 'f[path]': '/vault/luxleaks/v1', 'indices': 'luxleaks' }
    await core.router.push({ name: 'search', query })
    await flushPromises()

    const { length } = window.history

    // Search.vue hydrates the stores from the route query, SearchSettings mirrors the
    // resulting settings back into the URL: any write would push a history entry.
    const global = { plugins: core.plugins, renderStubDefaultSlot: true }
    const search = shallowMount(Search, { global })
    const settings = shallowMount(SearchSettings, { global })
    await flushPromises()
    await flushDebouncedRouterUpdate()

    expect(window.history.length).toBe(length)
    expect(core.router.currentRoute.value.query).toHaveProperty('f[path]', '/vault/luxleaks/v1')
    expect(core.router.currentRoute.value.query).toHaveProperty('sort', '_score')
    expect(core.router.currentRoute.value.query).toHaveProperty('order', 'desc')
    expect(core.router.currentRoute.value.query).toHaveProperty('perPage', '25')

    settings.unmount()
    search.unmount()
  })
})
