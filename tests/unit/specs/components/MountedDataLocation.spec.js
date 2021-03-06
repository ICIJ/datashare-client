import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import MountedDataLocation from '@/components/MountedDataLocation'
import { Core } from '@/core'

jest.mock('axios')

describe('MountedDataLocation', () => {
  const { i18n, localVue, store } = Core.init(createLocalVue()).useAll()
  let wrapper = null
  Murmur.config.set('mountedDataDir', '/foo/bar')

  beforeEach(() => {
    wrapper = shallowMount(MountedDataLocation, { i18n, localVue, store })
  })

  afterAll(() => jest.unmock('axios'))

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

    expect(mockCallback).toBeCalledTimes(1)
  })

  it('should reset batchSearches when calling the deleteAll method', async () => {
    store.commit('batchSearch/batchSearches', ['batchSearch_01', 'batchSearch_02', 'batchSearch_03'])

    await wrapper.vm.deleteAll()

    expect(store.state.batchSearch.batchSearches).toEqual([])
  })
})
