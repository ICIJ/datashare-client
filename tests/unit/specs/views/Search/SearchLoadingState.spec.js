import { shallowMount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import Search from '@/views/Search/Search'
import { useSearchStore } from '@/store/modules'
import { checkSearchOrder } from '@/router/guards/checkSearchOrder'
import { checkSearchSort } from '@/router/guards/checkSearchSort'
import { fillSearchRouteQuery } from '@/router/guards/fillSearchRouteQuery'
import { prefillSearchStore } from '@/router/guards/prefillSearchStore'
import { replaceSizeToPerPage } from '@/router/guards/replaceSizeToPerPage'

const runAsyncSearchMock = vi.fn()

vi.mock('@/api/asyncSearch', () => ({
  runAsyncSearch: (...args) => runAsyncSearchMock(...args)
}))

vi.mock('@/api/indexDistribution', () => ({
  isOpenSearchDistribution: () => Promise.resolve(false)
}))

const emptyResponse = () => ({ hits: { hits: [], total: { value: 0 } } })

// The search route's own guards: `prefillSearchStore` writes the store from a
// query that `fillSearchRouteQuery` then completes with a redirect, so the view
// mounts on a different query than the one the guards first saw.
const routes = [
  {
    name: 'search',
    path: '/',
    component: { template: '<div />' },
    beforeEnter: [checkSearchSort, checkSearchOrder, prefillSearchStore, replaceSizeToPerPage, fillSearchRouteQuery],
    children: [{ name: 'document', path: 'd/:index/:id', component: { template: '<div />' } }]
  },
  { name: 'project.list', path: '/projects', component: { template: '<div />' } }
]

describe('Search.vue loading state', () => {
  let core, wrapper

  const mount = () => {
    return shallowMount(Search, { global: { plugins: core.plugins, renderStubDefaultSlot: true } })
  }

  // Mounted here so the first test can drive route updates through an already
  // mounted view; the others unmount and remount to exercise the mount-time
  // path. Unlike Search.spec.js, this file keeps the real route guards, which
  // is what makes the redirect below reachable.
  beforeEach(() => {
    wrapper?.unmount()
    runAsyncSearchMock.mockReset()
    runAsyncSearchMock.mockResolvedValue(emptyResponse())
    core = CoreSetup.init().useAll().useRouter(routes)
    wrapper = mount()
  })

  afterAll(() => {
    wrapper?.unmount()
  })

  it('shows the loading state while a new search is in flight, and clears it when it settles', async () => {
    const searchStore = useSearchStore()
    await core.router.push({ name: 'search', query: { q: 'first' } })
    await flushPromises()
    await flushPromises()
    expect(searchStore.isReady).toBe(true)

    let resolveSearch
    runAsyncSearchMock.mockReturnValueOnce(new Promise((resolve) => {
      resolveSearch = resolve
    }))
    await core.router.push({ name: 'search', query: { ...searchStore.toRouteQuery, q: 'second' } })
    await flushPromises()
    expect(searchStore.isReady).toBe(false)

    resolveSearch(emptyResponse())
    await flushPromises()
    expect(searchStore.isReady).toBe(true)
  })

  it('shows the loading state when coming back to search with a new query', async () => {
    const searchStore = useSearchStore()
    await core.router.push({ name: 'search', query: { q: '', indices: 'foo' } })
    await flushPromises()
    await flushPromises()

    let resolveSearch
    runAsyncSearchMock.mockReturnValueOnce(new Promise((resolve) => {
      resolveSearch = resolve
    }))
    wrapper.unmount()
    await core.router.push({ name: 'project.list' })
    await flushPromises()
    await core.router.push({ name: 'search', query: { indices: ['foo'], q: 'other' } })
    wrapper = mount()
    await flushPromises()

    expect(runAsyncSearchMock).toHaveBeenCalled()
    expect(searchStore.isReady).toBe(false)

    resolveSearch(emptyResponse())
    await flushPromises()

    expect(searchStore.isReady).toBe(true)
  })

  it('searches behind a document opened straight from its URL', async () => {
    // A genuine cold load: a fresh store with nothing applied yet, unlike the
    // shared one the mount in beforeEach has already searched with.
    wrapper.unmount()
    core = CoreSetup.init().createPinia().useAll().useRouter(routes)
    const searchStore = useSearchStore()
    expect(searchStore.isReady).toBe(false)

    // A document route is a child of search, so the view mounts on a route
    // both refresh guards ignore.
    await core.router.push({ name: 'document', params: { index: 'foo', id: 'bar' } })
    wrapper = mount()
    await flushPromises()
    await flushPromises()

    expect(runAsyncSearchMock).toHaveBeenCalled()
    expect(searchStore.isReady).toBe(true)
  })

  it('is never left loading when a partial route query resolves to the current search', async () => {
    const searchStore = useSearchStore()
    await core.router.push({ name: 'search', query: { q: '', indices: 'foo' } })
    await flushPromises()
    await flushPromises()
    expect(searchStore.isReady).toBe(true)

    // Leave the search view for the projects list, then come back through a
    // link carrying only the project (the project card's search button), which
    // redirects to the very query the store already holds.
    wrapper.unmount()
    await core.router.push({ name: 'project.list' })
    await flushPromises()
    await core.router.push({ name: 'search', query: { indices: ['foo'] } })
    wrapper = mount()
    await flushPromises()
    await flushPromises()

    // No new search is needed here, but the view must not stay on its skeleton.
    expect(searchStore.isReady).toBe(true)
  })
})
