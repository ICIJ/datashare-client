import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import Settings from '@/pages/Settings'

describe('Settings.vue', () => {
  const { i18n, localVue } = CoreSetup.init().useAll()

  it('should load the settings page', async () => {
    const wrapper = await shallowMount(Settings, { i18n, localVue })
    expect(wrapper.find('page-header-stub').exists()).toBeTruthy()
  })
})
