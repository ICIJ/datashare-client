import Vuex from 'vuex'
import { App } from '@/main'
import Search from '@/pages/Search'
import { actions, getters, state, mutations } from '@/store/modules/search'
import { createLocalVue, shallowMount } from '@vue/test-utils'

const { localVue, router } = App.init(createLocalVue()).useAll()

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
        },
        document: {
          namespaced: true
        }
      }
    })
    wrapper = shallowMount(Search, { localVue, router, store: localStore })
  })

  it('should refresh the view on custom event', () => {
    wrapper.vm.$root.$emit('index::delete::all')

    expect(actions.query).toBeCalledTimes(2)
  })

  it('should execute a new search on event "facet::starred:refresh"', () => {
    wrapper.vm.$root.$emit('facet::starred:refresh')

    expect(actions.refresh).toBeCalledTimes(1)
  })

  it('should redirect to the complete query', () => {
    const query = 'this is a query'
    localStore.commit('search/query', query)

    expect(wrapper.find('.search__body__backdrop').props('to')).toMatchObject({ name: 'search', query: { q: query } })
  })
})
