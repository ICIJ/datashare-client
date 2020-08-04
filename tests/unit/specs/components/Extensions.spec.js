import { createLocalVue, shallowMount } from '@vue/test-utils'
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
        description: 'extension_01_description'
      }, {
        id: 'extension_02_id',
        name: 'extension_02_name',
        version: 'extension_02_version',
        description: 'extension_02_description'
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
    expect(wrapper.findAll('.extensions .extensions__card')).toHaveLength(2)
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
