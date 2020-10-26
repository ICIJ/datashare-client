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
        installed: false,
        installedVersion: null,
        description: 'extension_01_description'
      }, {
        id: 'extension_02_id',
        name: 'extension_02_name',
        version: 'extension_02_version',
        installed: true,
        installedVersion: 'extension_02_version-2',
        description: 'extension_02_description'
      }, {
        id: 'extension_03_id',
        name: 'extension_03_name',
        version: null,
        installed: true,
        installedVersion: null,
        description: 'extension_03_description'
      }, {
        id: 'extension_04_id',
        name: 'extension_04_name',
        version: 'extension_04_version',
        installed: true,
        installedVersion: 'extension_04_version',
        description: 'extension_04_description'
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

  it('should NOT display the version installed if there is none', () => {
    expect(wrapper.findAll('.extensions__card:nth-child(1) .extensions__card__installed-version')).toHaveLength(0)
  })

  it('should display the version installed if there is one', () => {
    expect(wrapper.findAll('.extensions__card:nth-child(2) .extensions__card__installed-version')).toHaveLength(1)
  })

  describe('download button', () => {
    beforeEach(async () => {
      wrapper = await mount(Extensions, { i18n, localVue, data: () => { return { url: 'this.is.an.url' } } })
    })

    it('should be displayed if no installed version', async () => {
      expect(wrapper.findAll('.extensions__card:nth-child(1) .extensions__card__download-button').exists()).toBeTruthy()
    })

    it('should be displayed if installed version is different from the catalog one', async () => {
      expect(wrapper.findAll('.extensions__card:nth-child(2) .extensions__card__download-button').exists()).toBeTruthy()
    })

    it('should NOT be displayed if installed and not in catalog', async () => {
      expect(wrapper.findAll('.extensions__card:nth-child(3) .extensions__card__download-button').exists()).toBeFalsy()
    })

    it('should NOT be displayed if installed version is same as the catalog one', async () => {
      expect(wrapper.findAll('.extensions__card:nth-child(4) .extensions__card__download-button').exists()).toBeFalsy()
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
