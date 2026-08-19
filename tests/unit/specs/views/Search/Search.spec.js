import { shallowMount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import Search from '@/views/Search/Search'
import SearchToolbar from '@/components/Search/SearchToolbar/SearchToolbar'
import { useSearchStore } from '@/store/modules'

vi.mock('@/api/apiInstance', {
  apiInstance: {
    updateProject: vi.fn(),
    removeProject: vi.fn()
  }
})

// `batchQueryParamUpdate` debounces its router push by 50ms, so pagination
// changes only reach the route after the timer fires.
const flushDebouncedRouterPush = async () => {
  await new Promise(resolve => setTimeout(resolve, 60))
  await flushPromises()
}

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

  it('leaves select mode and clears the selection when the query changes', async () => {
    wrapper.vm.selectMode = true
    wrapper.vm.selection = ['document-id']

    await core.router.push({ name: 'search', query: { q: 'selectModeResetTest' } })
    await flushPromises()

    expect(wrapper.vm.selectMode).toBe(false)
    expect(wrapper.vm.selection).toEqual([])
  })

  it('pushes the advanced search query into the URL so it survives later navigations', async () => {
    // Same active pinia as the mounted component, so this is the same store instance.
    const searchStore = useSearchStore()
    vi.spyOn(searchStore, 'query').mockResolvedValue(undefined)
    // A regular search bar submit leaves the query in the URL.
    await core.router.push({ name: 'search', query: { q: 'advancedUrlTest', from: '0' } })
    await flushPromises()

    wrapper.findComponent(SearchToolbar).vm.$emit('advancedSearch', { query: '+Paris +London', field: 'tags' })
    await flushPromises()

    const { query } = core.router.currentRoute.value
    expect(query.q).toBe('+Paris +London')
    expect(query.field).toBe('tags')
    // A new search always restarts from the first page.
    expect(query.from).toBe('0')
  })

  it('keeps the advanced search query when paginating to the next page', async () => {
    // Same active pinia as the mounted component, so this is the same store instance.
    const searchStore = useSearchStore()
    vi.spyOn(searchStore, 'query').mockResolvedValue(undefined)
    await core.router.push({ name: 'search', query: { q: 'advancedPaginationTest', from: '0' } })
    await flushPromises()

    wrapper.findComponent(SearchToolbar).vm.$emit('advancedSearch', { query: '+Berlin +Vienna', field: 'all' })
    await flushPromises()

    // Going to the next page patches the current URL: the query it carries must
    // still be the advanced one, otherwise the route round-trip overwrites the
    // store and page 2 shows the results of the previous search.
    wrapper.vm.page = 2
    await flushDebouncedRouterPush()

    expect(searchStore.q).toBe('+Berlin +Vienna')
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
