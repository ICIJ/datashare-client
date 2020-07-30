import { createLocalVue, shallowMount } from '@vue/test-utils'
import { Core } from '@/core'

import Settings from '@/pages/Settings'

describe('Settings.vue', () => {
  const { i18n, localVue } = Core.init(createLocalVue()).useAll()

  it('should load the settings page', async () => {
    const wrapper = await shallowMount(Settings, { i18n, localVue })
    expect(wrapper.find('page-header-stub').exists()).toBeTruthy()
  })
})
