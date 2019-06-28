import Search from '@/components/Search'
import Vuex from 'vuex'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import router from '@/router'
import { EventBus } from '@/utils/event-bus'

const localVue = createLocalVue()
localVue.use(Murmur)

describe('Search.vue', () => {
  let wrapper, actions

  beforeEach(() => {
    actions = { query: jest.fn() }
    const store = new Vuex.Store({ modules: { search: { namespaced: true, actions } } })
    wrapper = shallowMount(Search, { localVue, router, store })
  })

  it('should refresh the view on custom event', () => {
    EventBus.$emit('index::delete::all')
    expect(actions.query).toHaveBeenCalledTimes(2)
  })

  it('should execute a new search on event "facet::starred:refresh"', () => {
    wrapper.vm.$root.$emit('facet::starred:refresh')
    expect(actions.query).toHaveBeenCalledTimes(2)
  })
})
