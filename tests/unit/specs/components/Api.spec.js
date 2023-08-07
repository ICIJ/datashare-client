import Murmur from '@icij/murmur'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'
import { flushPromises } from 'tests/unit/tests_utils'

import ApiPage from '@/components/Api'
import { Core } from '@/core'
import { storeBuilder } from '@/store/storeBuilder'
import { getMode, MODE_NAME } from '@/mode'

describe('Api.vue', () => {
  let i18n, localVue, router, wrapper, store, api

  beforeAll(() => {
    api = {
      createApiKey: jest.fn(),
      getApiKey: jest.fn(),
      deleteApiKey: jest.fn()
    }
    const core = Core.init(createLocalVue(), api, getMode(MODE_NAME.SERVER)).useAll()
    i18n = core.i18n
    localVue = core.localVue
    router = core.router
    store = storeBuilder(api)
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)
  })

  beforeEach(() => {
    Murmur.config.merge({ mode: MODE_NAME.SERVER })
    jest.clearAllMocks()
    api.getApiKey.mockResolvedValue({ hashedKey: null })
  })

  afterAll(() => {
    removeCookie(process.env.VUE_APP_DS_COOKIE_NAME)
  })

  it('should display a button to generate the API key by default', () => {
    wrapper = shallowMount(ApiPage, { i18n, localVue, router, store })
    expect(wrapper.find('.api .api__create-key b-button-stub').exists()).toBeTruthy()
  })

  it('should display no rows by default', () => {
    wrapper = shallowMount(ApiPage, { i18n, localVue, router, store })

    expect(wrapper.findAll('.api__key')).toHaveLength(0)
  })

  it('should request the creation of the API key', async () => {
    wrapper = mount(ApiPage, { i18n, localVue, router, store }) // for b-button
    api.getApiKey.mockResolvedValue({ apiKey: '123456abcdef', hashedKey: 'test' })
    api.createApiKey.mockResolvedValue({ apiKey: '123456abcdef', hashedKey: 'test' })
    await wrapper.find('.api .api__create-key .btn').trigger('click')
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
    wrapper = shallowMount(ApiPage, { i18n, localVue, router, store })
    expect(wrapper.findAll('.api__key')).toHaveLength(0)

    await wrapper.vm.createApiKey()
    expect(wrapper.findAll('.api__key')).toHaveLength(1)

    await wrapper.vm.deleteApiKey()
    expect(wrapper.findAll('.api__key')).toHaveLength(0)

    expect(api.deleteApiKey).toBeCalledTimes(1)
    expect(api.deleteApiKey).toBeCalledWith('doe')
  })
})
