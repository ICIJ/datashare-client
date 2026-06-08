import { nextTick } from 'vue'
import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SearchToolbar from '@/components/Search/SearchToolbar/SearchToolbar'
import { useSearchStore } from '@/store/modules'

describe('SearchToolbar.vue', () => {
  const { plugins } = CoreSetup.init().useAll().useRouterWithoutGuards()

  let searchStore

  const factory = (props = {}) => {
    return shallowMount(SearchToolbar, {
      props,
      global: { plugins, renderStubDefaultSlot: true }
    })
  }

  beforeEach(() => {
    searchStore = useSearchStore()
    searchStore.reset()
    // query() would call refresh() and hit Elasticsearch; stub it.
    vi.spyOn(searchStore, 'query').mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the advanced-search toggle button', () => {
    const wrapper = factory()
    expect(wrapper.findComponent({ name: 'ButtonToggleAdvancedSearch' }).exists()).toBe(true)
  })

  it('opens the advanced-search modal when the toggle is activated', async () => {
    const wrapper = factory()
    const modal = wrapper.findComponent({ name: 'SearchAdvancedModal' })
    expect(modal.props('modelValue')).toBe(false)

    wrapper.findComponent({ name: 'ButtonToggleAdvancedSearch' }).vm.$emit('update:active', true)
    await nextTick()

    expect(modal.props('modelValue')).toBe(true)
  })

  it('passes the active query to the modal as initialQuery', async () => {
    searchStore.setQuery('+Paris')
    const wrapper = factory()
    await nextTick()
    expect(wrapper.findComponent({ name: 'SearchAdvancedModal' }).props('initialQuery')).toBe('+Paris')
  })

  it('runs a store query when the modal emits a search', () => {
    const wrapper = factory()
    wrapper.findComponent({ name: 'SearchAdvancedModal' }).vm.$emit('search', '+Paris +London')
    expect(searchStore.query).toHaveBeenCalledWith('+Paris +London')
  })

  it('does not run a query when the modal emits an empty search', () => {
    const wrapper = factory()
    wrapper.findComponent({ name: 'SearchAdvancedModal' }).vm.$emit('search', '')
    expect(searchStore.query).not.toHaveBeenCalled()
  })
})
