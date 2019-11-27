import { createLocalVue, shallowMount } from '@vue/test-utils'

import { App } from '@/main'
import Config from '@/pages/Config'

const { localVue } = App.init(createLocalVue()).useAll()

describe('Config.vue', () => {
  it('should load the config page', () => {
    const wrapper = shallowMount(Config, { localVue })

    expect(wrapper.find('h3').text()).toBe('Configuration')
  })
})
