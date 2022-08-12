import Murmur from '@icij/murmur'
import axios from 'axios'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import Api from '@/api'
import ApiPage from '@/components/Api'
import { Core } from '@/core'

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({
      data: { apiKey: '123456abcdef' }
    })
  }
})

describe('Api.vue', () => {
  const { i18n, localVue, router, store } = Core.init(createLocalVue()).useAll()
  let wrapper = null

  beforeAll(() => setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify))

  beforeEach(() => {
    Murmur.config.merge({ mode: 'SERVER' })
    wrapper = shallowMount(ApiPage, { i18n, localVue, router, store })
    axios.request.mockClear()
  })

  afterAll(() => {
    jest.unmock('axios')
    removeCookie(process.env.VUE_APP_DS_COOKIE_NAME)
  })

  it('should display a button to generate the API key by default', () => {
    expect(wrapper.find('.api .api__create-key b-button-stub').exists()).toBeTruthy()
  })

  it('should display no rows by default', () => {
    expect(wrapper.findAll('.api__key')).toHaveLength(0)
  })

  it('should request the creation of the API key', async () => {
    wrapper = mount(ApiPage, { i18n, localVue, router, store })

    await wrapper.find('.api .api__create-key .btn').trigger('click')
    await wrapper.vm.$nextTick()

    expect(axios.request).toBeCalledTimes(3)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/key/doe'),
      method: 'PUT'
    }))
  })

  it('should delete the apiKey', async () => {
    await wrapper.vm.createApiKey()
    await wrapper.vm.deleteApiKey()

    expect(wrapper.findAll('.api__key')).toHaveLength(0)
  })
})
