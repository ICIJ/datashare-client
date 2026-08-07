import { nextTick } from 'vue'
import { flushPromises, shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SearchToolbar from '@/components/Search/SearchToolbar/SearchToolbar'
import SearchBar from '@/components/Search/SearchBar/SearchBar'
import { useSearchStore } from '@/store/modules'

// useCompact relies on the element's measured width, which jsdom always
// reports as 0; mock it so we can drive the toolbar's compact state directly.
const compactState = vi.hoisted(() => ({ value: false }))
vi.mock('@/composables/useCompact', async () => {
  const { computed } = await vi.importActual('vue')
  return { useCompact: () => ({ compact: computed(() => compactState.value) }) }
})

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
    compactState.value = false
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

  it('does not mount the advanced-search modal until the toggle is activated', () => {
    const wrapper = factory()
    expect(wrapper.findComponent({ name: 'SearchAdvancedModal' }).exists()).toBe(false)
  })

  it('opens the advanced-search modal when the toggle is activated', async () => {
    const wrapper = factory()

    wrapper.findComponent({ name: 'ButtonToggleAdvancedSearch' }).vm.$emit('update:active', true)
    await flushPromises()

    // The async-loaded modal is stubbed without a declared prop schema, so
    // its passed values only surface as rendered attributes, not .props().
    expect(wrapper.findComponent({ name: 'SearchAdvancedModal' }).attributes('modelvalue')).toBe('true')
  })

  it('keeps the advanced-search modal mounted after it has been closed', async () => {
    const wrapper = factory()
    const toggle = wrapper.findComponent({ name: 'ButtonToggleAdvancedSearch' })

    toggle.vm.$emit('update:active', true)
    await flushPromises()
    toggle.vm.$emit('update:active', false)
    await nextTick()

    expect(wrapper.findComponent({ name: 'SearchAdvancedModal' }).exists()).toBe(true)
  })

  it('passes the active query to the modal as initialQuery', async () => {
    searchStore.setQuery('+Paris')
    const wrapper = factory()
    wrapper.findComponent({ name: 'ButtonToggleAdvancedSearch' }).vm.$emit('update:active', true)
    await flushPromises()
    expect(wrapper.findComponent({ name: 'SearchAdvancedModal' }).attributes('initial-query')).toBe('+Paris')
  })

  it('runs a store query with the emitted query and field', async () => {
    const wrapper = factory()
    wrapper.findComponent({ name: 'ButtonToggleAdvancedSearch' }).vm.$emit('update:active', true)
    await flushPromises()
    wrapper.findComponent({ name: 'SearchAdvancedModal' }).vm.$emit('search', { query: '+Paris +London', field: 'tags' })
    expect(searchStore.query).toHaveBeenCalledWith({ query: '+Paris +London', field: 'tags' })
  })

  it('runs a store query even when the modal emits an empty search so it is always resubmitted', async () => {
    const wrapper = factory()
    wrapper.findComponent({ name: 'ButtonToggleAdvancedSearch' }).vm.$emit('update:active', true)
    await flushPromises()
    wrapper.findComponent({ name: 'SearchAdvancedModal' }).vm.$emit('search', { query: '', field: 'all' })
    expect(searchStore.query).toHaveBeenCalledWith({ query: '', field: 'all' })
  })

  it('reduces the advanced-search toggle when the toolbar is compact', () => {
    compactState.value = true
    const wrapper = factory()
    expect(wrapper.findComponent({ name: 'ButtonToggleAdvancedSearch' }).props('reduced')).toBe(true)
  })

  it('does not reduce the advanced-search toggle when the toolbar has room', () => {
    compactState.value = false
    const wrapper = factory()
    expect(wrapper.findComponent({ name: 'ButtonToggleAdvancedSearch' }).props('reduced')).toBe(false)
  })

  it('shows the search submit button when the toolbar is at normal width', () => {
    const wrapper = factory()
    expect(wrapper.findComponent(SearchBar).props('showSubmit')).toBe(true)
  })

  it('hides the search submit button in compact mode to spare the width', () => {
    compactState.value = true
    const wrapper = factory()
    expect(wrapper.findComponent(SearchBar).props('showSubmit')).toBe(false)
  })
})
