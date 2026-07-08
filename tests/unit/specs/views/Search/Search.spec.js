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
})
