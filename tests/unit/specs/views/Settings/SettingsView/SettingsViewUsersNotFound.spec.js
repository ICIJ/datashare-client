import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup.js'
import SettingsViewUsersNotFound from '@/views/Settings/SettingsView/SettingsViewUsersNotFound.vue'

describe('SettingsViewUsersNotFound.vue', () => {
  it('names the missing user in bold, escaped rather than rendered as HTML', () => {
    const { plugins } = CoreSetup.init().useAll()
    const wrapper = mount(SettingsViewUsersNotFound, { global: { plugins }, props: { uid: '<i>ghost</i>' } })
    expect(wrapper.text()).toBe('User <i>ghost</i> does not exist.')
    expect(wrapper.find('strong').text()).toBe('<i>ghost</i>')
    expect(wrapper.find('i').exists()).toBe(false)
  })
})
