import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SearchFilters from '@/views/Search/SearchFilters'
import { useSearchStore, useAppStore } from '@/store/modules'

// Lightweight stub that exposes the filter name via a DOM attribute so we can
// assert which filters the panel actually rendered.
const FilterStub = {
  props: ['filter'],
  template: '<div class="filter-stub" :data-filter-name="filter && filter.name" />'
}

const mountSearchFilters = (core) => {
  return shallowMount(SearchFilters, {
    global: {
      plugins: core.plugins,
      renderStubDefaultSlot: true,
      stubs: {
        FilterType: FilterStub,
        FilterTypeDateRange: FilterStub,
        FilterTypeStarred: FilterStub,
        FilterTypeRecommendedBy: FilterStub,
        FilterTypePath: FilterStub,
        FilterTypeProject: FilterStub,
        FilterTypeFileTypes: FilterStub
      }
    }
  })
}

describe('SearchFilters.vue', () => {
  let core, wrapper, searchStore, appStore

  beforeEach(() => {
    core = CoreSetup.init().useAll().useRouterWithoutGuards()
    searchStore = useSearchStore()
    appStore = useAppStore()
    // Steady-state default for the existing behavioral tests below: panel
    // closed (the app default) but the current search has already finished.
    searchStore.isReady = true

    wrapper = mountSearchFilters(core)
  })

  const renderedFilterNames = () => {
    return wrapper.findAll('.filter-stub').map(node => node.attributes('data-filter-name'))
  }

  it('renders the visible contentType filter in the panel', () => {
    expect(renderedFilterNames()).toContain('contentType')
  })

  it('omits the hidden contentTypeCategory filter from the panel', () => {
    const hiddenFilter = searchStore.getFilter({ name: 'contentTypeCategory' })
    expect(hiddenFilter.hidden).toBe(true)

    expect(renderedFilterNames()).not.toContain('contentTypeCategory')
  })

  it('keeps the hidden filter in the search store for URL and breadcrumb sync', () => {
    const names = searchStore.instantiatedFilters.map(filter => filter.name)
    expect(names).toContain('contentTypeCategory')
  })

  it('filters the panel by search term once fuse.js has loaded', async () => {
    wrapper.findComponent({ name: 'FiltersPanel' }).vm.$emit('update:q', 'nonexistent-filter-name')

    // fuse.js's first dynamic import pays real transform time in the Vitest
    // pipeline (not just a microtask tick), same as the async FilterType*
    // chunks elsewhere in this composable — flushPromises() alone isn't
    // enough, poll instead.
    await vi.waitFor(() => expect(renderedFilterNames()).not.toContain('contentType'))
  })

  describe('deferred loading when the panel starts closed', () => {
    beforeEach(() => {
      appStore.filters.closed = true
      searchStore.isReady = false
      wrapper = mountSearchFilters(core)
    })

    it('does not render any filter while the panel is closed and the search is not ready', () => {
      expect(renderedFilterNames()).toEqual([])
    })

    it('renders the filters once the current search finishes', async () => {
      searchStore.isReady = true
      await wrapper.vm.$nextTick()

      expect(renderedFilterNames()).toContain('contentType')
    })

    it('renders the filters immediately if the user opens the panel before the search finishes', async () => {
      appStore.filters.closed = false
      await wrapper.vm.$nextTick()

      expect(renderedFilterNames()).toContain('contentType')
    })
  })

  describe('when the panel starts open', () => {
    it('renders filters immediately even though the search is not ready', () => {
      appStore.filters.closed = false
      searchStore.isReady = false
      wrapper = mountSearchFilters(core)

      expect(renderedFilterNames()).toContain('contentType')
    })
  })
})
