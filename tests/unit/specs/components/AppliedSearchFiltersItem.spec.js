import find from 'lodash/find'
import { mount, shallowMount } from '@vue/test-utils'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import AppliedSearchFiltersItem from '@/components/AppliedSearchFiltersItem'
import { useSearchStore } from '@/store/modules'

describe('AppliedSearchFiltersItem.vue', () => {
  const { index, es } = esConnectionHelper.build()
  const api = { elasticsearch: es }
  let core, searchStore

  beforeEach(() => {
    core = CoreSetup.init(api).useAll().useRouter()
    searchStore = useSearchStore()
    searchStore.setIndex(index)
  })

  describe('displays applied filter', () => {
    it('should display a filter', () => {
      const props = { filter: { name: 'contentType', value: 'term_01', negation: false } }
      const { plugins } = core
      const wrapper = shallowMount(AppliedSearchFiltersItem, {
        global: { plugins, renderStubDefaultSlot: true },
        props
      })
      expect(wrapper.findAll('.applied-search-filters-item')).toHaveLength(1)
      expect(wrapper.find('.applied-search-filters-item__wrapper__value').text()).toBe('term_01')
      expect(wrapper.findAll('.applied-search-filters-item--negation')).toHaveLength(0)
    })

    it('should display an applied filter as strikethrough if excluded', () => {
      const props = { filter: { name: 'contentType', value: 'term_01', negation: true } }
      const { plugins } = core
      const wrapper = shallowMount(AppliedSearchFiltersItem, {
        global: { plugins, renderStubDefaultSlot: true },
        props
      })

      expect(wrapper.findAll('.applied-search-filters-item')).toHaveLength(1)
      expect(wrapper.find('.applied-search-filters-item__wrapper__value').text()).toBe('term_01')
      expect(wrapper.findAll('.applied-search-filters-item--negation')).toHaveLength(1)
    })
  })

  describe('deletes applied filter', () => {
    it('should click on a badge to delete an applied filter', () => {
      const props = { filter: { name: 'contentType', value: 'term_01', negation: false } }
      const { plugins } = core
      const wrapper = mount(AppliedSearchFiltersItem, { global: { plugins }, props })
      const deleteQueryTermSpy = vi.spyOn(wrapper.vm, 'deleteQueryTerm')

      wrapper.find('.applied-search-filters-item').trigger('click')

      expect(deleteQueryTermSpy).toBeCalledTimes(1)
    })

    it('should delete a filter term', async () => {
      searchStore.addFilterValue({ name: 'contentType', value: 'term_01' })
      const props = { filter: { name: 'contentType', value: 'term_01', negation: false } }
      const { plugins } = core
      const wrapper = mount(AppliedSearchFiltersItem, { global: { plugins }, props })

      await wrapper.find('.applied-search-filters-item').trigger('click')

      expect(find(searchStore.instantiatedFilters, { name: 'contentType' }).values).toHaveLength(0)
    })
  })
})
