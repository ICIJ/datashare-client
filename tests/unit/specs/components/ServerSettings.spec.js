import axios from 'axios'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import Api from '@/api'
import ServerSettings from '@/components/ServerSettings'
import { Core } from '@/core'

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({ data: {} })
  }
})

const { i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()

describe('ServerSettings.vue', () => {
  let wrapper = null

  beforeEach(async () => {
    axios.request.mockClear()
    wrapper = await shallowMount(ServerSettings, { i18n, localVue, store, wait })
  })

  afterAll(() => jest.unmock('axios'))

  it('should load the settings page', () => {
    expect(wrapper.find('page-header-stub').exists()).toBeTruthy()
  })

  it('should display a text input', async () => {
    wrapper = await shallowMount(ServerSettings, { i18n, localVue, store, wait, stubs: { 'b-form': false } })
    await wrapper.vm.$set(wrapper.vm, 'settings', { property_01: 'value_01', property_02: 'value_02' })

    expect(wrapper.findAll('b-form-input-stub')).toHaveLength(2)
  })

  it('should load the settings on component creation', () => {
    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/settings')
    }))
  })

  it('should submit the settings modifications', () => {
    wrapper.vm.onSubmit()

    expect(axios.request).toBeCalledTimes(2)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/settings'),
      method: 'PATCH',
      data: { data: {} },
      headers: { 'Content-Type': 'application/json' }
    }))
  })

  it('should restore master settings if submit fails', async () => {
    axios.request.mockRejectedValue({ response: { status: 404 } })
    wrapper.setData({
      master: { property_01: 'value_01', property_02: 'value_02' },
      settings: { property_01: 'another_value', property_02: 'value_02' }
    })

    await wrapper.vm.onSubmit()

    expect(wrapper.vm.settings.property_01).toBe('value_01')
    axios.request.mockResolvedValue({ data: {} })
  })

  it('should display an alert', async () => {
    Murmur.config.merge({ multipleProjects: true })
    wrapper = await shallowMount(ServerSettings, { i18n, localVue, store, wait })

    expect(wrapper.find('b-alert-stub').exists()).toBeTruthy()
  })
})
