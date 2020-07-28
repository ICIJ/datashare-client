import { createLocalVue, shallowMount } from '@vue/test-utils'
import axios from 'axios'

import Api from '@/api'
import { Core } from '@/core'
import Plugins from '@/pages/Plugins'

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({
      data: [{
        id: 'plugin_01_id',
        name: 'plugin_01_name',
        version: 'plugin_01_version',
        description: 'plugin_01_description'
      }, {
        id: 'plugin_02_id',
        name: 'plugin_02_name',
        version: 'plugin_02_version',
        description: 'plugin_02_description'
      }]
    })
  }
})

describe('Plugins.vue', () => {
  const { i18n, localVue, router, store } = Core.init(createLocalVue()).useAll()
  let wrapper = null

  beforeEach(async () => {
    wrapper = await shallowMount(Plugins, { i18n, localVue, router, store })
  })

  afterAll(() => jest.unmock('axios'))

  it('should display a search bar', () => {
    expect(wrapper.find('.plugins__search')).toBeTruthy()
    expect(wrapper.find('.plugins__search b-form-input-stub')).toBeTruthy()
  })

  it('should display a list of plugins', () => {
    expect(wrapper.findAll('.plugins__card')).toHaveLength(2)
  })

  it('should search for matching plugins', async () => {
    axios.request.mockClear()
    axios.request.mockResolvedValue({
      data: [{
        id: 'plugin_02_id',
        name: 'plugin_02_name',
        version: 'plugin_02_version',
        description: 'plugin_02_description'
      }]
    })
    await wrapper.setData({ searchTerm: '02_desc' })

    await wrapper.vm.search()

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith({ url: Api.getFullUrl('/api/plugins?filter=.*02_desc.*') })
    expect(wrapper.vm.plugins).toHaveLength(1)
    expect(wrapper.vm.plugins[0]).toMatchObject({
      id: 'plugin_02_id',
      name: 'plugin_02_name',
      version: 'plugin_02_version',
      description: 'plugin_02_description'
    })
  })

  it('should call for plugin installation', () => {
    axios.request.mockClear()
    wrapper.vm.install('plugin_01_id')

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith({
      method: 'PUT',
      url: Api.getFullUrl('/api/plugins/install/plugin_01_id')
    })
  })
})
