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
      props: { modelValue: 'PROJECT_MEMBER', projectName, ...props }
    })
  }

  it('renders a b-dropdown', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('b-dropdown-stub').exists()).toBe(true)
  })

  it('availableRoles is non-empty when current user is INSTANCE_ADMIN', () => {
    const wrapper = mountComponent()
    expect(wrapper.vm.availableRoles.length).toBeGreaterThan(0)
  })

  it('emits update:modelValue with the selected role when a dropdown item is clicked', async () => {
    const wrapper = mountComponent()
    const item = wrapper.find('b-dropdown-item-stub')
    await item.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emittedRole = wrapper.emitted('update:modelValue')[0][0]
    expect(wrapper.vm.availableRoles.map(r => r.value)).toContain(emittedRole)
  })
})
