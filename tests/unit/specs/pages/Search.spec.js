import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'
import VueProgressBar from 'vue-progressbar'
import VueI18n from 'vue-i18n'
import Vuex from 'vuex'

import Search from '@/pages/Search'
import messages from '@/lang/en'
import router from '@/router'
import { actions, getters, state, mutations } from '@/store/modules/search'
import { createLocalVue, shallowMount } from '@vue/test-utils'

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
localVue.use(BootstrapVue)
localVue.use(Murmur)
localVue.use(VueI18n)
localVue.use(VueProgressBar)
localVue.use(Vuex)

const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

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
