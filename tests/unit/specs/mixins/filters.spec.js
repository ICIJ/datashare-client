import Vuex from 'vuex'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { Core } from '@/core'

import App from '@/pages/App'
import FilterBoilerplate from '@/components/FilterBoilerplate'
import filters from '@/mixins/filters'

const { i18n, localVue, router, store, wait } = Core.init(createLocalVue()).useAll()

describe('filters mixin', () => {
  let wrapper, selectedValuesFromStore, filter

  beforeAll(() => {
    filter = { name: 'creationDate', itemParam: item => { return { name: 'creationDate', value: item } } }
  })

  it('should commit a setFilterValue and then refresh the route and the search', () => {
    const state = { ...store.state.search }
    const mutations = { setFilterValue: jest.fn() }
    const actions = { query: jest.fn() }
    const getters = { toRouteQuery: () => jest.fn() }
    const localStore = new Vuex.Store({ modules: { search: { namespaced: true, state, mutations, actions, getters } } })
    wrapper = shallowMount(App, { localVue, i18n, router, wait, store: localStore, mixins: [filters], propsData: { filter } })
    jest.spyOn(wrapper.vm, 'refreshRouteAndSearch')

    wrapper.vm.setValue('42')

    expect(mutations.setFilterValue).toBeCalled()
    expect(wrapper.vm.refreshRouteAndSearch).toBeCalled()
  })

  describe('tests run on specific wrapper', () => {
    beforeEach(() => {
      selectedValuesFromStore = jest.fn()
      wrapper = shallowMount(FilterBoilerplate, { localVue, i18n, router, store, wait, mixins: [filters], methods: { selectedValuesFromStore }, propsData: { filter } })
      selectedValuesFromStore.mockClear()
    })

    it('should refresh the filter on "filter::search::update" event emitted', () => {
      wrapper.vm.$root.$emit('filter::search::update', 'creationDate')

      expect(selectedValuesFromStore.mock.calls).toHaveLength(1)
    })

    it('should refresh the route', () => {
      jest.spyOn(router, 'push')

      wrapper.vm.refreshRoute()

      expect(router.push).toBeCalled()
    })

    it('should emit an event "selected-values-from-store" on selectedValuesFromStore', () => {
      wrapper = shallowMount(FilterBoilerplate, { localVue, i18n, router, store, wait, mixins: [filters], propsData: { filter } })
      wrapper.vm.selectedValuesFromStore()

      expect(wrapper.emitted('selected-values-from-store')).toHaveLength(2)
    })
  })

  describe('on resetFilterValues', () => {
    it('should set "isAllSelected" as "true"', () => {
      wrapper.vm.$set(wrapper.vm, 'isAllSelected', false)

      wrapper.vm.resetFilterValues()

      expect(wrapper.vm.isAllSelected).toBeTruthy()
    })

    it('should empty "selected" value', () => {
      wrapper.vm.$set(wrapper.vm, 'selected', ['item'])

      wrapper.vm.resetFilterValues()

      expect(wrapper.vm.selected).toHaveLength(0)
    })

    it('should reset the exclude value to "false"', () => {
      wrapper.vm.$store.commit('search/toggleFilter', filter.name)

      wrapper.vm.resetFilterValues()

      expect(wrapper.vm.isReversed()).toBeFalsy()
    })

    it('should emit an event "reset-filter-values"', () => {
      wrapper._emitted['reset-filter-values'] = []

      wrapper.vm.resetFilterValues()

      expect(wrapper.emitted('reset-filter-values')).toHaveLength(1)
    })
  })
})
