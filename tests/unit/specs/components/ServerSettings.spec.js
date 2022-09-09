import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { Api } from '@/api'
import { Core } from '@/core'
import { MODE_NAME } from '@/mode'
import ServerSettings from '@/components/ServerSettings'

describe('ServerSettings.vue', () => {
  let wrapper, i18n, localVue, store, wait, api, mockAxios
  beforeAll(() => {
    mockAxios = { request: jest.fn() }
    api = new Api(mockAxios, null)

    const core = Core.init(createLocalVue(), api).useAll()
    i18n = core.i18n
    localVue = core.localVue
    store = core.store
    wait = core.wait
  })
  beforeEach(async () => {
    mockAxios.request.mockClear()
    mockAxios.request.mockResolvedValue({ data: {} })
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
    expect(mockAxios.request).toBeCalledTimes(1)
    expect(mockAxios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/settings')
    }))
  })

  it('should submit the settings modifications', () => {
    wrapper.vm.onSubmit()

    expect(mockAxios.request).toBeCalledTimes(2)
    expect(mockAxios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/settings'),
      method: 'PATCH',
      data: { data: {} },
      headers: { 'Content-Type': 'application/json' }
    }))
  })

  it('should restore master settings if submit fails', async () => {
    mockAxios.request.mockRejectedValue({ response: { status: 404 } })
    wrapper.setData({
      master: { property_01: 'value_01', property_02: 'value_02' },
      settings: { property_01: 'another_value', property_02: 'value_02' }
    })

    await wrapper.vm.onSubmit()

    expect(wrapper.vm.settings.property_01).toBe('value_01')
    mockAxios.request.mockResolvedValue({ data: {} })
  })

  it('should display an alert', () => {
    Murmur.config.merge({ mode: MODE_NAME.SERVER })
    wrapper = shallowMount(ServerSettings, { i18n, localVue, store, wait })

    expect(wrapper.find('b-alert-stub').exists()).toBeTruthy()
  })
})
