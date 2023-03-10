import { createLocalVue, shallowMount } from '@vue/test-utils'
import { flushPromises } from 'tests/unit/tests_utils'

import ResetFiltersButton from '@/components/ResetFiltersButton'
import { Core } from '@/core'

describe('ResetFiltersButton.vue', function () {
  const { i18n, localVue, router, store } = Core.init(createLocalVue()).useAll()
  let wrapper = null

  beforeEach(() => {
    store.commit('search/resetFilterValues')
    store.commit('search/resetQuery')
    wrapper = shallowMount(ResetFiltersButton, { i18n, localVue, router, store, sync: false })
  })

  it('should display a disabled button by default', () => {
    expect(wrapper.find('.btn').exists()).toBeTruthy()
    expect(wrapper.find('.btn').attributes('disabled')).toBe('disabled')
  })

  it('should display a reset button if query is valuated', async () => {
    store.commit('search/query', 'this is a query')
    await flushPromises()
    expect(wrapper.find('.btn').exists()).toBeTruthy()
    expect(wrapper.find('.btn').attributes('disabled')).toBeUndefined()
  })

  it('should display a reset button if a filter is valuated', async () => {
    store.commit('search/addFilterValue', { name: 'language', value: 'en' })
    await flushPromises()
    expect(wrapper.find('.btn').exists()).toBeTruthy()
    expect(wrapper.find('.btn').attributes('disabled')).toBeUndefined()
  })

  it("shouldn't have filters", () => {
    expect(wrapper.vm.hasFiltersOrQuery).toBeFalsy()
  })

  it('should have filters', () => {
    store.commit('search/addFilterValue', { name: 'language', value: 'en' })
    expect(wrapper.vm.hasFiltersOrQuery).toBeTruthy()
  })

  it('should reset filters on filters reset', () => {
    store.commit('search/addFilterValue', { name: 'language', value: 'en' })

    wrapper.vm.resetFiltersAndQuery()

    expect(wrapper.vm.hasFiltersOrQuery).toBeFalsy()
  })

  it('should reset query on filters reset', () => {
    store.commit('search/query', 'this is a query')

    wrapper.vm.resetFiltersAndQuery()

    expect(store.state.search.query).toBe('')
  })

  it('should not change the index on filters reset', () => {
    store.commit('search/index', 'my-index')

    wrapper.vm.resetFiltersAndQuery()

    expect(store.state.search.index).toBe('my-index')
  })

  it('should not change the starredDocuments on filters reset', () => {
    store.commit('starred/documents', [{ id: 'doc_01' }, { id: 'doc_02' }])

    wrapper.vm.resetFiltersAndQuery()

    expect(store.state.starred.documents).toEqual([{ id: 'doc_01' }, { id: 'doc_02' }])
  })

  it('should emit an event "bv::hide::popover" on filters reset', () => {
    const mockCallback = jest.fn()
    wrapper.vm.$root.$on('bv::hide::popover', mockCallback)

    wrapper.vm.resetFiltersAndQuery()

    expect(mockCallback.mock.calls).toHaveLength(1)
  })

  it('should emit an event "filter::search::reset-filters" on filters reset', () => {
    const mockCallback = jest.fn()
    wrapper.vm.$root.$on('filter::search::reset-filters', mockCallback)

    wrapper.vm.resetFiltersAndQuery()

    expect(mockCallback.mock.calls).toHaveLength(1)
  })

  it('should call router push on filters reset', () => {
    jest.spyOn(router, 'push')

    wrapper.vm.resetFiltersAndQuery()

    expect(router.push).toBeCalled()
  })
})
