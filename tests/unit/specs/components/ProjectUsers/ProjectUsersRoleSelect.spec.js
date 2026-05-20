import { shallowMount, flushPromises } from '@vue/test-utils'
import { AppIcon, ButtonIcon } from '@icij/murmur-next'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectUsersRoleSelect from '@/components/ProjectUsers/ProjectUsersRoleSelect.vue'
import { apiInstance as api } from '@/api/apiInstance.js'
import { usePolicies } from '@/composables/usePolicies.js'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: { saveProjectPolicy: vi.fn() }
}))

const mockToast = { error: vi.fn() }
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({ toast: mockToast })
}))

vi.mock('@/composables/usePolicies', () => ({
  usePolicies: vi.fn(() => ({
    getRoleByProject: vi.fn().mockReturnValue('INSTANCE_ADMIN'),
    formatRole: (_t, role) => role
  }))
}))

describe('ProjectUsersRoleSelect.vue', () => {
  let core, global

  const user = { name: 'alice@icij.org', role: 'PROJECT_ADMIN' }
  const projectName = 'local-datashare'

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    core.createPinia()
    global = { plugins: core.plugins }
    vi.mocked(usePolicies).mockReturnValue({
      getRoleByProject: vi.fn().mockReturnValue('INSTANCE_ADMIN'),
      formatRole: (_t, role) => role
    })
  })

  function mountComponent(props = {}) {
    return shallowMount(ProjectUsersRoleSelect, {
      global,
      props: { user, projectName, ...props }
    })
  }

  it('renders a b-dropdown', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('b-dropdown-stub').exists()).toBe(true)
  })

  it('hides confirm and cancel buttons when role is unchanged', () => {
    const wrapper = mountComponent()
    expect(wrapper.vm.dirty).toBe(false)
    wrapper.findAllComponents(ButtonIcon).forEach(btn => {
      expect(btn.attributes('style')).toContain('visibility: hidden')
    })
  })

  it('shows confirm and cancel buttons when role changes', async () => {
    const wrapper = mountComponent()
    wrapper.vm.selectedRole = 'PROJECT_MEMBER'
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.dirty).toBe(true)
    wrapper.findAllComponents(ButtonIcon).forEach(btn => {
      expect(btn.attributes('style')).toContain('visibility: visible')
    })
  })

  it('cancel reverts selectedRole to the committed role', async () => {
    const wrapper = mountComponent()
    wrapper.vm.selectedRole = 'PROJECT_MEMBER'
    await wrapper.vm.$nextTick()
    wrapper.vm.cancel()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.selectedRole).toBe('PROJECT_ADMIN')
    expect(wrapper.vm.dirty).toBe(false)
  })

  it('confirm calls saveProjectPolicy with correct arguments', async () => {
    api.saveProjectPolicy.mockResolvedValue(undefined)
    const wrapper = mountComponent()
    wrapper.vm.selectedRole = 'PROJECT_MEMBER'
    await wrapper.vm.$nextTick()
    await wrapper.vm.confirm()
    await flushPromises()
    expect(api.saveProjectPolicy).toHaveBeenCalledWith('default', projectName, {
      user: user.name,
      role: 'PROJECT_MEMBER'
    })
  })

  it('shows success AppIcon and clears dirty after a successful save', async () => {
    api.saveProjectPolicy.mockResolvedValue(undefined)
    const wrapper = mountComponent()
    wrapper.vm.selectedRole = 'PROJECT_MEMBER'
    await wrapper.vm.$nextTick()
    await wrapper.vm.confirm()
    await flushPromises()
    expect(wrapper.vm.saved).toBe(true)
    expect(wrapper.vm.dirty).toBe(false)
    expect(wrapper.findComponent(AppIcon).attributes('style')).toContain('visibility: visible')
  })

  it('reverts selectedRole and shows error toast on API failure', async () => {
    api.saveProjectPolicy.mockRejectedValue(new Error('forbidden'))
    const wrapper = mountComponent()
    wrapper.vm.selectedRole = 'PROJECT_MEMBER'
    await wrapper.vm.$nextTick()
    await wrapper.vm.confirm()
    await flushPromises()
    expect(wrapper.vm.selectedRole).toBe('PROJECT_ADMIN')
    expect(wrapper.vm.saved).toBe(false)
    expect(mockToast.error).toHaveBeenCalledOnce()
  })

  it('only includes roles available to the current user', () => {
    vi.mocked(usePolicies).mockReturnValue({
      getRoleByProject: vi.fn().mockReturnValue('PROJECT_ADMIN'),
      formatRole: (_t, role) => role
    })
    const wrapper = mountComponent()
    const roleValues = wrapper.vm.availableRoles.map(r => r.value)
    // PROJECT_ADMIN hierarchy (bits 0b001111) includes PROJECT_VISITOR, PROJECT_MEMBER,
    // PROJECT_EDITOR, PROJECT_ADMIN but NOT DOMAIN_ADMIN or INSTANCE_ADMIN
    expect(roleValues).toContain('PROJECT_ADMIN')
    expect(roleValues).toContain('PROJECT_EDITOR')
    expect(roleValues).not.toContain('DOMAIN_ADMIN')
    expect(roleValues).not.toContain('INSTANCE_ADMIN')
  })
})
