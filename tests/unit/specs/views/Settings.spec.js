import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import Settings from '@/views/Settings'

describe('Settings.vue', () => {
  const { plugins } = CoreSetup.init().useAll()

  it('should load the settings page', async () => {
    const wrapper = await shallowMount(Settings, { global: { plugins } })
    expect(wrapper.find('page-header-stub').exists()).toBeTruthy()
  })
})
