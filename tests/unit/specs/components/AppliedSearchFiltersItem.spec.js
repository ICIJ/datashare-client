import find from 'lodash/find'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import VueRouter from 'vue-router'

import { Core } from '@/core'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import AppliedSearchFiltersItem from '@/components/AppliedSearchFiltersItem'

const { localVue, store, i18n } = Core.init(createLocalVue()).useAll()
const router = new VueRouter()

describe('AppliedSearchFiltersItem.vue', () => {
  const { index } = esConnectionHelper.build()
  let wrapper

  beforeAll(() => store.commit('search/index', index))

  beforeEach(() => {
    const propsData = { filter: { name: 'contentType', value: 'term_01', negation: false } }
    wrapper = shallowMount(AppliedSearchFiltersItem, { localVue, i18n, store, router, propsData })
  })

  describe('displays applied filter', () => {
    it('should display a filter', () => {
      expect(wrapper.findAll('.applied-search-filters-item')).toHaveLength(1)
      expect(wrapper.find('.applied-search-filters-item__wrapper__value').text()).toBe('term_01')
      expect(wrapper.findAll('.applied-search-filters-item--negation')).toHaveLength(0)
    })

    it('should display an applied filter as strikethrough if excluded', () => {
      const propsData = { filter: { name: 'contentType', value: 'term_01', negation: true } }
      wrapper = shallowMount(AppliedSearchFiltersItem, { localVue, i18n, router, store, propsData })

      expect(wrapper.findAll('.applied-search-filters-item')).toHaveLength(1)
      expect(wrapper.find('.applied-search-filters-item__wrapper__value').text()).toBe('term_01')
      expect(wrapper.findAll('.applied-search-filters-item--negation')).toHaveLength(1)
    })
  })

  describe('deletes applied filter', () => {
    it('should click on a badge to delete an applied filter', () => {
      const propsData = { filter: { name: 'contentType', value: 'term_01', negation: false } }
      wrapper = mount(AppliedSearchFiltersItem, { localVue, i18n, store, router, propsData })
      const deleteQueryTermSpy = jest.spyOn(wrapper.vm, 'deleteQueryTerm')

      wrapper.find('.applied-search-filters-item').trigger('click')

      expect(deleteQueryTermSpy).toBeCalledTimes(1)
    })

    it('should delete a filter term', () => {
      store.commit('search/addFilterValue', { name: 'contentType', value: 'term_01' })
      const propsData = { filter: { name: 'contentType', value: 'term_01', negation: false } }
      wrapper = mount(AppliedSearchFiltersItem, { localVue, i18n, store, router, propsData })

      wrapper.find('.applied-search-filters-item').trigger('click')

      expect(find(store.getters['search/instantiatedFilters'], { name: 'contentType' }).values).toHaveLength(0)
    })

    it('should emit an event filter::search::update once the applied filter is deleted from the store', async () => {
      const propsData = { filter: { name: 'contentType', value: 'term_01', negation: false } }
      wrapper = shallowMount(AppliedSearchFiltersItem, { localVue, i18n, store, router, propsData })
      const mockCallback = jest.fn()
      wrapper.vm.$root.$on('filter::search::update', mockCallback)

      await wrapper.vm.deleteQueryTerm()

      expect(mockCallback.mock.calls).toHaveLength(1)
    })

    it('should not emit an event filter::search::update if the filter is a query term', async () => {
      const propsData = { filter: { name: 'q', value: 'term_01', negation: false } }
      wrapper = shallowMount(AppliedSearchFiltersItem, { localVue, i18n, store, router, propsData })
      const mockCallback = jest.fn()
      wrapper.vm.$root.$on('filter::search::update', mockCallback)
      await wrapper.vm.deleteQueryTerm()
      expect(mockCallback.mock.calls).toHaveLength(0)
    })
  })
})
