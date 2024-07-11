import { mount, shallowMount } from '@vue/test-utils'
import { beforeEach } from 'vitest'

import CoreSetup from '~tests/unit/CoreSetup'
import FilterBoilerplate from '@/components/Filter/FilterBoilerplate'
import filters from '@/mixins/filters'

// Mock the refreshRouteAndSearch method to avoid unnecessary route update
filters.methods.refreshRouteAndSearch = vi.fn()

describe('FilterBoilerplate.vue', () => {
  let core, props

  beforeEach(() => {
    const elasticsearch = { searchFilter: vi.fn().mockResolvedValue({}) }
    core = CoreSetup.init({ elasticsearch }).useAll().useRouter()
    props = {
      filter: core.store.getters['search/getFilter']({
        name: 'contentType'
      })
    }
  })

  describe('setting a filter value', () => {
    let wrapper = null

    beforeEach(() => {
      wrapper = shallowMount(FilterBoilerplate, {
        props,
        global: {
          plugins: core.plugins
        }
      })
    })

    it('should commit a setFilterValue and then refresh the route and the search', () => {
      vi.spyOn(wrapper.vm, 'refreshRouteAndSearch')
      wrapper.vm.setValue(['42'])
      expect(wrapper.vm.refreshRouteAndSearch).toBeCalled()
    })

    it('should refresh the route', () => {
      vi.spyOn(core.router, 'push')
      wrapper.vm.refreshRoute()
      expect(core.router.push).toBeCalled()
    })
  })

  describe('on resetFilterValues', () => {
    let wrapper = null

    beforeEach(() => {
      wrapper = shallowMount(FilterBoilerplate, {
        props,
        global: {
          plugins: core.plugins
        }
      })
    })

    it('should empty "selected" value', () => {
      wrapper.setData({ selected: ['item'] })
      wrapper.vm.resetFilterValues()
      expect(wrapper.vm.selected).toHaveLength(0)
    })

    it('should reset the exclude value to "false"', () => {
      wrapper.vm.$store.commit('search/toggleFilter', 'contentType')
      wrapper.vm.resetFilterValues()
      expect(wrapper.vm.excluded).toBeFalsy()
    })

    it('should emit an event "reset-filter-values"', () => {
      wrapper.vm.resetFilterValues()
      expect(wrapper.emitted('reset-filter-values')).toHaveLength(1)
    })

    it('should maintain the checkbox checked when clicking two times on "all"', () => {
      const wrapper = mount(FilterBoilerplate, {
        props,
        global: {
          plugins: core.plugins
        }
      })
      wrapper.find('.filter__items__all input').trigger('click')
      expect(wrapper.find('.filter__items__all input').element.checked).toBeTruthy()
      expect(wrapper.vm.isAllSelected).toBeTruthy()
      wrapper.find('.filter__items__all input').trigger('click')
      expect(wrapper.find('.filter__items__all input').element.checked).toBeTruthy()
      expect(wrapper.vm.isAllSelected).toBeTruthy()
    })

    it('should disable the checkbox to select "all" when already selected', () => {
      const wrapper = mount(FilterBoilerplate, {
        props,
        global: {
          plugins: core.plugins
        }
      })
      wrapper.vm.isAllSelected = true
      expect(wrapper.find('.filter__items__all input').element.checked).toBeTruthy()
      expect(wrapper.find('.filter__items__all input').element.disabled).toBeTruthy()
    })
  })

  describe('with integers keys', () => {
    let wrapper = null

    beforeEach(() => {
      const itemsWithExcludedValues = () => {
        return [
          { key: 0, doc_count: 12 },
          { key: 1, doc_count: 15 }
        ]
      }

      wrapper = shallowMount(FilterBoilerplate, {
        computed: { ...FilterBoilerplate.computed, itemsWithExcludedValues },
        global: { plugins: core.plugins },
        props
      })
    })

    it('should cast items into string', () => {
      expect(wrapper.vm.options).toEqual([
        { item: { key: 0, doc_count: 12 }, value: '0', label: '0' },
        { item: { key: 1, doc_count: 15 }, value: '1', label: '1' }
      ])
    })
  })

  describe('with translated keys', () => {
    let wrapper = null

    beforeEach(() => {
      const itemsWithExcludedValues = () => {
        return [
          { key: 'lang.CATALAN', doc_count: 12 },
          { key: 'lang.FRENCH', doc_count: 15 }
        ]
      }

      wrapper = shallowMount(FilterBoilerplate, {
        computed: { ...FilterBoilerplate.computed, itemsWithExcludedValues },
        global: { plugins: core.plugins },
        props
      })
    })

    it('should show the translation', () => {
      expect(wrapper.vm.options).toEqual([
        { item: { key: 'lang.CATALAN', doc_count: 12 }, value: 'lang.CATALAN', label: 'Catalan' },
        { item: { key: 'lang.FRENCH', doc_count: 15 }, value: 'lang.FRENCH', label: 'French' }
      ])
    })
  })

  describe('without translated keys', () => {
    let wrapper = null

    beforeEach(() => {
      const noItemTranslation = true
      const itemsWithExcludedValues = () => {
        return [
          { key: 'lang.CATALAN', doc_count: 12 },
          { key: 'lang.FRENCH', doc_count: 15 }
        ]
      }

      wrapper = shallowMount(FilterBoilerplate, {
        computed: { ...FilterBoilerplate.computed, itemsWithExcludedValues },
        global: { plugins: core.plugins },
        props: { ...props, noItemTranslation }
      })
    })

    it('should show the orinal key value', () => {
      expect(wrapper.vm.options).toEqual([
        { item: { key: 'lang.CATALAN', doc_count: 12 }, value: 'lang.CATALAN', label: 'lang.CATALAN' },
        { item: { key: 'lang.FRENCH', doc_count: 15 }, value: 'lang.FRENCH', label: 'lang.FRENCH' }
      ])
    })
  })
})
