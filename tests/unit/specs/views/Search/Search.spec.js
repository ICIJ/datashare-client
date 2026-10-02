import { shallowMount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import Search from '@/views/Search/Search'
import SearchToolbar from '@/components/Search/SearchToolbar/SearchToolbar'
import { markJustSubmitted } from '@/composables/useSearchFilter'
import { useSearchStore, useLockedFiltersStore } from '@/store/modules'

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
    // Every test's router uses createWebHashHistory, which listens on the
    // single shared jsdom `window`/`location`. Without unmounting the
    // previous wrapper first, its Search instance (and the onAfterRouteUpdate
    // watchers it registered) stays alive and keeps reacting to hash changes
    // fired by later tests' router.push calls — racing the current test's
    // instance for one-shot module state like justSubmitted.
    wrapper?.unmount()

    core = CoreSetup.init().useAll().useRouterWithoutGuards()
    // lockedFiltersStore is persisted to real localStorage (persist: true), which
    // survives across tests in this file even with a fresh Pinia instance per test —
    // clear it explicitly so lock-dependent tests below don't leak into each other.
    useLockedFiltersStore().unlockAll()

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

  it('opens the breadcrumb panel after an explicit submission when locks are active', async () => {
    const lockedFiltersStore = useLockedFiltersStore()
    lockedFiltersStore.lock({ name: 'contentType', value: 'application/pdf', label: 'application/pdf' })

    markJustSubmitted()
    await core.router.push({ name: 'search', query: { q: 'lockedSubmitTest' } })
    await flushPromises()

    expect(wrapper.vm.toggleSearchBreadcrumb).toBe(true)
  })

  it('opens the breadcrumb panel after an advanced search submission when locks are active', async () => {
    const searchStore = useSearchStore()
    vi.spyOn(searchStore, 'query').mockResolvedValue(undefined)
    const lockedFiltersStore = useLockedFiltersStore()
    lockedFiltersStore.lock({ name: 'contentType', value: 'application/pdf', label: 'application/pdf' })

    wrapper.findComponent(SearchToolbar).vm.$emit('advancedSearch', { query: 'advancedLockedSubmitTest', field: 'all' })
    await flushPromises()

    expect(wrapper.vm.toggleSearchBreadcrumb).toBe(true)
  })

  it('does not open the breadcrumb panel on a route update that was not marked as submitted', async () => {
    await core.router.push({ name: 'search', query: { 'q': 'noSubmittedFlagTest', 'f[contentType]': ['application/pdf'] } })
    await flushPromises()
    const lockedFiltersStore = useLockedFiltersStore()
    lockedFiltersStore.lock({ name: 'contentType', value: 'application/pdf', label: 'application/pdf' })

    await core.router.push({ name: 'search', query: { 'q': 'noSubmittedFlagTest2', 'f[contentType]': ['application/pdf'] } })
    await flushPromises()

    expect(wrapper.vm.toggleSearchBreadcrumb).toBe(false)
  })

  it('does not open the breadcrumb panel on submission when no locks are active', async () => {
    markJustSubmitted()
    await core.router.push({ name: 'search', query: { q: 'noLocksSubmitTest' } })
    await flushPromises()

    expect(wrapper.vm.toggleSearchBreadcrumb).toBe(false)
  })

  it('opens the breadcrumb panel on mount when a locked filter already conflicts with the route it loaded with, e.g. a shared link', async () => {
    const lockedFiltersStore = useLockedFiltersStore()
    lockedFiltersStore.lock({ name: '-contentType', value: 'application/pdf', label: 'application/pdf' })
    // Included, opposite mode of the lock above: a raw navigation, not an
    // explicit submission, so markJustSubmitted() is never called here.
    await core.router.push({ name: 'search', query: { 'f[contentType]': ['application/pdf'] } })
    await flushPromises()

    wrapper.unmount()
    wrapper = shallowMount(Search, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      }
    })
    await flushPromises()

    expect(wrapper.vm.toggleSearchBreadcrumb).toBe(true)
  })

  it('does not open the breadcrumb panel on mount when locks exist but none conflict with the route', async () => {
    const lockedFiltersStore = useLockedFiltersStore()
    // Locked value already present in the route's own query, in the same
    // mode: nothing is pending, so hasConflictingLocks stays false.
    lockedFiltersStore.lock({ name: 'contentType', value: 'application/pdf', label: 'application/pdf' })
    await core.router.push({ name: 'search', query: { 'q': 'mountNoConflictTest', 'f[contentType]': ['application/pdf'] } })
    await flushPromises()

    wrapper.unmount()
    wrapper = shallowMount(Search, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      }
    })
    await flushPromises()

    expect(wrapper.vm.toggleSearchBreadcrumb).toBe(false)
  })

  it('does not open the breadcrumb panel on a genuine cold load whose URL already carries the locked value (icij/datashare#2332)', async () => {
    // Unmount the default-route wrapper from beforeEach *before* pushing, so
    // nothing has reacted to this route yet and the store is still fully
    // empty when Search mounts fresh - a real cold load (e.g. a bookmark or
    // a page reload) resolves its query before any component exists to
    // hydrate the store from it.
    //
    // This relies on the 'search' route's own beforeEnter guard
    // (prefillSearchStore) hydrating the store from `to.query` before Search
    // ever mounts - the conflict watcher below runs during setup, before
    // Search's own onMounted hooks, so without that guard it would see a
    // still-empty store and report a conflict that isn't real. Pins the
    // guard's existence: removing it would make this test flap or fail.
    wrapper.unmount()
    const lockedFiltersStore = useLockedFiltersStore()
    lockedFiltersStore.lock({ name: 'contentType', value: 'application/pdf', label: 'application/pdf' })
    await core.router.push({ name: 'search', query: { 'f[contentType]': ['application/pdf'] } })

    wrapper = shallowMount(Search, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      }
    })
    await flushPromises()

    expect(wrapper.vm.toggleSearchBreadcrumb).toBe(false)
  })

  it('reopens the breadcrumb panel for a second, unrelated conflict later in the same session (icij/datashare#2332)', async () => {
    // Search.vue never remounts across "search" navigations, so this exercises
    // the live watcher (not the on-mount immediate call the two tests above cover).
    const lockedFiltersStore = useLockedFiltersStore()
    lockedFiltersStore.lock({ name: '-contentType', value: 'application/pdf', label: 'application/pdf' })
    await core.router.push({ name: 'search', query: { 'f[contentType]': ['application/pdf'] } })
    await flushPromises()
    expect(wrapper.vm.toggleSearchBreadcrumb).toBe(true)

    // User closes the panel, then resolves the first conflict.
    wrapper.vm.toggleSearchBreadcrumb = false
    lockedFiltersStore.unlock({ name: '-contentType', value: 'application/pdf' })
    await core.router.push({ name: 'search', query: {} })
    await flushPromises()
    expect(wrapper.vm.toggleSearchBreadcrumb).toBe(false)

    // A second, different lock now conflicts with a later navigation.
    lockedFiltersStore.lock({ name: '-tags', value: 'urgent', label: 'urgent' })
    await core.router.push({ name: 'search', query: { 'f[tags]': ['urgent'] } })
    await flushPromises()

    expect(wrapper.vm.toggleSearchBreadcrumb).toBe(true)
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
