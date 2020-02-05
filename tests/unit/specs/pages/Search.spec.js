import cloneDeep from 'lodash/cloneDeep'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import Vuex from 'vuex'

import { App } from '@/main'
import Search from '@/pages/Search'
import { state, getters, mutations, actions } from '@/store/modules/search'

const { localVue } = App.init(createLocalVue()).useAll()
const router = new VueRouter()

describe('Search.vue', () => {
  let wrapper, store
  const actionsStore = Object.assign(cloneDeep(actions), { query: jest.fn(), refresh: jest.fn(), updateFromRouteQuery: jest.fn() })

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        search: {
          namespaced: true,
          state: cloneDeep(state),
          getters: cloneDeep(getters),
          mutations: cloneDeep(mutations),
          actions: actionsStore
        },
        document: {
          namespaced: true
        }
      }
    })
    wrapper = shallowMount(Search, { localVue, router, store })
  })

  it('should refresh the view on custom event', () => {
    wrapper.vm.$root.$emit('index::delete::all')

    expect(actionsStore.query).toBeCalledTimes(2)
  })

  it('should execute a new search on event "filter::starred::refresh"', () => {
    wrapper.vm.$root.$emit('filter::starred::refresh')

    expect(actionsStore.refresh).toBeCalledTimes(1)
  })

  it('should redirect to the complete query', () => {
    const query = 'this is a query'
    store.commit('search/query', query)

    expect(wrapper.find('.search__body__backdrop').props('to')).toMatchObject({ name: 'search', query: { q: query } })
  })
})
