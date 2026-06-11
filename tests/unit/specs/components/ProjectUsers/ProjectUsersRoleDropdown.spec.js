import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectUsersRoleDropdown from '@/components/ProjectUsers/ProjectUsersRoleDropdown.vue'
import { usePolicies } from '@/composables/usePolicies.js'

vi.mock('@/composables/usePolicies', () => ({
  usePolicies: vi.fn(() => ({
    getRoleByProject: vi.fn().mockReturnValue('INSTANCE_ADMIN'),
    formatRole: (_t, role) => role
  }))
}))

describe('ProjectUsersRoleDropdown.vue', () => {
  let core, global

  const projectName = 'local-datashare'

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    core.createPinia()
    global = { plugins: core.plugins, renderStubDefaultSlot: true }
    vi.mocked(usePolicies).mockReturnValue({
      getRoleByProject: vi.fn().mockReturnValue('INSTANCE_ADMIN'),
      formatRole: (_t, role) => role
    })
  })

  function mountComponent(props = {}) {
    return shallowMount(ProjectUsersRoleDropdown, {
      global,
      props: { modelValue: 'PROJECT_MEMBER', projectName, dirty: false, ...props }
    })
  }

  it('renders a b-dropdown', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('b-dropdown-stub').exists()).toBe(true)
  })

  it('displays the modelValue role in the button content', () => {
    const wrapper = mountComponent({ modelValue: 'PROJECT_MEMBER' })
    expect(wrapper.find('display-role-stub').attributes('value')).toBe('PROJECT_MEMBER')
  })

  it('emits update:modelValue with the selected role when a dropdown item is clicked', async () => {
    const wrapper = mountComponent()
    await wrapper.findAll('b-dropdown-item-stub')[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0][0]).toBe(wrapper.vm.availableRoles[0].value)
  })

  it('applies dirty class when dirty prop is true', () => {
    const wrapper = mountComponent({ dirty: true })
    expect(wrapper.classes()).toContain('project-users-role-dropdown--dirty')
  })

  it('does not apply dirty class when dirty prop is false', () => {
    const wrapper = mountComponent({ dirty: false })
    expect(wrapper.classes()).not.toContain('project-users-role-dropdown--dirty')
  })

  it.each([
    [
      'INSTANCE_ADMIN',
      ['INSTANCE_ADMIN', 'DOMAIN_ADMIN', 'PROJECT_ADMIN', 'PROJECT_EDITOR', 'PROJECT_MEMBER', 'PROJECT_VISITOR'],
      []
    ],
    [
      'DOMAIN_ADMIN',
      ['DOMAIN_ADMIN', 'PROJECT_ADMIN', 'PROJECT_EDITOR', 'PROJECT_MEMBER', 'PROJECT_VISITOR'],
      ['INSTANCE_ADMIN']
    ],
    [
      'PROJECT_ADMIN',
      ['PROJECT_ADMIN', 'PROJECT_EDITOR', 'PROJECT_MEMBER', 'PROJECT_VISITOR'],
      ['DOMAIN_ADMIN', 'INSTANCE_ADMIN']
    ],
    [
      'PROJECT_EDITOR',
      ['PROJECT_EDITOR', 'PROJECT_MEMBER', 'PROJECT_VISITOR'],
      ['PROJECT_ADMIN', 'DOMAIN_ADMIN', 'INSTANCE_ADMIN']
    ],
  ])(
    'when current user is %s, available roles are correctly bounded',
    (currentRole, mustInclude, mustExclude) => {
      vi.mocked(usePolicies).mockReturnValue({
        getRoleByProject: vi.fn().mockReturnValue(currentRole),
        formatRole: (_t, role) => role
      })
      const wrapper = mountComponent()
      const roleValues = wrapper.vm.availableRoles.map(r => r.value)
      mustInclude.forEach(role => expect(roleValues).toContain(role))
      mustExclude.forEach(role => expect(roleValues).not.toContain(role))
    }
  )
})
