import Search from '@/components/Search'
import Vuex from 'vuex'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import router from '@/router'
import { EventBus } from '@/utils/event-bus'

const localVue = createLocalVue()
localVue.use(Murmur)

describe('Search.vue', () => {
  it('should refresh the view on custom event', () => {
    console.log('****')
    const actions = { query: jest.fn() }
    const store2 = new Vuex.Store({ modules: { search: { namespaced: true, actions } } })
    shallowMount(Search, { localVue, router, store: store2 })
    EventBus.$emit('index::delete::all')
    expect(actions.query).toHaveBeenCalled()
  })
})
