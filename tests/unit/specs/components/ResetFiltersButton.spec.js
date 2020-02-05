import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'

import { App } from '@/main'
import ResetFiltersButton from '@/components/ResetFiltersButton'

const { localVue, router, store } = App.init(createLocalVue()).useAll()

describe('ResetFiltersButton.vue', function () {
  let wrapper

  beforeEach(() => {
    store.commit('search/reset')
    wrapper = shallowMount(ResetFiltersButton, { localVue, router, store, sync: false, mocks: { $t: msg => msg } })
  })

  it('should display a disabled button, by default', () => {
    expect(wrapper.find('.btn').exists()).toBeTruthy()
    expect(wrapper.find('.btn').attributes().disabled).toBe('disabled')
  })

  it('should display an active button if a filter is valuated', async () => {
    store.commit('search/addFilterValue', { name: 'language', value: 'en' })
    await flushPromises()

    expect(wrapper.find('.btn').exists()).toBeTruthy()
    expect(wrapper.find('.btn[disabled]').exists()).toBeFalsy()
  })

  it('shouldn\'t have filters', () => {
    expect(wrapper.vm.hasFilters).toBeFalsy()
  })

  it('should have filters', () => {
    store.commit('search/addFilterValue', { name: 'language', value: 'en' })
    expect(wrapper.vm.hasFilters).toBeTruthy()
  })

  it('should reset filters on filters reset', () => {
    store.commit('search/addFilterValue', { name: 'language', value: 'en' })

    wrapper.vm.resetFilters()

    expect(wrapper.vm.hasFilters).toBeFalsy()
  })

  it('should reset query on filters reset', () => {
    store.commit('search/query', 'this is a query')

    wrapper.vm.resetFilters()

    expect(store.state.search.query).toBe('')
  })

  it('should not change the index on filters reset', () => {
    store.commit('search/index', 'my-index')

    wrapper.vm.resetFilters()

    expect(store.state.search.index).toBe('my-index')
  })

  it('should not change the globalSearch setting on filters reset', () => {
    store.commit('search/setGlobalSearch', false)

    wrapper.vm.resetFilters()

    expect(store.state.search.globalSearch).toBeFalsy()
  })

  it('should not change the starredDocuments on filters reset', () => {
    store.commit('search/starredDocuments', ['doc_01', 'doc_02'])

    wrapper.vm.resetFilters()

    expect(store.state.search.starredDocuments).toEqual(['doc_01', 'doc_02'])
  })

  it('should emit an event "bv::hide::popover" on filters reset', () => {
    const mockCallback = jest.fn()
    wrapper.vm.$root.$on('bv::hide::popover', mockCallback)

    wrapper.vm.resetFilters()

    expect(mockCallback.mock.calls).toHaveLength(1)
  })

  it('should emit an event "filter::search::reset-filters" on filters reset', () => {
    const mockCallback = jest.fn()
    wrapper.vm.$root.$on('filter::search::reset-filters', mockCallback)

    wrapper.vm.resetFilters()

    expect(mockCallback.mock.calls).toHaveLength(1)
  })

  it('should call router push on filters reset', () => {
    jest.spyOn(router, 'push')

    wrapper.vm.resetFilters()

    expect(router.push).toBeCalled()
  })
})
