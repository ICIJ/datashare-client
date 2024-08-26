import { mount, flushPromises, shallowMount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import ApiPage from '@/components/Api'
import { getMode, MODE_NAME } from '@/mode'
import CoreSetup from '~tests/unit/CoreSetup'
import { render } from 'jsdoc-to-markdown'

describe('Api.vue', () => {
  let plugins, api

  beforeEach(() => {
    api = {
      createApiKey: vi.fn(),
      getApiKey: vi.fn().mockResolvedValue({ hashedKey: null }),
      deleteApiKey: vi.fn()
    }

    const core = CoreSetup.init(api, getMode(MODE_NAME.SERVER)).useAll()
    plugins = core.plugins

    setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)
    core.config.merge({ mode: MODE_NAME.SERVER })
  })

  afterEach(async () => {
    removeCookie(process.env.VITE_DS_COOKIE_NAME)
    await flushPromises()
    vi.clearAllMocks()
  })

  it('should display a button to generate the API key by default', () => {
    const wrapper = shallowMount(ApiPage, { global: { plugins } })
    expect(wrapper.find('.api .api__create-key b-button-stub').exists()).toBeTruthy()
  })

  it('should display no rows by default', () => {
    const wrapper = shallowMount(ApiPage, { global: { plugins } })
    expect(wrapper.findAll('.api__key')).toHaveLength(0)
  })

  it('should request the creation of the API key', async () => {
    const wrapper = shallowMount(ApiPage, { global: { plugins } })
    api.getApiKey.mockResolvedValue({ apiKey: '123456abcdef', hashedKey: 'test' })
    api.createApiKey.mockResolvedValue({ apiKey: '123456abcdef', hashedKey: 'test' })
    await wrapper.find('.api .api__create-key b-button-stub').trigger('click')
    await flushPromises()

    expect(api.getApiKey).toBeCalledTimes(2)
    expect(api.getApiKey).toBeCalledWith('doe')
    expect(api.createApiKey).toBeCalledTimes(1)
    expect(api.createApiKey).toBeCalledWith('doe')
  })

  it('should delete the apiKey', async () => {
    api.createApiKey.mockResolvedValue({ apiKey: '123456abcdef', hashedKey: 'test' })
    api.getApiKey.mockResolvedValue({ apiKey: '123456abcdef', hashedKey: 'test' })
    api.deleteApiKey.mockResolvedValue({})
    const wrapper = shallowMount(ApiPage, { global: { plugins } })
    expect(wrapper.findAll('.api__key')).toHaveLength(0)

    await wrapper.vm.createApiKey()
    expect(wrapper.findAll('.api__key')).toHaveLength(1)

    await wrapper.vm.deleteApiKey()
    expect(wrapper.findAll('.api__key')).toHaveLength(0)

    expect(api.deleteApiKey).toBeCalledTimes(1)
    expect(api.deleteApiKey).toBeCalledWith('doe')
  })
})
