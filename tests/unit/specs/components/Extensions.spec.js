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
          name: 'extension_01_name',
          version: 'extension_01_version',
          description: 'extension_01_description',
          url: 'extension_01_url'
        }
      }, {
        id: 'extension_02_id',
        name: 'extension_02_id',
        version: 'extension_02_version-1',
        description: null,
        url: 'extension_02_url_local',
        installed: true,
        deliverableFromRegistry: {
          id: 'extension_02_id',
          name: 'extension_02_name',
          version: 'extension_02_version-2',
          description: 'extension_02_description',
          url: 'extension_02_url'
        }
      }, {
        id: 'extension_03_id',
        name: 'extension_03_id',
        version: null,
        description: null,
        url: 'extension_03_url_local',
        installed: true,
        deliverableFromRegistry: null
      }, {
        id: 'extension_04_id',
        name: 'extension_04_id',
        version: 'extension_04_version',
        description: null,
        url: 'extension_04_url_local',
        installed: true,
        deliverableFromRegistry: {
          id: 'extension_04_id',
          name: 'extension_04_name',
          version: 'extension_04_version',
          description: 'extension_04_description',
          url: 'extension_04_url'
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

  describe('labels', () => {
    beforeEach(async () => {
      wrapper = await mount(Extensions, { i18n, localVue, data: () => { return { url: 'this.is.an.url' } } })
    })

    it('should NOT display the version if there is none', () => {
      expect(wrapper.findAll('.extensions__card:nth-child(3) .extensions__card__version')).toHaveLength(0)
    })

    it('should NOT display the version if extension is not installed', () => {
      expect(wrapper.findAll('.extensions__card:nth-child(1) .extensions__card__version')).toHaveLength(0)
    })

    it('should display the version if there is one and extension is installed', () => {
      expect(wrapper.findAll('.extensions__card:nth-child(2) .extensions__card__version')).toHaveLength(1)
    })

    it('should NOT display the official version if there is none', () => {
      expect(wrapper.findAll('.extensions__card:nth-child(3) .extensions__card__official-version')).toHaveLength(0)
    })

    it('should display the official version if there is one', () => {
      expect(wrapper.findAll('.extensions__card:nth-child(1) .extensions__card__official-version')).toHaveLength(1)
    })

    it('should display name from catalog if extension is installed and from catalog', () => {
      expect(wrapper.find('.extensions__card:nth-child(2) .extensions__card__official-name').html()).toContain('extension_02_name')
    })

    it('should display description from catalog if extension is installed and from catalog', () => {
      expect(wrapper.find('.extensions__card:nth-child(2) .extensions__card__official-description').html()).toContain('extension_02_description')
    })

    it('should display url from catalog if extension is installed and from catalog', () => {
      expect(wrapper.find('.extensions__card:nth-child(2) .extensions__card__official-url').html()).toContain('extension_02_url')
    })
  })

  describe('buttons', () => {
    beforeEach(async () => {
      wrapper = await mount(Extensions, { i18n, localVue, data: () => { return { url: 'this.is.an.url' } } })
    })

    it('should display uninstall button if extension is installed', () => {
      expect(wrapper.findAll('.extensions__card:nth-child(2) .extensions__card__uninstall-button').exists()).toBeTruthy()
    })

    it('should NOT display uninstall button if extension is NOT installed', () => {
      expect(wrapper.findAll('.extensions__card:nth-child(1) .extensions__card__uninstall-button').exists()).toBeFalsy()
    })

    it('should display download button if extension is NOT installed', () => {
      expect(wrapper.findAll('.extensions__card:nth-child(1) .extensions__card__download-button').exists()).toBeTruthy()
    })

    it('should NOT display download button if extension is installed', () => {
      expect(wrapper.findAll('.extensions__card:nth-child(2) .extensions__card__download-button').exists()).toBeFalsy()
    })

    it('should display update button if extension is installed and different version from catalog', () => {
      expect(wrapper.findAll('.extensions__card:nth-child(2) .extensions__card__update-button').exists()).toBeTruthy()
    })

    it('should NOT display update button if extension is installed and NOT from catalog', () => {
      expect(wrapper.findAll('.extensions__card:nth-child(3) .extensions__card__update-button').exists()).toBeFalsy()
    })

    it('should NOT display update button if extension if installed version and same as catalog', () => {
      expect(wrapper.findAll('.extensions__card:nth-child(4) .extensions__card__update-button').exists()).toBeFalsy()
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
