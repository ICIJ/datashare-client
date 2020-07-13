import axios from 'axios'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'

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

  beforeEach(() => {
    wrapper = shallowMount(ApiPage, { i18n, localVue, router, store })
  })

  afterAll(() => jest.unmock('axios'))

  it('should display no rows by default', () => {
    expect(wrapper.findAll('.row')).toHaveLength(0)
  })

  it('should display the apiKey', async () => {
    await wrapper.vm.getApiKey()

    expect(wrapper.findAll('.row')).toHaveLength(1)
    expect(wrapper.findAll('.row .col-sm').at(1).text()).toBe('123456abcdef')
  })

  it('should request the API key', () => {
    wrapper = mount(ApiPage, { i18n, localVue, router, store })
    axios.request.mockClear()

    wrapper.find('.api__explanation .btn').trigger('click')

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/key/create'),
      method: 'PUT'
    }))
  })
})
