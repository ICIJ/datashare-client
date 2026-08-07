import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SearchFilters from '@/views/Search/SearchFilters'
import { useSearchStore } from '@/store/modules'

// Lightweight stub that exposes the filter name via a DOM attribute so we can
// assert which filters the panel actually rendered.
const FilterStub = {
  props: ['filter'],
  template: '<div class="filter-stub" :data-filter-name="filter && filter.name" />'
}

describe('SearchFilters.vue', () => {
  let core, wrapper, searchStore

  beforeEach(() => {
    core = CoreSetup.init().useAll().useRouterWithoutGuards()
    searchStore = useSearchStore()

    wrapper = shallowMount(SearchFilters, {
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
})
