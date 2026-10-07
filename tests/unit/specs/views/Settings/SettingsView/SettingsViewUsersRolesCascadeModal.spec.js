import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import AppModal from '@/components/AppModal/AppModal.vue'
import InstanceUsersRoleBadge from '@/components/InstanceUsers/InstanceUsersRoleBadge.vue'
import SettingsViewUsersRolesCascadeModal from '@/views/Settings/SettingsView/SettingsViewUsersRolesCascadeModal.vue'

describe('SettingsViewUsersRolesCascadeModal.vue', () => {
  let core, global

  const grants = [
    { domain: 'default', project: 'project-a', role: 'PROJECT_MEMBER' },
    { domain: '*', project: '*', role: 'DOMAIN_ADMIN' }
  ]

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    core.createPinia()
    global = { plugins: core.plugins }
  })

  function mountComponent(props = {}) {
    return mount(SettingsViewUsersRolesCascadeModal, {
      global: { ...global, stubs: { 'app-modal': { template: '<div><slot /></div>' } } },
      props: { modelValue: true, grants, ...props }
    })
  }

  it('renders one badge per grant that will be revoked', () => {
    const wrapper = mountComponent()
    expect(wrapper.findAllComponents(InstanceUsersRoleBadge)).toHaveLength(grants.length)
  })

  it('passes the project-scoped grant its project, and the instance-wide grant none', () => {
    const wrapper = mountComponent()
    const badges = wrapper.findAllComponents(InstanceUsersRoleBadge)
    expect(badges[0].props()).toMatchObject({ role: 'PROJECT_MEMBER', project: 'project-a' })
    expect(badges[1].props()).toMatchObject({ role: 'DOMAIN_ADMIN', project: null })
  })

  it('emits confirm when the modal ok event fires', async () => {
    const wrapper = mountComponent()
    await wrapper.findComponent(AppModal).vm.$emit('ok')
    expect(wrapper.emitted('confirm')).toBeTruthy()
  })

  it('closes the modal (sets modelValue to false) when ok fires', async () => {
    const wrapper = mountComponent()
    await wrapper.findComponent(AppModal).vm.$emit('ok')
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('claims the revoked grants stay gone by default, since that is only false under OAuth', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('They will not come back if this role is revoked later')
  })

  it('does not claim the revoked grants stay gone when they are reconciled from an identity provider', () => {
    const wrapper = mountComponent({ revokedGrantsStayRevoked: false })
    expect(wrapper.text()).not.toContain('They will not come back if this role is revoked later')
    expect(wrapper.text()).toContain('Some may come back on their own')
  })
})
