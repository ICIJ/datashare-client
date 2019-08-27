import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'
import VueI18n from 'vue-i18n'
import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'

import MountedDataLocation from '@/components/MountedDataLocation'
import messages from '@/lang/en'
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

jest.mock('@/api/DatashareClient', () => {
  const { jsonOk } = require('tests/unit/tests_utils')
  return jest.fn(() => {
    return {
      deleteAll: jest.fn().mockReturnValue(jsonOk()),
      deleteBatchSearches: jest.fn().mockReturnValue(jsonOk())
    }
  })
})

const localVue = createLocalVue()
localVue.use(Murmur)
localVue.use(VueI18n)
localVue.use(BootstrapVue)
localVue.use(Vuex)

const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('MountedDataLocation.vue', () => {
  let wrapper

  beforeEach(async () => {
    Murmur.config.set('mountedDataDir', '/foo/bar')
    wrapper = shallowMount(MountedDataLocation, { localVue, i18n, router, store })
  })

  afterAll(() => jest.unmock('@/api/DatashareClient'))

  it('should display the delete index button', () => {
    expect(wrapper.find('.mounted-data-location__delete-index').exists()).toBeTruthy()
  })

  it('should display the path to the mounted data directory', () => {
    expect(wrapper.find('.mounted-data-location__value').text()).toBe('/foo/bar')
  })

  it('should emit an index::delete::all event when calling the deleteAll method', async () => {
    const mockCallback = jest.fn()
    wrapper.vm.$root.$on('index::delete::all', mockCallback)

    await wrapper.vm.deleteAll()

    expect(mockCallback.mock.calls).toHaveLength(1)
  })

  it('should reset batchSearches and userHistory when calling the deleteAll method', async () => {
    store.commit('batchSearch/batchSearches', ['batchSearch_01', 'batchSearch_02', 'batchSearch_03'])
    store.commit('userHistory/addDocument', { '_id': 12, '_version': 'local' })

    await wrapper.vm.deleteAll()

    expect(store.state.batchSearch.batchSearches).toEqual([])
    expect(store.state.userHistory.rawDocuments).toEqual([])
  })
})
