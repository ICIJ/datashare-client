import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup.js'
import ProjectLabel from '@/components/Project/ProjectLabel.vue'
import SettingsViewUsersRolesModal from '@/views/Settings/SettingsView/SettingsViewUsersRolesModal.vue'

const mockToast = { error: vi.fn(), success: vi.fn() }
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({ toast: mockToast })
}))

const mockApi = {
  getUserByUid: vi.fn(),
  grantUserRole: vi.fn(),
  revokeUserRole: vi.fn(),
  grantInstanceRole: vi.fn(),
  revokeInstanceRole: vi.fn()
}
vi.mock('@/composables/useCore', () => ({
  useCore: () => ({
    api: mockApi,
    projects: [{ name: 'project-a' }, { name: 'project-b' }, { name: 'project-c' }]
  })
}))

describe('SettingsViewUsersRolesModal.vue', () => {
  let core, global

  const user = {
    uid: 'alice@example.org',
    permissions: [
      { v1: 'PROJECT_MEMBER', v2: 'default::project-a' },
      { v1: 'PROJECT_ADMIN', v2: 'default::project-b' }
    ]
  }

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockApi.getUserByUid.mockResolvedValue(user)
    mockApi.grantUserRole.mockResolvedValue(undefined)
    mockApi.revokeUserRole.mockResolvedValue(undefined)
    mockApi.grantInstanceRole.mockResolvedValue(undefined)
    mockApi.revokeInstanceRole.mockResolvedValue(undefined)
    core.createPinia()
    global = { plugins: core.plugins, renderStubDefaultSlot: true }
  })

  function mountComponent(props = {}) {
    return shallowMount(SettingsViewUsersRolesModal, {
      global,
      props: { modelValue: true, user, ...props }
    })
  }

  it('parses the permissions array into project/role rows, sorted by role rank then A-Z', () => {
    const wrapper = mountComponent()
    // PageTableGeneric mutates each item to track row-details state (`_showDetails`), so match
    // on the fields this component owns rather than a strict equal.
    expect(wrapper.vm.roles).toMatchObject([
      { domain: 'default', project: 'project-b', role: 'PROJECT_ADMIN' },
      { domain: 'default', project: 'project-a', role: 'PROJECT_MEMBER' }
    ])
  })

  it('sorts same-tier rows A-Z by project name', () => {
    const wrapper = mountComponent({
      user: {
        uid: 'alice@example.org',
        permissions: [
          { v1: 'PROJECT_ADMIN', v2: 'default::project-z' },
          { v1: 'PROJECT_ADMIN', v2: 'default::project-a' }
        ]
      }
    })
    expect(wrapper.vm.roles.map(r => r.project)).toEqual(['project-a', 'project-z'])
  })

  it('sorts the instance-wide row before project rows regardless of role, since instance admin outranks everything', () => {
    const wrapper = mountComponent({
      user: {
        uid: 'alice@example.org',
        permissions: [
          { v1: 'PROJECT_ADMIN', v2: 'default::project-a' },
          { v1: 'INSTANCE_ADMIN', v2: '*::*' }
        ]
      }
    })
    expect(wrapper.vm.roles.map(r => r.project)).toEqual(['*', 'project-a'])
  })

  it('renders a project label for each permission, in role/A-Z sort order', () => {
    const wrapper = mountComponent()
    const projects = wrapper.findAllComponents(ProjectLabel).map(c => c.props('project'))
    expect(projects).toEqual(['project-b', 'project-a'])
  })

  it('excludes projects the user already has a role on from the picker', () => {
    const wrapper = mountComponent()
    expect(wrapper.vm.availableProjects).toEqual([{ name: 'project-c' }])
  })

  it('revokes a role, refetches the user and emits user:updated', async () => {
    const updatedUser = {
      uid: 'alice@example.org',
      permissions: [{ v1: 'PROJECT_ADMIN', v2: 'default::project-b' }]
    }
    mockApi.getUserByUid.mockResolvedValue(updatedUser)
    const wrapper = mountComponent()
    await wrapper.vm.revokeRole({ project: 'project-a', role: 'PROJECT_MEMBER', domain: 'default' })
    expect(mockApi.revokeUserRole).toHaveBeenCalledWith('alice@example.org', 'project-a', { ifExists: true })
    expect(mockApi.getUserByUid).toHaveBeenCalledWith('alice@example.org')
    expect(wrapper.vm.roles).toMatchObject([{ domain: 'default', project: 'project-b', role: 'PROJECT_ADMIN' }])
    expect(wrapper.emitted('user:updated')).toEqual([[{ uid: 'alice@example.org' }]])
    expect(mockToast.success).toHaveBeenCalledOnce()
  })

  it('shows an error toast and does not emit user:updated when revoke fails', async () => {
    mockApi.revokeUserRole.mockRejectedValue(new Error('nope'))
    const wrapper = mountComponent()
    await wrapper.vm.revokeRole({ project: 'project-a', role: 'PROJECT_MEMBER', domain: 'default' })
    expect(mockApi.getUserByUid).not.toHaveBeenCalled()
    expect(wrapper.emitted('user:updated')).toBeFalsy()
    expect(mockToast.error).toHaveBeenCalledOnce()
  })

  it('grants a role for the selected project, refetches the user, resets the form and emits user:updated', async () => {
    const updatedUser = {
      uid: 'alice@example.org',
      permissions: [
        { v1: 'PROJECT_MEMBER', v2: 'default::project-a' },
        { v1: 'PROJECT_ADMIN', v2: 'default::project-b' },
        { v1: 'PROJECT_EDITOR', v2: 'default::project-c' }
      ]
    }
    mockApi.getUserByUid.mockResolvedValue(updatedUser)
    const wrapper = mountComponent()
    wrapper.vm.selectedProject = { name: 'project-c' }
    wrapper.vm.selectedRole = 'PROJECT_EDITOR'
    await wrapper.vm.grantRole()
    expect(mockApi.grantUserRole).toHaveBeenCalledWith('alice@example.org', 'project-c', 'editor')
    expect(wrapper.vm.roles).toContainEqual(
      expect.objectContaining({ domain: 'default', project: 'project-c', role: 'PROJECT_EDITOR' })
    )
    expect(wrapper.vm.selectedProject).toBe(null)
    expect(wrapper.emitted('user:updated')).toEqual([[{ uid: 'alice@example.org' }]])
    expect(mockToast.success).toHaveBeenCalledOnce()
  })

  it('does not grant a role when no project is selected', async () => {
    const wrapper = mountComponent()
    await wrapper.vm.grantRole()
    expect(mockApi.grantUserRole).not.toHaveBeenCalled()
  })

  it('does not grant when "no role" is selected, even with a project picked', async () => {
    const wrapper = mountComponent()
    wrapper.vm.selectedProject = { name: 'project-c' }
    wrapper.vm.selectedRole = 'NO_ROLE'
    expect(wrapper.vm.canGrant).toBe(false)
    await wrapper.vm.grantRole()
    expect(mockApi.grantUserRole).not.toHaveBeenCalled()
  })

  it('shows an error toast and does not emit user:updated when grant fails', async () => {
    mockApi.grantUserRole.mockRejectedValue(new Error('nope'))
    const wrapper = mountComponent()
    wrapper.vm.selectedProject = { name: 'project-c' }
    await wrapper.vm.grantRole()
    expect(mockApi.getUserByUid).not.toHaveBeenCalled()
    expect(wrapper.emitted('user:updated')).toBeFalsy()
    expect(mockToast.error).toHaveBeenCalledOnce()
  })

  it('renders "Instance" instead of a project label for the wildcard permission', () => {
    const wrapper = mountComponent({
      user: {
        uid: 'alice@example.org',
        permissions: [{ v1: 'INSTANCE_ADMIN', v2: '*::*' }]
      }
    })
    expect(wrapper.findComponent(ProjectLabel).exists()).toBe(false)
    expect(wrapper.text()).toContain('Instance')
  })

  describe('instance scope', () => {
    beforeEach(() => {
      core.config.set('policies', [{ projectId: '*', domainId: '*', role: 'INSTANCE_ADMIN' }])
    })

    it('offers the instance scope for an instance admin who does not already hold it', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.canGrantInstanceRole).toBe(true)
    })

    it('does not offer the instance scope again once already granted', () => {
      const wrapper = mountComponent({
        user: {
          uid: 'alice@example.org',
          permissions: [{ v1: 'INSTANCE_ADMIN', v2: '*::*' }]
        }
      })
      expect(wrapper.vm.canGrantInstanceRole).toBe(false)
    })

    it('does not offer the instance scope to a non instance admin', () => {
      core.config.set('policies', [{ projectId: 'project-a', domainId: 'default', role: 'PROJECT_ADMIN' }])
      const wrapper = mountComponent()
      expect(wrapper.vm.canGrantInstanceRole).toBe(false)
    })

    it('lists the instance entry first in the project picker', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.projectPickerOptions[0]).toEqual({ name: '*', label: 'Instance' })
    })

    it('picking the instance entry from the project picker targets the wildcard project and defaults to domain admin', async () => {
      const wrapper = mountComponent()
      wrapper.vm.selectedProject = { name: '*' }
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.selectedProjectName).toBe('*')
      expect(wrapper.vm.isInstanceScope).toBe(true)
      expect(wrapper.vm.selectedRole).toBe('DOMAIN_ADMIN')
      expect(wrapper.vm.canGrant).toBe(true)
    })

    it('grants an instance-wide role via grantInstanceRole, not the project-scoped endpoint', async () => {
      const wrapper = mountComponent()
      wrapper.vm.selectedProject = { name: '*' }
      await wrapper.vm.$nextTick()
      wrapper.vm.selectedRole = 'INSTANCE_ADMIN'
      await wrapper.vm.grantRole()
      expect(mockApi.grantInstanceRole).toHaveBeenCalledWith('alice@example.org', 'instance_admin', 'default')
      expect(mockApi.grantUserRole).not.toHaveBeenCalled()
    })

    it('grants a domain admin role with the default domain', async () => {
      const wrapper = mountComponent()
      wrapper.vm.selectedProject = { name: '*' }
      await wrapper.vm.$nextTick()
      wrapper.vm.selectedRole = 'DOMAIN_ADMIN'
      await wrapper.vm.grantRole()
      expect(mockApi.grantInstanceRole).toHaveBeenCalledWith('alice@example.org', 'domain_admin', 'default')
    })

    it('revokes an instance-wide role via revokeInstanceRole, not the project-scoped endpoint', async () => {
      const wrapper = mountComponent({
        user: {
          uid: 'alice@example.org',
          permissions: [{ v1: 'INSTANCE_ADMIN', v2: '*::*' }]
        }
      })
      await wrapper.vm.revokeRole({ project: '*', role: 'INSTANCE_ADMIN', domain: '*' })
      expect(mockApi.revokeInstanceRole).toHaveBeenCalledWith('alice@example.org', 'instance_admin', '*')
      expect(mockApi.revokeUserRole).not.toHaveBeenCalled()
    })
  })
})
