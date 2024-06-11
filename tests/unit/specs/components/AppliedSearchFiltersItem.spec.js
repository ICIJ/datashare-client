import find from 'lodash/find'
import { mount, shallowMount } from '@vue/test-utils'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import AppliedSearchFiltersItem from '@/components/AppliedSearchFiltersItem'
import CoreSetup from '~tests/unit/CoreSetup'
import { EventBus } from '@/utils/event-bus'

describe('AppliedSearchFiltersItem.vue', () => {
  const { index, es } = esConnectionHelper.build()
  const api = { elasticsearch: es }
  const { plugins, store } = CoreSetup.init(api).useAll().useRouter()
  let wrapper

  beforeAll(() => store.commit('search/index', index))

  beforeEach(() => {
    const props = { filter: { name: 'contentType', value: 'term_01', negation: false } }
    wrapper = shallowMount(AppliedSearchFiltersItem, { global: { plugins, renderStubDefaultSlot: true }, props })
  })

  describe('displays applied filter', () => {
    it('should display a filter', () => {
      expect(wrapper.findAll('.applied-search-filters-item')).toHaveLength(1)
      expect(wrapper.find('.applied-search-filters-item__wrapper__value').text()).toBe('term_01')
      expect(wrapper.findAll('.applied-search-filters-item--negation')).toHaveLength(0)
    })

    it('should display an applied filter as strikethrough if excluded', () => {
      const props = { filter: { name: 'contentType', value: 'term_01', negation: true } }
      wrapper = shallowMount(AppliedSearchFiltersItem, { global: { plugins, renderStubDefaultSlot: true }, props })

      expect(wrapper.findAll('.applied-search-filters-item')).toHaveLength(1)
      expect(wrapper.find('.applied-search-filters-item__wrapper__value').text()).toBe('term_01')
      expect(wrapper.findAll('.applied-search-filters-item--negation')).toHaveLength(1)
    })
  })

  describe('deletes applied filter', () => {
    it('should click on a badge to delete an applied filter', () => {
      const props = { filter: { name: 'contentType', value: 'term_01', negation: false } }
      wrapper = mount(AppliedSearchFiltersItem, { global: { plugins }, props })
      const deleteQueryTermSpy = vi.spyOn(wrapper.vm, 'deleteQueryTerm')

      wrapper.find('.applied-search-filters-item').trigger('click')

      expect(deleteQueryTermSpy).toBeCalledTimes(1)
    })

    it('should delete a filter term', async () => {
      store.commit('search/addFilterValue', { name: 'contentType', value: 'term_01' })
      const props = { filter: { name: 'contentType', value: 'term_01', negation: false } }
      wrapper = mount(AppliedSearchFiltersItem, { global: { plugins }, props })

      await wrapper.find('.applied-search-filters-item').trigger('click')

      expect(find(store.getters['search/instantiatedFilters'], { name: 'contentType' }).values).toHaveLength(0)
    })

    it('should emit an event filter::search::update once the applied filter is deleted from the store', async () => {
      const props = { filter: { name: 'contentType', value: 'term_01', negation: false } }
      wrapper = shallowMount(AppliedSearchFiltersItem, { global: { plugins }, props })
      const mockCallback = vi.fn()
      EventBus.on('filter::search::update', mockCallback)
      const calls = mockCallback.mock.calls.length

      await wrapper.vm.deleteQueryTerm()
      expect(mockCallback.mock.calls).toHaveLength(calls+1)
      mockCallback.mockClear()
    })

    it('should not emit an event filter::search::update if the filter is a query term', async () => {
      const props = { filter: { name: 'q', value: 'term_01', negation: false } }
      wrapper = shallowMount(AppliedSearchFiltersItem, { global: { plugins }, props })

      const mockCallback = vi.fn()
      EventBus.on('filter::search::update', mockCallback)
      await wrapper.vm.deleteQueryTerm()
      expect(mockCallback.mock.calls).toHaveLength(0)
      mockCallback.mockClear()
    })
  })
})
