import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import axios from 'axios'

import Api from '@/api'
import Extensions from '@/components/Extensions'
import { Core } from '@/core'

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({
      data: [{
        id: 'extension_01_id',
        name: 'extension_01_name',
        version: 'extension_01_version',
        description: 'extension_01_description',
        url: 'extension_01_url',
        installed: false,
        deliverableFromRegistry: {
          id: 'extension_01_id',
          name: 'extension_01_registry_name',
          version: 'extension_01_version',
          description: 'extension_01_registry_description',
          url: 'extension_01_registry_url'
        }
      }, {
        id: 'extension_02_id',
        name: 'extension_02_name',
        version: 'extension_02_version',
        description: 'extension_02_description',
        url: 'extension_02_url',
        installed: true,
        deliverableFromRegistry: {
          id: 'extension_02_id',
          name: 'extension_02_registry_name',
          version: 'extension_02_version',
          description: 'extension_02_registry_description',
          url: 'extension_02_registry_url'
        }
      }, {
        id: 'extension_03_id',
        name: 'extension_03_name',
        version: null,
        description: 'extension_03_description',
        url: 'extension_03_url',
        installed: true,
        deliverableFromRegistry: null
      }, {
        id: 'extension_04_id',
        name: 'extension_04_name',
        version: 'extension_04_version',
        description: null,
        url: 'extension_04_url',
        installed: true,
        deliverableFromRegistry: {
          id: 'extension_04_id',
          name: 'extension_04_registry_name',
          version: 'extension_04_registry_version',
          description: 'extension_04_registry_description',
          url: null
        }
      }]
    })
  }
})

