import Murmur from '@icij/murmur'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import { Api } from '@/api'
import ApiPage from '@/components/Api'
import { Core } from '@/core'
import { storeBuilder } from '@/store/storeBuilder'
import { getMode, MODE_NAME } from '@/mode'
import { flushPromises } from 'tests/unit/tests_utils'

describe('Api.vue', () => {
  let i18n, localVue, router, wrapper, store, mockAxios

  beforeAll(() => {
    mockAxios = { request: jest.fn() }
    const api = new Api(mockAxios, null)
    const core = Core.init(createLocalVue(), api, getMode(MODE_NAME.SERVER)).useAll()
    i18n = core.i18n
    localVue = core.localVue
    router = core.router
    store = storeBuilder(api)
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)
  })

  beforeEach(() => {
    Murmur.config.merge({ mode: MODE_NAME.SERVER })
    mockAxios.request.mockClear()
    mockAxios.request.mockResolvedValue({
      data: { apiKey: '123456abcdef', hashedKey: 'test' }
    })
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
    await wrapper.find('.api .api__create-key .btn').trigger('click')
    await flushPromises()

    expect(mockAxios.request).toBeCalledTimes(3)
    expect(mockAxios.request).toBeCalledWith(
      expect.objectContaining({
        url: Api.getFullUrl('/api/key/doe'),
        method: 'PUT'
      })
    )
  })

  it('should delete the apiKey', async () => {
    wrapper = shallowMount(ApiPage, { i18n, localVue, router, store })
    expect(wrapper.findAll('.api__key')).toHaveLength(0)
    await wrapper.vm.createApiKey()
    expect(wrapper.findAll('.api__key')).toHaveLength(1)
    await wrapper.vm.deleteApiKey()
    expect(wrapper.findAll('.api__key')).toHaveLength(0)
  })
})
