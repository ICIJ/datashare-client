import find from 'lodash/find'
import toLower from 'lodash/toLower'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import VueRouter from 'vue-router'

import { Core } from '@/core'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import SearchResultsAppliedFilter from '@/components/SearchResultsAppliedFilter'

const { localVue, store } = Core.init(createLocalVue()).useAll()
const router = new VueRouter()

describe('SearchResultsAppliedFilter.vue', () => {
  const index = toLower('SearchResultsAppliedFilter')
  esConnectionHelper(index)
  let wrapper

  beforeAll(() => store.commit('search/index', index))

  beforeEach(() => {
    wrapper = shallowMount(SearchResultsAppliedFilter, { localVue, store, router, propsData: { filter: { label: 'term_01', value: 'term_01', field: '', negation: false } } })
  })

  describe('displays applied filter', () => {
    it('should display a filter', () => {
      expect(wrapper.findAll('.search-results-header__applied-filters__filter')).toHaveLength(1)
      expect(wrapper.find('.search-results-header__applied-filters__filter').text()).toBe('term_01')
      expect(wrapper.findAll('.search-results-header__applied-filters__filter.strikethrough')).toHaveLength(0)
    })

    it('should display an applied filter as strikethrough if excluded', () => {
      wrapper = shallowMount(SearchResultsAppliedFilter, { localVue, router, store, propsData: { filter: { label: 'term_01', value: 'term_01', field: '', negation: true } } })

      expect(wrapper.findAll('.search-results-header__applied-filters__filter')).toHaveLength(1)
      expect(wrapper.find('.search-results-header__applied-filters__filter').text()).toBe('term_01')
      expect(wrapper.findAll('.search-results-header__applied-filters__filter.strikethrough')).toHaveLength(1)
    })
  })

  describe('deletes applied filter', () => {
    it('should click on a badge to delete an applied filter', () => {
      wrapper = mount(SearchResultsAppliedFilter, { localVue, store, router, propsData: { filter: { label: 'term_01', value: 'term_01', field: '', negation: false } } })
      const deleteQueryTermMock = jest.spyOn(wrapper.vm, 'deleteQueryTerm')

      wrapper.find('.search-results-header__applied-filters__filter').trigger('click')

      expect(deleteQueryTermMock).toBeCalledTimes(1)
    })

    it('should delete a filter term', () => {
      store.commit('search/addFilterValue', { name: 'contentType', value: 'term_01' })
      wrapper = mount(SearchResultsAppliedFilter, { localVue, store, router, propsData: { filter: { name: 'contentType', label: 'term_01', value: 'term_01', field: '', negation: false } } })

      wrapper.find('.search-results-header__applied-filters__filter').trigger('click')

      expect(find(store.getters['search/instantiatedFilters'], { name: 'contentType' }).values).toHaveLength(0)
    })

    it('should emit an event filter::search::update once the applied filter is deleted from the store', async () => {
      wrapper = shallowMount(SearchResultsAppliedFilter, { localVue, store, router, propsData: { filter: { name: 'filter-name', label: 'term_01', value: 'term_01', field: '', negation: false } } })
      const mockCallback = jest.fn()
      wrapper.vm.$root.$on('filter::search::update', mockCallback)

      await wrapper.vm.deleteQueryTerm()

      expect(mockCallback.mock.calls).toHaveLength(1)
    })

    it('should not emit an event filter::search::update once the applied filter is deleted from the store', async () => {
      const mockCallback = jest.fn()
      wrapper.vm.$root.$on('filter::search::update', mockCallback)

      await wrapper.vm.deleteQueryTerm()

      expect(mockCallback.mock.calls).toHaveLength(0)
    })
  })
})
