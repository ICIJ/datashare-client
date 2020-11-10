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
          name: 'plugin_01_registry_name',
          version: 'plugin_01_version',
          description: 'plugin_01_registry_description',
          url: 'plugin_01_registry_url'
        }
      }, {
        id: 'plugin_02_id',
        name: 'plugin_02_name',
        version: 'plugin_02_version',
        description: 'plugin_02_description',
        url: 'plugin_02_url',
        installed: true,
        deliverableFromRegistry: {
          id: 'plugin_02_id',
          name: 'plugin_02_registry_name',
          version: 'plugin_02_version',
          description: 'plugin_02_registry_description',
          url: 'plugin_02_registry_url'
        }
      }, {
        id: 'plugin_03_id',
        name: 'plugin_03_name',
        version: null,
        description: 'plugin_03_description',
        url: 'plugin_03_url',
        installed: true,
        deliverableFromRegistry: null
      }, {
        id: 'plugin_04_id',
        name: 'plugin_04_name',
        version: 'plugin_04_version',
        description: null,
        url: null,
        installed: true,
        deliverableFromRegistry: {
          id: 'plugin_04_id',
          name: 'plugin_04_registry_name',
          version: 'plugin_04_registry_version',
          description: 'plugin_04_registry_description',
          url: null
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

  describe('plugin card', () => {
    beforeEach(async () => {
      wrapper = await mount(Plugins, { i18n, localVue, data: () => { return { url: 'this.is.an.url' } } })
    })

    describe('plugin name', () => {
      it('should display name from registry if plugin is NOT installed and from registry', () => {
        expect(wrapper.find('.plugins__card:nth-child(1) .plugins__card__name').text()).toBe('plugin_01_registry_name')
      })

      it('should display name from registry if plugin is installed and from registry', () => {
        expect(wrapper.find('.plugins__card:nth-child(2) .plugins__card__name').text()).toBe('plugin_02_registry_name')
      })

      it('should display plugin name if plugin is installed and NOT from registry', () => {
        expect(wrapper.find('.plugins__card:nth-child(3) .plugins__card__name').text()).toBe('plugin_03_name')
      })
    })

    describe('plugin description', () => {
      it('should display description from registry if plugin is NOT installed and from registry', () => {
        expect(wrapper.find('.plugins__card:nth-child(1) .plugins__card__description').text()).toBe('plugin_01_registry_description')
      })

      it('should display description from registry if plugin is installed and from registry', () => {
        expect(wrapper.find('.plugins__card:nth-child(2) .plugins__card__description').text()).toBe('plugin_02_registry_description')
      })

      it('should display plugin description if plugin is installed and NOT from registry', () => {
        expect(wrapper.find('.plugins__card:nth-child(3) .plugins__card__description').text()).toBe('plugin_03_description')
      })
    })

    describe('plugin version', () => {
      it('should NOT display the installed version if plugin is NOT installed', () => {
        expect(wrapper.findAll('.plugins__card:nth-child(1) .plugins__card__version').exists()).toBeFalsy()
      })

      it('should display the installed version if plugin is installed and has an installed version', () => {
        expect(wrapper.findAll('.plugins__card:nth-child(2) .plugins__card__version').exists()).toBeTruthy()
      })

      it('should NOT display the installed version if plugin is installed and has NO installed version', () => {
        expect(wrapper.findAll('.plugins__card:nth-child(3) .plugins__card__version').exists()).toBeFalsy()
      })
    })

    describe('plugin official version', () => {
      it('should display the official version if plugin is from registry and has an official version', () => {
        expect(wrapper.find('.plugins__card:nth-child(1) .plugins__card__official-version').exists()).toBeTruthy()
      })

      it('should NOT display the official version if plugin is installed and NOT from registry', () => {
        expect(wrapper.findAll('.plugins__card:nth-child(3) .plugins__card__official-version').exists()).toBeFalsy()
      })
    })

    describe('plugin url', () => {
      it('should display url from registry if plugin is NOT installed and from registry', () => {
        expect(wrapper.find('.plugins__card:nth-child(1) .plugins__card__url').text()).toBe('plugin_01_registry_url')
      })

      it('should display url from registry if plugin is installed and from registry', () => {
        expect(wrapper.find('.plugins__card:nth-child(2) .plugins__card__url').text()).toBe('plugin_02_registry_url')
      })

      it('should display plugin url if plugin is installed and NOT from registry', () => {
        expect(wrapper.find('.plugins__card:nth-child(3) .plugins__card__url').text()).toBe('plugin_03_url')
      })

      it('should NOT display url if there is none', () => {
        expect(wrapper.find('.plugins__card:nth-child(4) .plugins__card__url').exists()).toBeFalsy()
      })
    })

    describe('uninstall button', () => {
      it('should display uninstall button if plugin is installed', () => {
        expect(wrapper.findAll('.plugins__card:nth-child(2) .plugins__card__uninstall-button').exists()).toBeTruthy()
      })

      it('should NOT display uninstall button if plugin is NOT installed', () => {
        expect(wrapper.findAll('.plugins__card:nth-child(1) .plugins__card__uninstall-button').exists()).toBeFalsy()
      })
    })

    describe('download button', () => {
      it('should display download button if plugin is NOT installed', () => {
        expect(wrapper.findAll('.plugins__card:nth-child(1) .plugins__card__download-button').exists()).toBeTruthy()
      })

      it('should NOT display download button if plugin is installed', () => {
        expect(wrapper.findAll('.plugins__card:nth-child(2) .plugins__card__download-button').exists()).toBeFalsy()
      })
    })

    describe('update button', () => {
      it('should NOT display update button if plugin if installed version and same as registry', () => {
        expect(wrapper.findAll('.plugins__card:nth-child(2) .plugins__card__update-button').exists()).toBeFalsy()
      })

      it('should NOT display update button if plugin is installed and NOT from registry', () => {
        expect(wrapper.findAll('.plugins__card:nth-child(3) .plugins__card__update-button').exists()).toBeFalsy()
      })

      it('should display update button if plugin is installed and different version from registry', () => {
        expect(wrapper.findAll('.plugins__card:nth-child(4) .plugins__card__update-button').exists()).toBeTruthy()
      })
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
