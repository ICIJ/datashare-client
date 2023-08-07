import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import { MODE_NAME } from '@/mode'
import ServerSettings from '@/components/ServerSettings'

describe('ServerSettings.vue', () => {
  let wrapper, i18n, localVue, store, wait, api
  beforeAll(() => {
    api = {
      getSettings: jest.fn(),
      setSettings: jest.fn()
    }
    const core = Core.init(createLocalVue(), api).useAll()
    i18n = core.i18n
    localVue = core.localVue
    store = core.store
    wait = core.wait
  })
  beforeEach(async () => {
    jest.clearAllMocks()
    wrapper = await shallowMount(ServerSettings, { i18n, localVue, store, wait })
  })

  it('should load the server settings page', () => {
    expect(wrapper.find('.container').exists()).toBeTruthy()
  })

  it('should display a text input', async () => {
    await wrapper.setData({ settings: { property_01: 'value_01', property_02: 'value_02' } })
    expect(wrapper.findAll('b-form-input-stub')).toHaveLength(2)
  })

  it('should load the settings on component creation', () => {
    expect(api.getSettings).toBeCalledTimes(1)
  })

  it('should submit the settings modifications', () => {
    const data = {
      settings: { property_01: 'another_value' }
    }
    wrapper.setData(data)
    wrapper.vm.onSubmit()

    expect(api.setSettings).toBeCalledTimes(1)
    expect(api.setSettings).toBeCalledWith(data.settings)
  })

  it('should restore master settings if submit fails', async () => {
    api.setSettings.mockRejectedValue({ response: { status: 404 } })
    wrapper.setData({
      master: { property_01: 'value_01', property_02: 'value_02' },
      settings: { property_01: 'another_value', property_02: 'value_02' }
    })

    await wrapper.vm.onSubmit()

    expect(wrapper.vm.settings.property_01).toBe('value_01')
  })

  it('should display an alert', () => {
    Murmur.config.merge({ mode: MODE_NAME.SERVER })
    wrapper = shallowMount(ServerSettings, { i18n, localVue, store, wait })

    expect(wrapper.find('b-alert-stub').exists()).toBeTruthy()
  })
})
