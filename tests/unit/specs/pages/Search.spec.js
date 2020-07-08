import cloneDeep from 'lodash/cloneDeep'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { errors as esErrors } from 'elasticsearch-browser'
import VueRouter from 'vue-router'
import Vuex from 'vuex'

import { Core } from '@/core'
import Search from '@/pages/Search'
import { state, getters, mutations, actions } from '@/store/modules/search'

describe('Search.vue', () => {
  let store
  let wrapper = null
  const { i18n, localVue } = Core.init(createLocalVue()).useAll()
  const router = new VueRouter()
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
    wrapper = shallowMount(Search, { i18n, localVue, router, store })
  })

  it('should refresh the view on custom event', () => {
    wrapper.vm.$root.$emit('index::delete::all')

    expect(actionsStore.query).toBeCalledTimes(2)
  })

  it('should execute a new search on event "filter::starred::refresh"', () => {
    wrapper.vm.$root.$emit('filter::starred::refresh')

    expect(actionsStore.refresh).toBeCalledTimes(1)
  })

  it('should redirect to the complete query', async () => {
    const query = 'this is a query'
    await store.commit('search/query', query)

    expect(wrapper.find('.search__body__backdrop').props('to')).toMatchObject({ name: 'search', query: { q: query } })
  })

  describe('refresh button on request timeout', () => {
    it('should return true for isRequestTimeoutError if error is RequestTimeout', () => {
      store.commit('search/error', new esErrors.RequestTimeout())
      expect(wrapper.vm.isRequestTimeoutError).toBeTruthy()
    })

    it('should return false for isRequestTimeoutError if error is NOT RequestTimeout', () => {
      store.commit('search/error', new esErrors.NoConnections())
      expect(wrapper.vm.isRequestTimeoutError).toBeFalsy()
    })

    it('should display a button to try again if error is RequestTimeout', async () => {
      await store.commit('search/error', new esErrors.RequestTimeout())
      expect(wrapper.find('b-button-stub').exists()).toBeTruthy()
    })
  })
})
