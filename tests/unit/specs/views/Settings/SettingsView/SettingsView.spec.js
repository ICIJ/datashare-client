import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SettingsView from '@/views/Settings/SettingsView/SettingsView'
import { MODE_NAME } from '@/mode'

const INSTANCE_ADMIN_POLICIES = [{ projectId: '*', domainId: '*', role: 'INSTANCE_ADMIN' }]
const DOMAIN_ADMIN_POLICIES = [{ projectId: '*', domainId: '*', role: 'DOMAIN_ADMIN' }]
const PROJECT_ADMIN_POLICIES = [{ projectId: 'foo', domainId: 'default', role: 'PROJECT_ADMIN' }]

describe('SettingsView', () => {
  let plugins
  let core

  beforeEach(() => {
    core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  it('shows the Users tab when mode is SERVER and the user is instance admin', () => {
    core.config.set('mode', MODE_NAME.SERVER)
    core.config.set('policies', INSTANCE_ADMIN_POLICIES)
    const wrapper = mount(SettingsView, { global: { plugins } })

    expect(wrapper.text()).toContain('Users')
  })

  it('shows the Users tab when mode is SERVER and the user is domain admin', () => {
    core.config.set('mode', MODE_NAME.SERVER)
    core.config.set('policies', DOMAIN_ADMIN_POLICIES)
    const wrapper = mount(SettingsView, { global: { plugins } })

    expect(wrapper.text()).toContain('Users')
  })

  it('hides the Users tab when the user is not domain or instance admin', () => {
    core.config.set('mode', MODE_NAME.SERVER)
    core.config.set('policies', PROJECT_ADMIN_POLICIES)
    const wrapper = mount(SettingsView, { global: { plugins } })

    expect(wrapper.text()).not.toContain('Users')
  })

  it('hides the Users tab when mode is not SERVER, even for an instance admin', () => {
    core.config.set('mode', MODE_NAME.LOCAL)
    core.config.set('policies', INSTANCE_ADMIN_POLICIES)
    const wrapper = mount(SettingsView, { global: { plugins } })

    expect(wrapper.text()).not.toContain('Users')
  })
})
