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
        installed: false,
        installedVersion: null,
        description: 'plugin_01_description'
      }, {
        id: 'plugin_02_id',
        name: 'plugin_02_name',
        version: 'plugin_02_version',
        installed: true,
        installedVersion: 'plugin_02_version-2',
        description: 'plugin_02_description'
      }, {
        id: 'plugin_03_id',
        name: 'plugin_03_name',
        version: null,
        installed: true,
        installedVersion: null,
        description: 'plugin_03_description'
      }, {
        id: 'plugin_04_id',
        name: 'plugin_04_name',
        version: 'plugin_04_version',
        installed: true,
        installedVersion: 'plugin_04_version',
        description: 'plugin_04_description'
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
    expect(wrapper.findAll('.plugins .plugins__card')).toHaveLength(4)
  })

  it('should NOT display the version installed if there is none', () => {
    expect(wrapper.findAll('.plugins__card:nth-child(1) .plugins__card__installed-version')).toHaveLength(0)
  })

  it('should display the version installed when there is one', () => {
    expect(wrapper.findAll('.plugins__card:nth-child(2) .plugins__card__installed-version')).toHaveLength(1)
  })

  it('should display download button if no installed version', async () => {
    wrapper = await mount(Plugins, { i18n, localVue, data: () => { return { url: 'this.is.an.url' } } })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.plugins__card:nth-child(1) .plugins__card__download-button')).toHaveLength(1)
  })

  it('should display download button if installed version is different from the catalog one', async () => {
    wrapper = await mount(Plugins, { i18n, localVue, data: () => { return { url: 'this.is.an.url' } } })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.plugins__card:nth-child(2) .plugins__card__download-button')).toHaveLength(1)
  })

  it('should NOT display download but if installed and not in catalog', async () => {
    wrapper = await mount(Plugins, { i18n, localVue, data: () => { return { url: 'this.is.an.url' } } })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.plugins__card:nth-child(3) .plugins__card__download-button')).toHaveLength(0)
  })

  it('should NOT display download but if installed version is same from the catalog one', async () => {
    wrapper = await mount(Plugins, { i18n, localVue, data: () => { return { url: 'this.is.an.url' } } })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.plugins__card:nth-child(4) .plugins__card__download-button')).toHaveLength(0)
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
