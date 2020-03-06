import axios from 'axios'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import Api from '@/api'
import { Core } from '@/core'
import Config from '@/pages/Config'

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({ data: {} })
  }
})

const { localVue, store } = Core.init(createLocalVue()).useAll()

describe('Config.vue', () => {
  let wrapper

  beforeEach(() => {
    axios.request.mockClear()
    wrapper = shallowMount(Config, { localVue, store, mocks: { $t: msg => msg } })
  })

  it('should load the config page', () => {
    expect(wrapper.find('h3').text()).toBe('config.title')
  })

  it('should display a text input', async () => {
    wrapper = shallowMount(Config, { localVue, store, mocks: { $t: msg => msg }, stubs: { 'b-form': false } })
    wrapper.vm.$set(wrapper.vm, 'config', { property_01: 'value_01', property_02: 'value_02' })
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('b-form-input-stub')).toHaveLength(2)
  })

  it('should load the config on component creation', () => {
    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/config')
    }))
  })

  it('should submit the config modifications', () => {
    wrapper.vm.onSubmit()

    expect(axios.request).toBeCalledTimes(2)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/config'),
      method: 'PATCH',
      data: { data: {} },
      headers: { 'Content-Type': 'application/json' }
    }))
  })
})
