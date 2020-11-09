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
        description: 'plugin_01_description',
        url: 'plugin_01_url',
        installed: false,
        deliverableFromRegistry: {
          id: 'plugin_01_id',
          name: 'plugin_01_name',
          version: 'plugin_01_version',
          description: 'plugin_01_description',
          url: 'plugin_01_url'
        }
      }, {
        id: 'plugin_02_id',
        name: 'plugin_02_id',
        version: 'plugin_02_version-1',
        description: null,
        url: 'plugin_02_url_local',
        installed: true,
        deliverableFromRegistry: {
          id: 'plugin_02_id',
          name: 'plugin_02_name',
          version: 'plugin_02_version-2',
          description: 'plugin_02_description',
          url: 'plugin_02_url'
        }
      }, {
        id: 'plugin_03_id',
        name: 'plugin_03_id',
        version: null,
        description: null,
        url: 'plugin_03_url_local',
        installed: true,
        deliverableFromRegistry: null
      }, {
        id: 'plugin_04_id',
        name: 'plugin_04_id',
        version: 'plugin_04_version',
        description: null,
        url: 'plugin_04_url_local',
        installed: true,
        deliverableFromRegistry: {
          id: 'plugin_04_id',
          name: 'plugin_04_name',
          version: 'plugin_04_version',
          description: 'plugin_04_description',
          url: 'plugin_04_url'
        }
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

  describe('labels', () => {
    beforeEach(async () => {
      wrapper = await mount(Plugins, { i18n, localVue, data: () => { return { url: 'this.is.an.url' } } })
    })

    it('should NOT display the version if there is none', () => {
      expect(wrapper.findAll('.plugins__card:nth-child(3) .plugins__card__version')).toHaveLength(0)
    })

    it('should NOT display the version if plugin is not installed', () => {
      expect(wrapper.findAll('.plugins__card:nth-child(1) .plugins__card__version')).toHaveLength(0)
    })

    it('should display the version if there is one and plugin is installed', () => {
      expect(wrapper.findAll('.plugins__card:nth-child(2) .plugins__card__version')).toHaveLength(1)
    })

    it('should NOT display the official version if there is none', () => {
      expect(wrapper.findAll('.plugins__card:nth-child(3) .plugins__card__official-version')).toHaveLength(0)
    })

    it('should display the official version if there is one', () => {
      expect(wrapper.findAll('.plugins__card:nth-child(1) .plugins__card__official-version')).toHaveLength(1)
    })

    it('should display name from catalog if plugin is installed and from catalog', () => {
      expect(wrapper.find('.plugins__card:nth-child(2) .plugins__card__official-name').html()).toContain('plugin_02_name')
    })

    it('should display description from catalog if plugin is installed and from catalog', () => {
      expect(wrapper.find('.plugins__card:nth-child(2) .plugins__card__official-description').html()).toContain('plugin_02_description')
    })

    it('should display url from catalog if plugin is installed and from catalog', () => {
      expect(wrapper.find('.plugins__card:nth-child(2) .plugins__card__official-url').html()).toContain('plugin_02_url')
    })
  })

  describe('buttons', () => {
    beforeEach(async () => {
      wrapper = await mount(Plugins, { i18n, localVue, data: () => { return { url: 'this.is.an.url' } } })
    })

    it('should display uninstall button if plugin is installed', () => {
      expect(wrapper.findAll('.plugins__card:nth-child(2) .plugins__card__uninstall-button').exists()).toBeTruthy()
    })

    it('should NOT display uninstall button if plugin is NOT installed', () => {
      expect(wrapper.findAll('.plugins__card:nth-child(1) .plugins__card__uninstall-button').exists()).toBeFalsy()
    })

    it('should display download button if plugin is NOT installed', () => {
      expect(wrapper.findAll('.plugins__card:nth-child(1) .plugins__card__download-button').exists()).toBeTruthy()
    })

    it('should NOT display download button if plugin is installed', () => {
      expect(wrapper.findAll('.plugins__card:nth-child(2) .plugins__card__download-button').exists()).toBeFalsy()
    })

    it('should display update button if plugin is installed and different version from catalog', () => {
      expect(wrapper.findAll('.plugins__card:nth-child(2) .plugins__card__update-button').exists()).toBeTruthy()
    })

    it('should NOT display update button if plugin is installed and NOT from catalog', () => {
      expect(wrapper.findAll('.plugins__card:nth-child(3) .plugins__card__update-button').exists()).toBeFalsy()
    })

    it('should NOT display update button if plugin if installed version and same as catalog', () => {
      expect(wrapper.findAll('.plugins__card:nth-child(4) .plugins__card__update-button').exists()).toBeFalsy()
    })
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
