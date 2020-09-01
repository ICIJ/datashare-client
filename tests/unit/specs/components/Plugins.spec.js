import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import axios from 'axios'

import Api from '@/api'
import Plugins from '@/components/Plugins'
import { Core } from '@/core'

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
  const { i18n, localVue } = Core.init(createLocalVue()).useAll()
  let wrapper = null

  beforeEach(async () => {
    wrapper = await shallowMount(Plugins, { i18n, localVue, data: () => { return { url: 'this.is.an.url' } } })
  })

  afterAll(() => jest.unmock('axios'))

  it('should display a button to install a plugin from url', () => {
    expect(wrapper.find('.plugins .plugins__add b-btn-stub').exists()).toBeTruthy()
  })

  it('should display a modal to install a plugin from url', () => {
    expect(wrapper.find('.plugins .plugins__add b-modal-stub').exists()).toBeTruthy()
  })

  it('should display a search bar', () => {
    expect(wrapper.find('.plugins .plugins__search').exists()).toBeTruthy()
    expect(wrapper.find('.plugins .plugins__search search-form-control-stub').exists()).toBeTruthy()
  })

  it('should display a list of plugins', () => {
    expect(wrapper.findAll('.plugins .plugins__card')).toHaveLength(2)
  })

  it('should search for matching plugins', async () => {
    axios.request.mockClear()
    await wrapper.setData({ searchTerm: '02_desc' })

    await wrapper.vm.search()

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith({ url: Api.getFullUrl('/api/plugins?filter=.*02_desc.*') })
  })

  it('should call for plugin installation from pluginId', () => {
    axios.request.mockClear()
    wrapper.vm.installPluginFromId('plugin_01_id')

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith({
      method: 'PUT',
      url: Api.getFullUrl('/api/plugins/install?id=plugin_01_id')
    })
    expect(wrapper.vm.plugins[0].show).toBeTruthy()
  })

  it('should call for plugin installation from pluginUrl', () => {
    wrapper = mount(Plugins, { i18n, localVue, data: () => { return { url: 'this.is.an.url' } } })
    axios.request.mockClear()

    wrapper.vm.installPluginFromUrl()

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith({
      method: 'PUT',
      url: Api.getFullUrl('/api/plugins/install?url=this.is.an.url')
    })
    expect(wrapper.vm.show).toBeTruthy()
  })

  it('should call for plugin uninstallation', () => {
    axios.request.mockClear()
    wrapper.vm.uninstallPlugin('plugin_01_id')

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith({
      method: 'DELETE',
      url: Api.getFullUrl('/api/plugins/uninstall?id=plugin_01_id')
    })
    expect(wrapper.vm.plugins[0].show).toBeTruthy()
  })
})
