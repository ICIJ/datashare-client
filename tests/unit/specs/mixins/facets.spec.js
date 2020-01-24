import Vuex from 'vuex'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { App as MainApp } from '@/main'

import App from '@/pages/App'
import Facet from '@/components/Facet'
import facets from '@/mixins/facets'

const { i18n, localVue, router, store } = MainApp.init(createLocalVue()).useAll()

describe('facets mixin', () => {
  let wrapper, selectedValuesFromStore, facet

  beforeAll(() => {
    facet = { name: 'creationDate', itemParam: item => { return { name: 'creationDate', value: item } } }
  })

  it('should commit a setFacetValue and then refresh the route and the search', () => {
    const state = { facets: store.state.search.facets }
    const mutations = { setFacetValue: jest.fn() }
    const actions = { query: jest.fn() }
    const localStore = new Vuex.Store({ modules: { search: { namespaced: true, state, mutations, actions } } })
    wrapper = shallowMount(App, { localVue, i18n, router, store: localStore, mixins: [facets], propsData: { facet } })
    jest.spyOn(wrapper.vm, 'refreshRouteAndSearch')

    wrapper.vm.setValue('42')

    expect(mutations.setFacetValue).toBeCalled()
    expect(wrapper.vm.refreshRouteAndSearch).toBeCalled()
  })

  describe('tests run on specific wrapper', () => {
    beforeEach(() => {
      selectedValuesFromStore = jest.fn()
      wrapper = shallowMount(Facet, { localVue, i18n, router, store, mixins: [facets], methods: { selectedValuesFromStore }, propsData: { facet } })
      selectedValuesFromStore.mockClear()
    })

    it('should refresh the facet on "facet::search::update" event emitted', () => {
      wrapper.vm.$root.$emit('facet::search::update', 'creationDate')

      expect(selectedValuesFromStore.mock.calls).toHaveLength(1)
    })

    it('should refresh the route', () => {
      jest.spyOn(router, 'push')

      wrapper.vm.refreshRoute()

      expect(router.push).toBeCalled()
    })

    it('should emit an event "selected-values-from-store" on selectedValuesFromStore', () => {
      wrapper = shallowMount(Facet, { localVue, i18n, router, store, mixins: [facets], propsData: { facet } })
      wrapper.vm.selectedValuesFromStore()

      expect(wrapper.emitted('selected-values-from-store')).toHaveLength(2)
    })
  })

  describe('on resetFacetValues', () => {
    it('should set "isAllSelected" as "true"', () => {
      wrapper.vm.$set(wrapper.vm, 'isAllSelected', false)

      wrapper.vm.resetFacetValues()

      expect(wrapper.vm.isAllSelected).toBeTruthy()
    })

    it('should empty "selected" value', () => {
      wrapper.vm.$set(wrapper.vm, 'selected', ['item'])

      wrapper.vm.resetFacetValues()

      expect(wrapper.vm.selected).toHaveLength(0)
    })

    it('should reset the exclude value to "false"', () => {
      wrapper.vm.$store.commit('search/toggleFacet', facet.name)

      wrapper.vm.resetFacetValues()

      expect(wrapper.vm.isReversed()).toBeFalsy()
    })

    it('should emit an event "reset-facet-values"', () => {
      wrapper._emitted['reset-facet-values'] = []

      wrapper.vm.resetFacetValues()

      expect(wrapper.emitted('reset-facet-values')).toHaveLength(1)
    })
  })
})