describe('Extensions.vue', () => {
  const { i18n, localVue } = Core.init(createLocalVue()).useAll()
  let wrapper = null

  beforeEach(async () => {
    wrapper = await shallowMount(Extensions, { i18n, localVue })
  })

  afterAll(() => jest.unmock('axios'))

  it('should display a list of extensions', async () => {
    expect(wrapper.findAll('.extensions .extensions__card')).toHaveLength(4)
  })

  describe('extension card', () => {
    beforeEach(async () => {
      wrapper = await mount(Extensions, { i18n, localVue, data: () => { return { url: 'this.is.an.url' } } })
    })

    describe('extension name', () => {
      it('should display name from registry if extension is NOT installed and from registry', () => {
        expect(wrapper.find('.extensions__card:nth-child(1) .extensions__card__name').text()).toBe('Extension 01 Registry Name')
      })

      it('should display name from registry if extension is installed and from registry', () => {
        expect(wrapper.find('.extensions__card:nth-child(2) .extensions__card__name').text()).toBe('Extension 02 Registry Name')
      })

      it('should display extension name if extension is installed and NOT from registry', () => {
        expect(wrapper.find('.extensions__card:nth-child(3) .extensions__card__name').text()).toBe('Extension 03 Name')
      })
    })

    describe('extension description', () => {
      it('should display description from registry if extension is NOT installed and from registry', () => {
        expect(wrapper.find('.extensions__card:nth-child(1) .extensions__card__description').text()).toBe('extension_01_registry_description')
      })

      it('should display description from registry if extension is installed and from registry', () => {
        expect(wrapper.find('.extensions__card:nth-child(2) .extensions__card__description').text()).toBe('extension_02_registry_description')
      })

      it('should display plugin description if plugin is installed and NOT from registry', () => {
        expect(wrapper.find('.extensions__card:nth-child(3) .extensions__card__description').text()).toBe('extension_03_description')
      })
    })

    describe('extension version', () => {
      it('should NOT display the version if extension is NOT installed', () => {
        expect(wrapper.findAll('.extensions__card:nth-child(1) .extensions__card__version').exists()).toBeFalsy()
      })

      it('should display the installed version if extension is installed and has an installed version', () => {
        expect(wrapper.findAll('.extensions__card:nth-child(2) .extensions__card__version').exists()).toBeTruthy()
      })

      it('should NOT display the installed version if extension is installed and has NO installed version', () => {
        expect(wrapper.findAll('.extensions__card:nth-child(3) .extensions__card__version').exists()).toBeFalsy()
      })
    })

    describe('extension official version', () => {
      it('should display the official version if extension is from registry and has an official version', () => {
        expect(wrapper.findAll('.extensions__card:nth-child(1) .extensions__card__official-version').exists()).toBeTruthy()
      })

      it('should NOT display the official version if extension is installed and NOT from registry', () => {
        expect(wrapper.findAll('.extensions__card:nth-child(3) .extensions__card__official-version').exists()).toBeFalsy()
      })
    })

    describe('extension url', () => {
      it('should display url from registry if extension is NOT installed and from registry', () => {
        expect(wrapper.find('.extensions__card:nth-child(1) .extensions__card__url').text()).toBe('extension_01_registry_url')
      })

      it('should display url from registry if extension is installed and from registry', () => {
        expect(wrapper.find('.extensions__card:nth-child(2) .extensions__card__url').text()).toBe('extension_02_registry_url')
      })

      it('should display extension url if extension is installed and NOT from registry', () => {
        expect(wrapper.find('.extensions__card:nth-child(3) .extensions__card__url').text()).toBe('extension_03_url')
      })

      it('should NOT display url if there is none', () => {
        expect(wrapper.find('.extensions__card:nth-child(4) .extensions__card__url').exists()).toBeFalsy()
      })
    })

    describe('uninstall button', () => {
      it('should display uninstall button if extension is installed', () => {
        expect(wrapper.findAll('.extensions__card:nth-child(2) .extensions__card__uninstall-button').exists()).toBeTruthy()
      })

      it('should NOT display uninstall button if extension is NOT installed', () => {
        expect(wrapper.findAll('.extensions__card:nth-child(1) .extensions__card__uninstall-button').exists()).toBeFalsy()
      })
    })

    describe('download button', () => {
      it('should display download button if extension is NOT installed', () => {
        expect(wrapper.findAll('.extensions__card:nth-child(1) .extensions__card__download-button').exists()).toBeTruthy()
      })

      it('should NOT display download button if extension is installed', () => {
        expect(wrapper.findAll('.extensions__card:nth-child(2) .extensions__card__download-button').exists()).toBeFalsy()
      })
    })

    describe('update button', () => {
      it('should NOT display update button if extension if installed version and same as registry', () => {
        expect(wrapper.findAll('.extensions__card:nth-child(2) .extensions__card__update-button').exists()).toBeFalsy()
      })

      it('should NOT display update button if extension is installed and NOT from registry', () => {
        expect(wrapper.findAll('.extensions__card:nth-child(3) .extensions__card__update-button').exists()).toBeFalsy()
      })

      it('should display update button if extension is installed and different version from registry', () => {
        expect(wrapper.findAll('.extensions__card:nth-child(4) .extensions__card__update-button').exists()).toBeTruthy()
      })
    })
  })

  it('should search for matching extensions', async () => {
    axios.request.mockClear()
    await wrapper.setData({ searchTerm: '02_desc' })

    await wrapper.vm.search()

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith({ url: Api.getFullUrl('/api/extensions?filter=.*02_desc.*') })
  })

  it('should call for extension installation from extensionId', () => {
    axios.request.mockClear()
    wrapper.vm.installExtensionFromId('extension_01_id')

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith({
      method: 'PUT',
      url: Api.getFullUrl('/api/extensions/install?id=extension_01_id')
    })
    expect(wrapper.vm.extensions[0].show).toBeTruthy()
  })

  it('should call for extension installation from extensionUrl', () => {
    wrapper = mount(Extensions, { i18n, localVue, data: () => { return { url: 'this.is.an.url' } } })
    axios.request.mockClear()

    wrapper.vm.installExtensionFromUrl()

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith({
      method: 'PUT',
      url: Api.getFullUrl('/api/extensions/install?url=this.is.an.url')
    })
    expect(wrapper.vm.show).toBeTruthy()
  })

  it('should call for extension uninstallation', () => {
    axios.request.mockClear()
    wrapper.vm.uninstallExtension('extension_01_id')

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith({
      method: 'DELETE',
      url: Api.getFullUrl('/api/extensions/uninstall?id=extension_01_id')
    })
    expect(wrapper.vm.extensions[0].show).toBeTruthy()
  })
})
