import Vuex from 'vuex'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import App from '@/pages/App'
import facets from '@/mixins/facets'
import VueProgressBar from 'vue-progressbar'
import router from '@/router'
import store from '@/store'

jest.mock('v-calendar/lib/v-calendar.min.css', () => {})

const localVue = createLocalVue()
localVue.use(VueProgressBar, { color: '#852308' })
localVue.use(Murmur)
localVue.use(Vuex)

describe('facets mixin', () => {
  let wrapper

  it('should refresh the facet on "facet::search::update" event emitted', async () => {
    const selectedValuesFromStore = jest.fn()
    wrapper = shallowMount(App, { localVue, router, mixins: [facets], methods: { selectedValuesFromStore }, propsData: { facet: { name: 'facet-name' } } })
    selectedValuesFromStore.mockClear()

    wrapper.vm.$root.$emit('facet::search::update', 'facet-name')

    expect(selectedValuesFromStore.mock.calls).toHaveLength(1)
  })

  it('should emit an event "reset-facet-values" on resetFacetValues()', () => {
    wrapper = shallowMount(App, { localVue, router, mixins: [facets] })

    wrapper.vm.resetFacetValues()

    expect(wrapper.emitted('reset-facet-values')).toHaveLength(1)
  })

  it('should refresh the route', () => {
    const wrapper = shallowMount(App, { localVue, mixins: [facets], router, store })
    jest.spyOn(router, 'push')

    wrapper.vm.refreshRoute()

    expect(router.push).toHaveBeenCalled()
  })

  it('should commit a setFacetValue and then refresh the route and the search', () => {
    const state = { facets: store.state.search.facets }
    const mutations = { setFacetValue: jest.fn() }
    const actions = { query: jest.fn() }
    const localStore = new Vuex.Store({ modules: { search: { namespaced: true, state, mutations, actions } } })
    const facet = {
      name: 'creation-date',
      itemParam: item => {
        return { name: 'creation-date', value: item }
      }
    }
    wrapper = shallowMount(App, { localVue, router, store: localStore, mixins: [facets], propsData: { facet } })
    jest.spyOn(wrapper.vm, 'refreshRouteAndSearch')

    wrapper.vm.setValue('42')

    expect(mutations.setFacetValue).toBeCalled()
    expect(wrapper.vm.refreshRouteAndSearch).toBeCalled()
  })
})
