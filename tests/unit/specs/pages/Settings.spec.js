import axios from 'axios'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import Api from '@/api'
import { Core } from '@/core'
import Settings from '@/pages/Settings'

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({ data: {} })
  }
})

const { i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()

describe('Settings.vue', () => {
  let wrapper

  beforeEach(() => {
    axios.request.mockClear()
    wrapper = shallowMount(Settings, { i18n, localVue, store, wait })
  })

  it('should load the settings page', () => {
    expect(wrapper.find('h3').text()).toBe('Settings')
  })

  it('should display a text input', async () => {
    wrapper = shallowMount(Settings, { i18n, localVue, store, wait, stubs: { 'b-form': false } })
    await wrapper.vm.$set(wrapper.vm, 'settings', { property_01: 'value_01', property_02: 'value_02' })

    expect(wrapper.findAll('b-form-input-stub')).toHaveLength(2)
  })

  it('should load the settings on component creation', () => {
    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/config')
    }))
  })

  it('should submit the settings modifications', () => {
    wrapper.vm.onSubmit()

    expect(axios.request).toBeCalledTimes(2)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/config'),
      method: 'PATCH',
      data: { data: {} },
      headers: { 'Content-Type': 'application/json' }
    }))
  })

  it('should display an alert', () => {
    Murmur.config.merge({ multipleProjects: true })
    wrapper = shallowMount(Settings, { i18n, localVue, store, wait })

    expect(wrapper.find('b-alert-stub').exists()).toBeTruthy()
  })
})
