import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import MountedDataLocation from '@/components/MountedDataLocation'

describe('MountedDataLocation.vue', () => {
  const api = {
    deleteBatchSearches: vi.fn(),
    deleteAll: vi.fn(),
    getUser: vi.fn(),
    createProject: vi.fn()
  }

  const { config, plugins, store, on } = CoreSetup.init(api).useAll()
  let wrapper

  beforeEach(() => {
    config.set('mountedDataDir', '/foo/bar')
    wrapper = shallowMount(MountedDataLocation, { global: { plugins } })
  })

  it('should display the delete index button', () => {
    expect(wrapper.find('.mounted-data-location__delete-index').exists()).toBeTruthy()
  })

  it('should display the path to the mounted data directory', () => {
    expect(wrapper.find('.mounted-data-location__value').text()).toBe('/foo/bar')
  })

  it('should emit an index::delete::all event when calling the deleteAll method', async () => {
    const mockCallback = vi.fn()
    on('index::delete::all', mockCallback)

    await wrapper.vm.deleteAll()

    expect(mockCallback).toBeCalledTimes(1)
  })

  it('should reset batchSearches when calling the deleteAll method', async () => {
    store.commit('batchSearch/batchSearches', ['batchSearch_01', 'batchSearch_02', 'batchSearch_03'])

    await wrapper.vm.deleteAll()

    expect(store.state.batchSearch.batchSearches).toEqual([])
  })
})
