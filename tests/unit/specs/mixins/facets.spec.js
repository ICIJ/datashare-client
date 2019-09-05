import Vuex from 'vuex'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import App from '@/pages/App'
import Facet from '@/components/Facet'
import facets from '@/mixins/facets'
import VueProgressBar from 'vue-progressbar'
import router from '@/router'
import store from '@/store'

window.matchMedia = jest.fn().mockImplementation(query => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn()
  }
})

const localVue = createLocalVue()
localVue.use(VueProgressBar, { color: '#852308' })
localVue.use(Murmur)
localVue.use(Vuex)

describe('facets mixin', () => {
  let wrapper, selectedValuesFromStore, facet

  beforeAll(() => {
    facet = { name: 'creation-date', itemParam: item => { return { name: 'creation-date', value: item } } }
  })

  it('should commit a setFacetValue and then refresh the route and the search', () => {
    const state = { facets: store.state.search.facets }
    const mutations = { setFacetValue: jest.fn() }
    const actions = { query: jest.fn() }
    const localStore = new Vuex.Store({ modules: { search: { namespaced: true, state, mutations, actions } } })
    wrapper = shallowMount(App, { localVue, router, store: localStore, mixins: [facets], propsData: { facet } })
    jest.spyOn(wrapper.vm, 'refreshRouteAndSearch')

    wrapper.vm.setValue('42')

    expect(mutations.setFacetValue).toBeCalled()
    expect(wrapper.vm.refreshRouteAndSearch).toBeCalled()
  })

  describe('tests run on specific wrapper', () => {
    beforeEach(() => {
      selectedValuesFromStore = jest.fn()
      wrapper = shallowMount(Facet, { localVue, router, store, mixins: [facets], methods: { selectedValuesFromStore }, propsData: { facet } })
      selectedValuesFromStore.mockClear()
    })

    it('should refresh the facet on "facet::search::update" event emitted', () => {
      wrapper.vm.$root.$emit('facet::search::update', 'creation-date')

      expect(selectedValuesFromStore.mock.calls).toHaveLength(1)
    })

    it('should emit an event "reset-facet-values" on resetFacetValues', () => {
      wrapper.vm.resetFacetValues()

      expect(wrapper.emitted('reset-facet-values')).toHaveLength(1)
    })

    it('should refresh the route', () => {
      jest.spyOn(router, 'push')

      wrapper.vm.refreshRoute()

      expect(router.push).toBeCalled()
    })

    it('should emit an event "selected-values-from-store" on selectedValuesFromStore', () => {
      wrapper = shallowMount(Facet, { localVue, router, store, mixins: [facets], propsData: { facet } })
      wrapper.vm.selectedValuesFromStore()

      expect(wrapper.emitted('selected-values-from-store')).toHaveLength(2)
    })
  })
})
