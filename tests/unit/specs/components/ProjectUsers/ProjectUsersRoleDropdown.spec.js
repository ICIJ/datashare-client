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
      props: { modelValue: 'PROJECT_MEMBER', projectName, dirty: false, noRole: true, ...props }
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

  it.each([
    [
      'INSTANCE_ADMIN',
      ['INSTANCE_ADMIN', 'DOMAIN_ADMIN', 'PROJECT_ADMIN', 'PROJECT_EDITOR', 'PROJECT_MEMBER', 'PROJECT_VISITOR', 'NO_ROLE'],
      []
    ],
    [
      'DOMAIN_ADMIN',
      ['DOMAIN_ADMIN', 'PROJECT_ADMIN', 'PROJECT_EDITOR', 'PROJECT_MEMBER', 'PROJECT_VISITOR', 'NO_ROLE'],
      ['INSTANCE_ADMIN']
    ],
    [
      'PROJECT_ADMIN',
      ['PROJECT_ADMIN', 'PROJECT_EDITOR', 'PROJECT_MEMBER', 'PROJECT_VISITOR', 'NO_ROLE'],
      ['DOMAIN_ADMIN', 'INSTANCE_ADMIN']
    ],
    [
      'PROJECT_EDITOR',
      ['PROJECT_EDITOR', 'PROJECT_MEMBER', 'PROJECT_VISITOR', 'NO_ROLE'],
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

  it('appends NO_ROLE as the last available role when noRole is true', () => {
    const wrapper = mountComponent({ noRole: true })
    const roleValues = wrapper.vm.availableRoles.map(r => r.value)
    expect(roleValues.at(-1)).toBe('NO_ROLE')
  })

  it('does not include NO_ROLE when noRole is false', () => {
    const wrapper = mountComponent({ noRole: false })
    const roleValues = wrapper.vm.availableRoles.map(r => r.value)
    expect(roleValues).not.toContain('NO_ROLE')
  })

  it('excludes roles listed in hiddenRoles from available roles', () => {
    const wrapper = mountComponent({ hiddenRoles: ['DOMAIN_ADMIN', 'INSTANCE_ADMIN'] })
    const roleValues = wrapper.vm.availableRoles.map(r => r.value)
    expect(roleValues).not.toContain('DOMAIN_ADMIN')
    expect(roleValues).not.toContain('INSTANCE_ADMIN')
    expect(roleValues).toContain('PROJECT_ADMIN')
  })

  it('keeps roles listed in disabledRoles visible but flags them as disabled', () => {
    const wrapper = mountComponent({ disabledRoles: ['DOMAIN_ADMIN', 'INSTANCE_ADMIN'] })
    const byValue = Object.fromEntries(wrapper.vm.availableRoles.map(r => [r.value, r.disabled]))
    expect(byValue.DOMAIN_ADMIN).toBe(true)
    expect(byValue.INSTANCE_ADMIN).toBe(true)
    expect(byValue.PROJECT_ADMIN).toBe(false)
  })

  it('marks the dropdown items of disabledRoles as disabled', () => {
    const wrapper = mountComponent({ disabledRoles: ['INSTANCE_ADMIN'] })
    const index = wrapper.vm.availableRoles.findIndex(r => r.value === 'INSTANCE_ADMIN')
    const item = wrapper.findAll('b-dropdown-item-stub')[index]
    expect(item.attributes('disabled')).toBe('true')
  })

  it('does not emit update:modelValue when a disabled role is clicked', async () => {
    const wrapper = mountComponent({ disabledRoles: ['INSTANCE_ADMIN'] })
    const index = wrapper.vm.availableRoles.findIndex(r => r.value === 'INSTANCE_ADMIN')
    await wrapper.findAll('b-dropdown-item-stub')[index].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('defaults noRole to false', () => {
    const wrapper = shallowMount(ProjectUsersRoleDropdown, {
      global,
      props: { modelValue: 'PROJECT_MEMBER', projectName, dirty: false }
    })
    const roleValues = wrapper.vm.availableRoles.map(r => r.value)
    expect(roleValues).not.toContain('NO_ROLE')
  })
})
