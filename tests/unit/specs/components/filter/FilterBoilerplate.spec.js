import { createLocalVue, mount, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import FilterBoilerplate from '@/components/filter/FilterBoilerplate'
import filters from '@/mixins/filters'

// Mock the refreshRouteAndSearch method to avoid unnecessary route update
filters.methods.refreshRouteAndSearch = vi.fn()

describe('FilterBoilerplate.vue', () => {
  const { i18n, localVue, router, store, wait } = Core.init(createLocalVue(), {
    elasticsearch: { searchFilter: vi.fn().mockResolvedValue({}) }
  }).useAll()
  const name = 'contentType'
  const filter = store.getters['search/getFilter']({ name })
  const propsData = { filter }

  describe('setting a filter value', () => {
    let wrapper = null

    beforeEach(() => {
      wrapper = shallowMount(FilterBoilerplate, { i18n, localVue, router, store, wait, propsData })
    })

    it('should commit a setFilterValue and then refresh the route and the search', () => {
      vi.spyOn(wrapper.vm, 'refreshRouteAndSearch')
      wrapper.vm.setValue(['42'])
      expect(wrapper.vm.refreshRouteAndSearch).toBeCalled()
    })

    it('should refresh the route', () => {
      vi.spyOn(router, 'push')
      wrapper.vm.refreshRoute()
      expect(router.push).toBeCalled()
    })
  })

  describe('on resetFilterValues', () => {
    let wrapper = null

    beforeEach(() => {
      wrapper = shallowMount(FilterBoilerplate, { i18n, localVue, router, store, wait, propsData })
    })

    it('should empty "selected" value', () => {
      wrapper.vm.$set(wrapper.vm, 'selected', ['item'])
      wrapper.vm.resetFilterValues()
      expect(wrapper.vm.selected).toHaveLength(0)
    })

    it('should reset the exclude value to "false"', () => {
      wrapper.vm.$store.commit('search/toggleFilter', filter.name)

      wrapper.vm.resetFilterValues()

      expect(wrapper.vm.excluded).toBeFalsy()
    })

    it('should emit an event "reset-filter-values"', () => {
      wrapper._emitted['reset-filter-values'] = []

      wrapper.vm.resetFilterValues()

      expect(wrapper.emitted('reset-filter-values')).toHaveLength(1)
    })

    it('should maintain the checkbox checked when clicking two times on "all"', () => {
      wrapper = mount(FilterBoilerplate, { i18n, localVue, router, store, wait, propsData: { filter } })
      wrapper.find('.filter__items__all input').trigger('click')
      expect(wrapper.find('.filter__items__all input').element.checked).toBeTruthy()
      expect(wrapper.vm.isAllSelected).toBeTruthy()
      wrapper.find('.filter__items__all input').trigger('click')
      expect(wrapper.find('.filter__items__all input').element.checked).toBeTruthy()
      expect(wrapper.vm.isAllSelected).toBeTruthy()
    })

    it('should disable the checkbox to select "all" when already selected', () => {
      wrapper = mount(FilterBoilerplate, { i18n, localVue, router, store, wait, propsData: { filter } })
      wrapper.vm.isAllSelected = true
      expect(wrapper.find('.filter__items__all input').element.checked).toBeTruthy()
      expect(wrapper.find('.filter__items__all input').element.disabled).toBeTruthy()
    })
  })

  describe('with integers keys', () => {
    let wrapper = null

    beforeEach(() => {
      const computed = {
        itemsWithExcludedValues() {
          return [
            { key: 0, doc_count: 12 },
            { key: 1, doc_count: 15 }
          ]
        }
      }

      wrapper = shallowMount(FilterBoilerplate, {
        i18n,
        localVue,
        router,
        store,
        wait,
        propsData: { filter },
        computed
      })
    })

    it('should cast items into string', () => {
      expect(wrapper.vm.options).toEqual([
        { item: { key: 0, doc_count: 12 }, value: '0', label: '0' },
        { item: { key: 1, doc_count: 15 }, value: '1', label: '1' }
      ])
    })
  })

  describe('with integers keys', () => {
    let wrapper = null

    beforeEach(() => {
      const computed = {
        itemsWithExcludedValues() {
          return [
            { key: 0, doc_count: 12 },
            { key: 1, doc_count: 15 }
          ]
        }
      }

      wrapper = shallowMount(FilterBoilerplate, {
        i18n,
        localVue,
        router,
        store,
        wait,
        propsData: { filter },
        computed
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
      const computed = {
        itemsWithExcludedValues() {
          return [
            { key: 'lang.CATALAN', doc_count: 12 },
            { key: 'lang.FRENCH', doc_count: 15 }
          ]
        }
      }

      wrapper = shallowMount(FilterBoilerplate, {
        i18n,
        localVue,
        router,
        store,
        wait,
        propsData: { filter },
        computed
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
      const computed = {
        itemsWithExcludedValues() {
          return [
            { key: 'lang.CATALAN', doc_count: 12 },
            { key: 'lang.FRENCH', doc_count: 15 }
          ]
        }
      }

      wrapper = shallowMount(FilterBoilerplate, {
        i18n,
        localVue,
        router,
        store,
        wait,
        propsData: { filter, noItemTranslation },
        computed
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
