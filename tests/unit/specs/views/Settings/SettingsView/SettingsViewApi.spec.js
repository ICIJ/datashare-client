import { flushPromises, mount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import CoreSetup from '~tests/unit/CoreSetup'
import SettingsViewApi from '@/views/Settings/SettingsView/SettingsViewApi'
import { MODE_NAME } from '@/mode'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      createApiKey: vi.fn(),
      getApiKey: vi.fn(),
      removeApiKey: vi.fn()
    }
  }
})

describe('SettingsViewApi', () => {
  let plugins

  beforeEach(async () => {
    api.getApiKey.mockResolvedValue({ hashedKey: null })
    const core = CoreSetup.init().useAll()
    plugins = core.plugins

    setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)
    core.config.merge({ mode: MODE_NAME.SERVER })
  })

  afterEach(async () => {
    removeCookie(process.env.VITE_DS_COOKIE_NAME)
    await flushPromises()
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should display a panel to generate the API key by default', () => {
    const wrapper = mount(SettingsViewApi, { global: { plugins } })
    expect(wrapper.find('.settings-view-api__create').exists()).toBeTruthy()
  })

  it('should display no keys by default', () => {
    const wrapper = mount(SettingsViewApi, { global: { plugins } })
    expect(wrapper.findAll('.settings-view-api__key')).toHaveLength(0)
  })

  it('should request the creation of the API key', async () => {
    api.getApiKey.mockResolvedValue({ apiKey: '123456abcdef', hashedKey: 'test' })
    api.createApiKey.mockResolvedValue({ apiKey: '123456abcdef', hashedKey: 'test' })
    const wrapper = mount(SettingsViewApi, { global: { plugins } })
    await wrapper.find('.settings-view-api__create__button').trigger('click')
    await flushPromises()

    expect(api.getApiKey).toBeCalledTimes(2)
    expect(api.createApiKey).toBeCalledTimes(1)
  })

  it('should delete the apiKey', async () => {
    api.createApiKey.mockResolvedValue({ apiKey: '123456abcdef', hashedKey: 'test' })
    api.getApiKey.mockResolvedValue({ apiKey: '123456abcdef', hashedKey: 'test' })
    api.removeApiKey.mockResolvedValue({})
    const wrapper = mount(SettingsViewApi, { global: { plugins } })
    expect(wrapper.findAll('.settings-view-api__show')).toHaveLength(0)

    await wrapper.vm.createApiKey()
    expect(wrapper.findAll('.settings-view-api__show')).toHaveLength(1)

    await wrapper.vm.removeApiKey()
    expect(wrapper.findAll('.settings-view-api__show')).toHaveLength(0)

    expect(api.removeApiKey).toBeCalledTimes(1)
  })
})
