import { createLocalVue, shallowMount } from '@vue/test-utils'

import { App } from '@/main'
import Config from '@/pages/Config'

const { localVue } = App.init(createLocalVue()).useAll()

describe('Config.vue', () => {
  it('should load the config page', () => {
    const wrapper = shallowMount(Config, { localVue, mocks: { $t: msg => msg } })

    expect(wrapper.find('h3').text()).toBe('config.title')
  })

  it('should display a radio button', () => {
    const wrapper = shallowMount(Config, { localVue, mocks: { $t: msg => msg }, data: function () { return { configFields: [{ name: 'testBoolean', type: 'boolean' }] } } })

    expect(wrapper.findAll('b-form-radio-group-stub')).toHaveLength(1)
  })

  it('should display a text input', () => {
    const wrapper = shallowMount(Config, { localVue, mocks: { $t: msg => msg }, data: function () { return { configFields: [{ name: 'testText', type: 'text' }] } } })

    expect(wrapper.findAll('b-form-input-stub')).toHaveLength(1)
  })
})
