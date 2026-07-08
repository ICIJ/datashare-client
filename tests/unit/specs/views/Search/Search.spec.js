import { shallowMount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import Search from '@/views/Search/Search'
import { useSearchStore } from '@/store/modules'

vi.mock('@/api/apiInstance', {
  apiInstance: {
    updateProject: vi.fn(),
    removeProject: vi.fn()
  }
})

describe('Search.vue', () => {
  let core, wrapper

  beforeEach(() => {
    core = CoreSetup.init().useAll().useRouterWithoutGuards()

    wrapper = shallowMount(Search, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      }
    })
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('is a Vue instance', () => {
    expect(wrapper.vm).toBeTruthy()
  })

  it('cancels the active search when the view unmounts', () => {
    // Same active pinia as the mounted component, so this is the same store instance.
    const searchStore = useSearchStore()
    const spy = vi.spyOn(searchStore, 'cancelActiveSearch')

    wrapper.unmount()

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('strips the noRefresh flag from the URL after returning to search', async () => {
    await core.router.push({ name: 'search', query: { q: 'foo', noRefresh: 1 } })
    await flushPromises()
    await flushPromises()

    const { query } = core.router.currentRoute.value
    expect(query.noRefresh).toBeUndefined()
    expect(query.q).toBe('foo')
  })

  it('runs the initial search when a reloaded noRefresh URL is stripped', async () => {
    // Same active pinia as the mounted component, so this is the same store instance.
    const searchStore = useSearchStore()
    const querySpy = vi.spyOn(searchStore, 'query').mockResolvedValue(undefined)
    // Use a query value distinct from other specs in this file: `sameAppliedQuery`
    // compares against whatever the shared store instance last applied, so reusing
    // a `q` value another test already searched for would make this test pass
    // vacuously (the guard would short-circuit on a false "nothing changed").
    const query = { q: 'noRefreshReloadTest', noRefresh: 1 }

    await core.router.push({ name: 'search', query })
    // Flush twice: once for the `noRefresh` consumer's `router.replace`, and once
    // more for the resulting route update to reach `onAfterRouteQueryUpdate`.
    await flushPromises()
    await flushPromises()

    expect(querySpy).toHaveBeenCalled()
  })
})
