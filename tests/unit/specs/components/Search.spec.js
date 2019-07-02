import Search from '@/components/Search'
import Vuex from 'vuex'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import router from '@/router'
import store from '@/store'
import VueProgressBar from 'vue-progressbar'

const localVue = createLocalVue()
localVue.use(Murmur)
localVue.use(VueProgressBar, { color: '#000' })

describe('Search.vue', () => {
  let wrapper, actions

  beforeEach(() => {
    actions = { query: jest.fn() }
    const store = new Vuex.Store({ modules: { search: { namespaced: true, actions } } })
    wrapper = shallowMount(Search, { localVue, router, store })
  })

  it('should refresh the view on custom event', () => {
    wrapper.vm.$root.$emit('index::delete::all')
    expect(actions.query).toHaveBeenCalledTimes(2)
  })

  it('should execute a new search on event "facet::starred:refresh"', () => {
    wrapper.vm.$root.$emit('facet::starred:refresh')
    expect(actions.query).toHaveBeenCalledTimes(2)
  })

  it('should redirect to the complete query', async () => {
    wrapper = shallowMount(Search, { localVue, router, store })
    store.commit('search/query', 'this is a query')

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.search__body__document__backdrop').props('to')).toEqual({ name: 'search', query: { q: 'this is a query', from: 0, size: 25, sort: 'relevance', index: '' } })
  })
})
