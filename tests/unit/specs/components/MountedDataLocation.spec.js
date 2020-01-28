import MountedDataLocation from '@/components/MountedDataLocation'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Murmur from '@icij/murmur'
import { App } from '@/main'

jest.mock('@/api', () => {
  const { jsonResp } = require('tests/unit/tests_utils')
  return jest.fn(() => {
    return {
      deleteAll: jest.fn().mockReturnValue(jsonResp()),
      deleteBatchSearches: jest.fn().mockReturnValue(jsonResp())
    }
  })
})

const { localVue, store } = App.init(createLocalVue()).useAll()

describe('MountedDataLocation', () => {
  let wrapper

  beforeEach(async () => {
    Murmur.config.set('mountedDataDir', '/foo/bar')
    wrapper = shallowMount(MountedDataLocation, { localVue, store, mocks: { $t: msg => msg }, sync: false })
  })

  afterAll(() => jest.unmock('@/api'))

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
