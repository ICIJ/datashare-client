import axios from 'axios'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import Api from '@/api'
import { Core } from '@/core'
import ApiPage from '@/pages/Api'

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
    wrapper = shallowMount(ApiPage, { i18n, localVue, router, store })
  })

  afterAll(() => {
    jest.unmock('axios')
    removeCookie(process.env.VUE_APP_DS_COOKIE_NAME)
  })

  it('should display a button to generate the API key but default', () => {
    expect(wrapper.findAll('.api__explanation b-button-stub')).toHaveLength(1)
  })

  it('should NOT display the button to generate the API key if apiKey is set', async () => {
    await wrapper.vm.$set(wrapper.vm, 'apiKey', '123abc')

    expect(wrapper.findAll('.api__explanation b-button-stub')).toHaveLength(0)
  })

  it('should display no rows by default', () => {
    expect(wrapper.findAll('.row')).toHaveLength(0)
  })

  it('should display the apiKey', async () => {
    await wrapper.vm.getApiKey()

    expect(wrapper.findAll('.row')).toHaveLength(1)
    expect(wrapper.find('.row .col-6').text()).toBe('123456abcdef')
  })

  it('should request the API key', async () => {
    wrapper = mount(ApiPage, { i18n, localVue, router, store })
    axios.request.mockClear()

    await wrapper.find('.api__explanation .btn').trigger('click')
    await wrapper.vm.$nextTick()

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/key/doe'),
      method: 'PUT'
    }))
  })
})
