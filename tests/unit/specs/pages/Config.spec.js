import { createLocalVue, shallowMount } from '@vue/test-utils'

import { App } from '@/main'
import Config from '@/pages/Config'
import { datashare } from '@/store/modules/config'
import Api from '@/api'
import { jsonResp } from 'tests/unit/tests_utils'

const { localVue, store } = App.init(createLocalVue()).useAll()

describe('Config.vue', () => {
  let wrapper

  beforeAll(() => {
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonResp())
  })

  beforeEach(() => {
    datashare.fetch.mockClear()
    wrapper = shallowMount(Config, { localVue, store, mocks: { $t: msg => msg } })
  })

  it('should load the config page', () => {
    expect(wrapper.find('h3').text()).toBe('config.title')
  })

  it('should display a text input', () => {
    wrapper.vm.config = { property_01: 'value_01', property_02: 'value_02' }

    expect(wrapper.findAll('b-form-input-stub')).toHaveLength(2)
  })

  it('should load the config on component creation', () => {
    expect(datashare.fetch).toBeCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(Api.getFullUrl('/api/config'), {})
  })

  it('should submit the config modifications', () => {
    wrapper.vm.onSubmit()

    expect(datashare.fetch).toBeCalledTimes(2)
    expect(datashare.fetch).toBeCalledWith(Api.getFullUrl('/api/config'), { method: 'PATCH', body: JSON.stringify({ data: {} }), headers: { 'Content-Type': 'application/json' } })
  })
})
