import Vuex from 'vuex'
import { App } from '@/main'
import Search from '@/pages/Search'
import { actions, getters, state, mutations } from '@/store/modules/search'
import { createLocalVue, shallowMount } from '@vue/test-utils'

const { i18n, localVue, router } = App.init(createLocalVue()).useAll()

describe('Search.vue', () => {
  let wrapper, localStore

  beforeEach(() => {
    localStore = new Vuex.Store({
      modules: {
        search: {
          getters,
          state,
          mutations,
          namespaced: true,
          actions: Object.assign(actions, {
            query: jest.fn(),
            refresh: jest.fn()
          })
        }
      }
    })
    wrapper = shallowMount(Search, { localVue, router, i18n, store: localStore })
  })

  it('should refresh the view on custom event', () => {
    wrapper.vm.$root.$emit('index::delete::all')
    expect(actions.query).toHaveBeenCalledTimes(2)
  })

  it('should execute a new search on event "facet::starred:refresh"', () => {
    expect(actions.query).toHaveBeenCalledTimes(1)
    wrapper.vm.$root.$emit('facet::starred:refresh')
    expect(actions.refresh).toHaveBeenCalledTimes(1)
  })

  it('should redirect to the complete query', async () => {
    localStore.commit('search/query', 'this is a query')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.search__body__backdrop').props('to')).toMatchObject({ name: 'search', query: { q: 'this is a query' } })
  })
})
