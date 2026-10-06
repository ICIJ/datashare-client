import { flushPromises, shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup.js'
import ButtonRowActionDelete from '@/components/Button/ButtonRowAction/ButtonRowActionDelete.vue'
import InstanceUsersRoleBadge from '@/components/InstanceUsers/InstanceUsersRoleBadge.vue'
import ProjectButton from '@/components/Project/ProjectButton.vue'
import ProjectDropdownSelector from '@/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.vue'
import ProjectUsersRoleDropdown from '@/components/ProjectUsers/ProjectUsersRoleDropdown.vue'
import SettingsViewUsersRolesModal from '@/views/Settings/SettingsView/SettingsViewUsersRolesModal.vue'
import SettingsViewUsersNotFound from '@/views/Settings/SettingsView/SettingsViewUsersNotFound.vue'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric.vue'

const mockToast = { error: vi.fn(), success: vi.fn() }
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({ toast: mockToast })
}))

const mockApi = {
  grantUserRole: vi.fn(),
  revokeUserRole: vi.fn(),
  grantInstanceRole: vi.fn(),
  revokeInstanceRole: vi.fn()
}
// 'form' (the default here) matches isAuthWithUsersProvider = true, so existing behavior in
// tests that don't care about auth mode is unaffected; the OAuth-specific tests below switch it.
let mockAuthMode = 'form'
const defaultProjects = [{ name: 'project-a' }, { name: 'project-b' }, { name: 'project-c' }]
let mockProjects = defaultProjects
vi.mock('@/composables/useCore', () => ({
  useCore: () => ({
    api: mockApi,
    projects: mockProjects,
    findProject: name => mockProjects.find(project => project.name === name),
    config: { get: key => (key === 'auth' ? mockAuthMode : undefined) },
    auth: { getUsername: vi.fn().mockResolvedValue('viewer@example.org'), isBasicAuth: vi.fn().mockResolvedValue(false) }
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
    mockAuthMode = 'form'
    mockProjects = defaultProjects
    mockApi.grantUserRole.mockResolvedValue(undefined)
    mockApi.revokeUserRole.mockResolvedValue(undefined)
    mockApi.grantInstanceRole.mockResolvedValue(undefined)
    mockApi.revokeInstanceRole.mockResolvedValue(undefined)
    core.createPinia()
    global = { plugins: core.plugins, renderStubDefaultSlot: true, stubs: { PageTableGeneric: false } }
  })

  function mountComponent(props = {}) {
    return shallowMount(SettingsViewUsersRolesModal, {
      global,
      props: { modelValue: true, user, ...props }
    })
  }

  // Mounts and lets useAuth resolve the viewer's username, so rows aren't treated as their own.
  async function mountResolved(props = {}) {
    const wrapper = mountComponent(props)
    await flushPromises()
    return wrapper
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

  it('renders a role badge for each permission, in role/A-Z sort order', () => {
    const wrapper = mountComponent()
    const projects = wrapper.findAllComponents(InstanceUsersRoleBadge).map(c => c.props('project'))
    expect(projects).toEqual(['project-b', 'project-a'])
  })

  it('excludes projects the user already has a role on from the picker', () => {
    const wrapper = mountComponent()
    expect(wrapper.vm.availableProjects).toEqual([{ name: 'project-c' }])
  })

  it('labels the scope picker "Select scope", since it covers both projects and the instance-wide scope', () => {
    const wrapper = mountComponent()
    expect(wrapper.findComponent(ProjectDropdownSelector).props('placeholder')).toBe('Select scope')
  })

  it('enables the scope picker when a project is still available to grant', () => {
    const wrapper = mountComponent()
    expect(wrapper.findComponent(ProjectDropdownSelector).props('disabled')).toBe(false)
  })

  it('disables the scope picker once every project is granted and there is no instance scope to offer', () => {
    const wrapper = mountComponent({
      user: {
        uid: 'alice@example.org',
        permissions: [
          { v1: 'PROJECT_MEMBER', v2: 'default::project-a' },
          { v1: 'PROJECT_MEMBER', v2: 'default::project-b' },
          { v1: 'PROJECT_MEMBER', v2: 'default::project-c' }
        ]
      }
    })
    expect(wrapper.vm.projectPickerOptions).toEqual([])
    expect(wrapper.findComponent(ProjectDropdownSelector).props('disabled')).toBe(true)
  })

  it('explains in a tooltip why the scope picker is disabled when every project is already granted', () => {
    const wrapper = mountComponent({
      user: {
        uid: 'alice@example.org',
        permissions: [
          { v1: 'PROJECT_MEMBER', v2: 'default::project-a' },
          { v1: 'PROJECT_MEMBER', v2: 'default::project-b' },
          { v1: 'PROJECT_MEMBER', v2: 'default::project-c' }
        ]
      }
    })
    expect(wrapper.vm.scopePickerDisabledTitle).toBe(
      core.i18n.global.t('settings.users.rolesModal.scopePickerDisabledNoOptions')
    )
  })

  it('does not explain the scope picker while it is merely enabled', () => {
    const wrapper = mountComponent()
    expect(wrapper.vm.scopePickerDisabledTitle).toBe(null)
  })

  it('revokes a role and emits user:updated', async () => {
    const wrapper = await mountResolved()
    await wrapper.vm.revokeRole({ project: 'project-a', role: 'PROJECT_MEMBER', domain: 'default' })
    expect(mockApi.revokeUserRole).toHaveBeenCalledWith('alice@example.org', 'project-a', { ifExists: true })
    expect(wrapper.emitted('user:updated')).toEqual([[{ uid: 'alice@example.org' }]])
    expect(mockToast.success).toHaveBeenCalledWith(
      core.i18n.global.t('settings.users.rolesModal.revokeSuccessOnProject', {
        role: 'Member',
        project: 'Project A',
        uid: 'alice@example.org'
      })
    )
  })

  // The granted-roles table reads props.user, which the parent refreshes on user:updated. It used
  // to refetch the user itself through GET /api/users/admin/:uid, which carries no permissions at
  // all, so the whole list emptied out after every grant.
  it('keeps listing the granted roles after a grant, and picks up the refreshed user prop', async () => {
    const wrapper = await mountResolved()
    wrapper.vm.selectedProject = { name: 'project-c' }
    wrapper.vm.selectedRole = 'PROJECT_EDITOR'
    await wrapper.vm.grantRole()
    expect(wrapper.vm.roles).toHaveLength(2)

    await wrapper.setProps({
      user: {
        uid: 'alice@example.org',
        permissions: [...user.permissions, { v1: 'PROJECT_EDITOR', v2: 'default::project-c' }]
      }
    })
    expect(wrapper.vm.roles).toContainEqual(
      expect.objectContaining({ domain: 'default', project: 'project-c', role: 'PROJECT_EDITOR' })
    )
  })

  it('shows an error toast and does not emit user:updated when revoke fails', async () => {
    mockApi.revokeUserRole.mockRejectedValue(new Error('nope'))
    const wrapper = await mountResolved()
    await wrapper.vm.revokeRole({ project: 'project-a', role: 'PROJECT_MEMBER', domain: 'default' })
    expect(wrapper.emitted('user:updated')).toBeFalsy()
    expect(mockToast.error).toHaveBeenCalledOnce()
  })

  it('grants a role for the selected project, resets the form and emits user:updated', async () => {
    const wrapper = await mountResolved()
    wrapper.vm.selectedProject = { name: 'project-c' }
    wrapper.vm.selectedRole = 'PROJECT_EDITOR'
    await wrapper.vm.grantRole()
    expect(mockApi.grantUserRole).toHaveBeenCalledWith('alice@example.org', 'project-c', 'editor')
    expect(mockToast.success).toHaveBeenCalledWith(
      core.i18n.global.t('settings.users.rolesModal.grantSuccessOnProject', {
        role: 'Editor',
        project: 'Project C',
        uid: 'alice@example.org'
      })
    )
    expect(wrapper.vm.selectedProject).toBe(null)
    expect(wrapper.emitted('user:updated')).toEqual([[{ uid: 'alice@example.org' }]])
    expect(mockToast.success).toHaveBeenCalledOnce()
  })

  it('defaults the role to no role, forcing an explicit pick', () => {
    const wrapper = mountComponent()
    expect(wrapper.vm.selectedRole).toBe('NO_ROLE')
  })

  it('does not grant a role when no project is selected', async () => {
    const wrapper = await mountResolved()
    await wrapper.vm.grantRole()
    expect(mockApi.grantUserRole).not.toHaveBeenCalled()
  })

  it('does not grant when "no role" is selected, even with a project picked', async () => {
    const wrapper = await mountResolved()
    wrapper.vm.selectedProject = { name: 'project-c' }
    wrapper.vm.selectedRole = 'NO_ROLE'
    expect(wrapper.vm.canGrant).toBe(false)
    await wrapper.vm.grantRole()
    expect(mockApi.grantUserRole).not.toHaveBeenCalled()
  })

  it('shows an error toast and does not emit user:updated when grant fails', async () => {
    mockApi.grantUserRole.mockRejectedValue(new Error('nope'))
    const wrapper = await mountResolved()
    wrapper.vm.selectedProject = { name: 'project-c' }
    wrapper.vm.selectedRole = 'PROJECT_MEMBER'
    await wrapper.vm.grantRole()
    expect(wrapper.emitted('user:updated')).toBeFalsy()
    expect(mockToast.error).toHaveBeenCalledOnce()
  })

  describe('canRevoke', () => {
    beforeEach(() => {
      core.config.set('policies', [{ projectId: '*', domainId: '*', role: 'INSTANCE_ADMIN' }])
    })

    it.each(['INSTANCE_ADMIN', 'DOMAIN_ADMIN'])('does not let a domain admin revoke a %s grant, which only an instance admin can', (role) => {
      core.config.set('policies', [{ projectId: '*', domainId: '*', role: 'DOMAIN_ADMIN' }])
      const wrapper = mountComponent()
      expect(wrapper.vm.canRevoke({ project: '*', role })).toBe(false)
    })

    it('still lets a domain admin revoke a project role under form/basic auth', async () => {
      core.config.set('policies', [{ projectId: '*', domainId: '*', role: 'DOMAIN_ADMIN' }])
      const wrapper = await mountResolved()
      expect(wrapper.vm.canRevoke({ project: 'project-a', role: 'PROJECT_MEMBER' })).toBe(true)
    })

    it('allows revoking a project role under form/basic auth', async () => {
      const wrapper = await mountResolved()
      expect(wrapper.vm.canRevoke({ project: 'project-a', role: 'PROJECT_MEMBER' })).toBe(true)
    })

    it('allows revoking the instance-wide role even under OAuth, since it is datashare-native', async () => {
      mockAuthMode = 'oauth2'
      const wrapper = await mountResolved()
      expect(wrapper.vm.canRevoke({ project: '*', role: 'INSTANCE_ADMIN' })).toBe(true)
    })

    it('disallows revoking a project role under OAuth, since it is IdP-managed and would not stick', () => {
      mockAuthMode = 'oauth2'
      const wrapper = mountComponent()
      expect(wrapper.vm.canRevoke({ project: 'project-a', role: 'PROJECT_MEMBER' })).toBe(false)
    })

    it('does not call the API when revoking a project role is not allowed', async () => {
      mockAuthMode = 'oauth2'
      const wrapper = await mountResolved()
      await wrapper.vm.revokeRole({ project: 'project-a', role: 'PROJECT_MEMBER', domain: 'default' })
      expect(mockApi.revokeUserRole).not.toHaveBeenCalled()
    })
  })

  describe('changeRole', () => {
    it('does nothing when the picked role is the one already granted', async () => {
      const wrapper = await mountResolved()
      await wrapper.vm.changeRole({ project: 'project-a', role: 'PROJECT_MEMBER' }, 'PROJECT_MEMBER')
      expect(mockApi.grantUserRole).not.toHaveBeenCalled()
    })

    it('re-grants a project role with the new value and emits user:updated', async () => {
      const wrapper = await mountResolved()
      await wrapper.vm.changeRole({ project: 'project-a', role: 'PROJECT_MEMBER' }, 'PROJECT_ADMIN')
      expect(mockApi.grantUserRole).toHaveBeenCalledWith('alice@example.org', 'project-a', 'admin')
      expect(mockApi.revokeUserRole).not.toHaveBeenCalled()
      expect(wrapper.emitted('user:updated')).toEqual([[{ uid: 'alice@example.org' }]])
      expect(mockToast.success).toHaveBeenCalledOnce()
    })

    it('shows an error toast and does not emit user:updated when the re-grant fails', async () => {
      mockApi.grantUserRole.mockRejectedValue(new Error('nope'))
      const wrapper = await mountResolved()
      await wrapper.vm.changeRole({ project: 'project-a', role: 'PROJECT_MEMBER' }, 'PROJECT_ADMIN')
      expect(wrapper.emitted('user:updated')).toBeFalsy()
      expect(mockToast.error).toHaveBeenCalledOnce()
    })
  })

  // The Scope column names the scope, not the role, so a wildcard grant reads "Instance"/"Domain"
  // rather than "Instance admin" (the Role column right next to it already says that).
  it.each([
    ['INSTANCE_ADMIN', 'settings.users.rolesModal.scope.instance'],
    ['DOMAIN_ADMIN', 'settings.users.rolesModal.scope.domain']
  ])('labels the scope of a wildcard %s grant with its scope name', (role, key) => {
    const wrapper = mountComponent({
      user: {
        uid: 'alice@example.org',
        permissions: [{ v1: role, v2: '*::*' }]
      }
    })
    expect(wrapper.findAllComponents(ProjectButton).at(0).props('project')).toMatchObject({ label: core.i18n.global.t(key) })
  })

  it('shows the role of an instance-wide row as a fixed badge instead of a role picker', () => {
    const wrapper = mountComponent({
      user: {
        uid: 'alice@example.org',
        permissions: [{ v1: 'INSTANCE_ADMIN', v2: '*::*' }]
      }
    })
    expect(wrapper.findComponent(InstanceUsersRoleBadge).props('role')).toBe('INSTANCE_ADMIN')
    // Only the add-row picker is left
    expect(wrapper.findAllComponents(ProjectUsersRoleDropdown)).toHaveLength(1)
  })

  describe('search filter', () => {
    it('filters roles by project name', async () => {
      const wrapper = await mountResolved()
      wrapper.vm.search = 'project-a'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.filteredRoles).toMatchObject([{ project: 'project-a' }])
    })

    it('is case-insensitive', async () => {
      const wrapper = await mountResolved()
      wrapper.vm.search = 'PROJECT-B'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.filteredRoles).toMatchObject([{ project: 'project-b' }])
    })

    it('matches the instance-wide row by its "Instance" label', async () => {
      const wrapper = await mountResolved({
        user: {
          uid: 'alice@example.org',
          permissions: [
            { v1: 'INSTANCE_ADMIN', v2: '*::*' },
            { v1: 'PROJECT_MEMBER', v2: 'default::project-a' }
          ]
        }
      })
      wrapper.vm.search = 'instance'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.filteredRoles).toMatchObject([{ project: '*' }])
    })

    it.each([
      ['domain', 'DOMAIN_ADMIN'],
      ['instance', 'INSTANCE_ADMIN']
    ])('matches a wildcard row by the "%s" scope label it shows, not the other one', async (query, role) => {
      const wrapper = await mountResolved({
        user: {
          uid: 'alice@example.org',
          permissions: [
            { v1: 'INSTANCE_ADMIN', v2: '*::*' },
            { v1: 'DOMAIN_ADMIN', v2: 'default::*' }
          ]
        }
      })
      wrapper.vm.search = query
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.filteredRoles.map(({ role }) => role)).toEqual([role])
    })

    it('matches a project row by the label the Scope column shows', async () => {
      mockProjects = [{ name: 'local-datashare' }, { name: 'p-42', label: 'Panama Papers' }]
      const wrapper = await mountResolved({
        user: {
          uid: 'alice@example.org',
          permissions: [
            { v1: 'PROJECT_MEMBER', v2: 'default::local-datashare' },
            { v1: 'PROJECT_MEMBER', v2: 'default::p-42' }
          ]
        }
      })
      wrapper.vm.search = 'local datashare'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.filteredRoles.map(({ project }) => project)).toEqual(['local-datashare'])
      wrapper.vm.search = 'panama'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.filteredRoles.map(({ project }) => project)).toEqual(['p-42'])
    })

    it('returns no rows and shows the no-results message when nothing matches', async () => {
      const wrapper = await mountResolved()
      wrapper.vm.search = 'no-such-project'
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.filteredRoles).toEqual([])
      expect(wrapper.text()).toContain(core.i18n.global.t('settings.users.rolesModal.noResults'))
    })

    it('keeps the search when the same user is refreshed after a grant', async () => {
      const wrapper = await mountResolved()
      wrapper.vm.search = 'project-a'
      await wrapper.setProps({ user: { ...user, permissions: [...user.permissions] } })
      expect(wrapper.vm.search).toBe('project-a')
    })

    it('clears the search when switching to a different user', async () => {
      const wrapper = await mountResolved()
      wrapper.vm.search = 'project-a'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.filteredRoles).toMatchObject([{ project: 'project-a' }])

      await wrapper.setProps({
        user: { uid: 'bob@example.org', permissions: [{ v1: 'PROJECT_ADMIN', v2: 'default::project-z' }] }
      })
      expect(wrapper.vm.search).toBe('')
      expect(wrapper.vm.filteredRoles).toMatchObject([{ project: 'project-z' }])
    })
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

    it('offers nothing at all once the user already holds instance admin, since it covers everything', () => {
      const wrapper = mountComponent({
        user: {
          uid: 'alice@example.org',
          permissions: [{ v1: 'INSTANCE_ADMIN', v2: '*::*' }]
        }
      })
      expect(wrapper.vm.projectPickerOptions).toEqual([])
      expect(wrapper.vm.scopePickerDisabledTitle).toBe(
        core.i18n.global.t('settings.users.rolesModal.scopePickerDisabledWideRole')
      )
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

    it('picking the instance entry from the project picker targets the wildcard project and resets to no role', async () => {
      const wrapper = await mountResolved()
      wrapper.vm.selectedProject = { name: '*' }
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.selectedProjectName).toBe('*')
      expect(wrapper.vm.isInstanceScope).toBe(true)
      expect(wrapper.vm.selectedRole).toBe('NO_ROLE')
      expect(wrapper.vm.canGrant).toBe(false)
    })

    it('grants an instance-wide role via grantInstanceRole, not the project-scoped endpoint', async () => {
      const wrapper = await mountResolved({ user: { uid: 'alice@example.org', permissions: [] } })
      wrapper.vm.selectedProject = { name: '*' }
      await wrapper.vm.$nextTick()
      wrapper.vm.selectedRole = 'INSTANCE_ADMIN'
      await wrapper.vm.grantRole()
      expect(mockApi.grantInstanceRole).toHaveBeenCalledWith('alice@example.org', 'instance_admin', null)
      expect(mockApi.grantUserRole).not.toHaveBeenCalled()
    })

    it('only offers instance admin as a pickable role for the instance scope, since domain admin has its own scope entry', async () => {
      const wrapper = await mountResolved()
      wrapper.vm.selectedProject = { name: '*' }
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.hiddenRoles).toContain('DOMAIN_ADMIN')
      expect(wrapper.vm.hiddenRoles).not.toContain('INSTANCE_ADMIN')
    })

    it('revokes an instance-wide role via revokeInstanceRole, not the project-scoped endpoint', async () => {
      const wrapper = await mountResolved({
        user: {
          uid: 'alice@example.org',
          permissions: [{ v1: 'INSTANCE_ADMIN', v2: '*::*' }]
        }
      })
      await wrapper.vm.revokeRole({ project: '*', role: 'INSTANCE_ADMIN', domain: '*' })
      expect(mockApi.revokeInstanceRole).toHaveBeenCalledWith('alice@example.org', 'instance_admin', null)
      expect(mockApi.revokeUserRole).not.toHaveBeenCalled()
    })
  })

  describe('domain scope', () => {
    beforeEach(() => {
      core.config.set('policies', [{ projectId: '*', domainId: '*', role: 'INSTANCE_ADMIN' }])
    })

    it('offers the domain scope for an instance admin who does not already hold it', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.canGrantDomainRole).toBe(true)
    })

    it('does not offer the domain scope again once already granted', () => {
      const wrapper = mountComponent({
        user: {
          uid: 'alice@example.org',
          permissions: [{ v1: 'DOMAIN_ADMIN', v2: 'default::*' }]
        }
      })
      expect(wrapper.vm.canGrantDomainRole).toBe(false)
    })

    it('does not offer domain scope once the user already holds instance admin, since it is strictly weaker', () => {
      const wrapper = mountComponent({
        user: {
          uid: 'alice@example.org',
          permissions: [{ v1: 'INSTANCE_ADMIN', v2: '*::*' }]
        }
      })
      expect(wrapper.vm.canGrantDomainRole).toBe(false)
    })

    it('does not offer a project grant once the user already holds domain admin', () => {
      const wrapper = mountComponent({
        user: {
          uid: 'alice@example.org',
          permissions: [{ v1: 'DOMAIN_ADMIN', v2: 'default::*' }]
        }
      })
      expect(wrapper.vm.availableProjects).toEqual([])
    })

    it('still offers the instance scope once only domain admin is granted, since they are separate grants', () => {
      const wrapper = mountComponent({
        user: {
          uid: 'alice@example.org',
          permissions: [{ v1: 'DOMAIN_ADMIN', v2: 'default::*' }]
        }
      })
      expect(wrapper.vm.canGrantInstanceRole).toBe(true)
    })

    it('does not offer the domain scope to a non instance admin', () => {
      core.config.set('policies', [{ projectId: 'project-a', domainId: 'default', role: 'PROJECT_ADMIN' }])
      const wrapper = mountComponent()
      expect(wrapper.vm.canGrantDomainRole).toBe(false)
    })

    it('lists the domain entry in the project picker, after instance', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.projectPickerOptions[1]).toEqual({ name: '**', label: 'Domain' })
    })

    it('picking the domain entry from the project picker targets a distinct synthetic scope and resets to no role', async () => {
      const wrapper = await mountResolved()
      wrapper.vm.selectedProject = { name: '**' }
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.selectedProjectName).toBe('**')
      expect(wrapper.vm.isDomainScope).toBe(true)
      expect(wrapper.vm.selectedRole).toBe('NO_ROLE')
      expect(wrapper.vm.canGrant).toBe(false)
    })

    it('only offers domain admin as a pickable role for the domain scope', async () => {
      const wrapper = await mountResolved()
      wrapper.vm.selectedProject = { name: '**' }
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.hiddenRoles).toContain('INSTANCE_ADMIN')
      expect(wrapper.vm.hiddenRoles).not.toContain('DOMAIN_ADMIN')
    })

    it('grants a domain admin role with the default domain via grantInstanceRole, not the project-scoped endpoint', async () => {
      const wrapper = await mountResolved({ user: { uid: 'alice@example.org', permissions: [] } })
      wrapper.vm.selectedProject = { name: '**' }
      await wrapper.vm.$nextTick()
      wrapper.vm.selectedRole = 'DOMAIN_ADMIN'
      await wrapper.vm.grantRole()
      expect(mockApi.grantInstanceRole).toHaveBeenCalledWith('alice@example.org', 'domain_admin', 'default')
      expect(mockApi.grantUserRole).not.toHaveBeenCalled()
    })
  })

  describe('cascade: replacing existing grants on an instance-wide grant', () => {
    beforeEach(() => {
      core.config.set('policies', [{ projectId: '*', domainId: '*', role: 'INSTANCE_ADMIN' }])
    })

    async function selectInstanceScope(wrapper) {
      wrapper.vm.selectedProject = { name: '*' }
      await wrapper.vm.$nextTick()
      wrapper.vm.selectedRole = 'INSTANCE_ADMIN'
    }

    it('shows a confirmation modal listing the existing grants instead of granting immediately', async () => {
      const wrapper = await mountResolved()
      await selectInstanceScope(wrapper)
      await wrapper.vm.grantRole()
      expect(mockApi.grantInstanceRole).not.toHaveBeenCalled()
      expect(wrapper.vm.showCascadeModal).toBe(true)
      expect(wrapper.vm.cascadeGrants).toMatchObject([
        { project: 'project-b', role: 'PROJECT_ADMIN' },
        { project: 'project-a', role: 'PROJECT_MEMBER' }
      ])
    })

    it('grants the role and revokes every existing grant on confirm', async () => {
      const wrapper = await mountResolved()
      await selectInstanceScope(wrapper)
      await wrapper.vm.grantRole()
      await wrapper.vm.onCascadeConfirm()
      expect(mockApi.grantInstanceRole).toHaveBeenCalledWith('alice@example.org', 'instance_admin', null)
      expect(mockApi.revokeUserRole).toHaveBeenCalledWith('alice@example.org', 'project-a', { ifExists: true })
      expect(mockApi.revokeUserRole).toHaveBeenCalledWith('alice@example.org', 'project-b', { ifExists: true })
      expect(wrapper.emitted('user:updated')).toBeTruthy()
    })

    it('grants nothing while waiting for confirmation', async () => {
      const wrapper = await mountResolved()
      await selectInstanceScope(wrapper)
      await wrapper.vm.grantRole()
      expect(mockApi.grantInstanceRole).not.toHaveBeenCalled()
      expect(mockApi.revokeUserRole).not.toHaveBeenCalled()
    })

    it('shows a cleanup error toast when a revoke fails, without losing the grant success toast', async () => {
      mockApi.revokeUserRole.mockRejectedValueOnce(new Error('nope'))
      const wrapper = await mountResolved()
      await selectInstanceScope(wrapper)
      await wrapper.vm.grantRole()
      await wrapper.vm.onCascadeConfirm()
      expect(mockToast.success).toHaveBeenCalledWith(
        core.i18n.global.t('settings.users.rolesModal.grantSuccess', { role: 'Instance admin', uid: 'alice@example.org' })
      )
      expect(mockToast.error).toHaveBeenCalledWith(core.i18n.global.t('settings.users.rolesModal.cascadeModal.cleanupError'))
    })

    it('skips the confirmation modal when the user has no existing grants', async () => {
      const wrapper = await mountResolved({ user: { uid: 'alice@example.org', permissions: [] } })
      await selectInstanceScope(wrapper)
      await wrapper.vm.grantRole()
      expect(mockApi.grantInstanceRole).toHaveBeenCalledWith('alice@example.org', 'instance_admin', null)
      expect(wrapper.vm.showCascadeModal).toBe(false)
    })
  })

  it('says the user does not exist instead of the roles table when notFound', () => {
    const wrapper = mountComponent({ user: { uid: 'ghost', permissions: [] }, notFound: true })
    expect(wrapper.findComponent(SettingsViewUsersNotFound).props('uid')).toBe('ghost')
    expect(wrapper.findComponent(PageTableGeneric).exists()).toBe(false)
  })

  it('lists instance, then domain, then the remaining projects A-Z by label in the scope picker', () => {
    mockProjects = [{ name: 'zeta' }, { name: 'alpha', label: 'Omega' }, { name: 'beta' }]
    const wrapper = mountComponent({ user: { uid: 'alice@example.org', permissions: [] } })
    expect(wrapper.vm.projectPickerOptions.map(({ name }) => name)).toEqual(['*', '**', 'beta', 'alpha', 'zeta'])
  })

  it('only offers the instance and domain scopes under OAuth, where a new project grant would not stick', () => {
    mockAuthMode = 'oauth2'
    core.config.set('policies', [{ projectId: '*', domainId: '*', role: 'INSTANCE_ADMIN' }])
    const wrapper = mountComponent({ user: { uid: 'alice@example.org', permissions: [] } })
    expect(wrapper.vm.projectPickerOptions.map(({ name }) => name)).toEqual(['*', '**'])
  })

  it('keeps the row role dropdown enabled under OAuth, since a level change on a granted project sticks', async () => {
    mockAuthMode = 'oauth2'
    const wrapper = await mountResolved()
    expect(wrapper.findAllComponents(ProjectUsersRoleDropdown).at(1).props('disabled')).toBe(false)
  })

  describe('the viewer\'s own grants', () => {
    const viewer = {
      uid: 'viewer@example.org',
      permissions: [
        { v1: 'INSTANCE_ADMIN', v2: '*::*' },
        { v1: 'DOMAIN_ADMIN', v2: 'default::*' },
        { v1: 'PROJECT_MEMBER', v2: 'default::project-a' }
      ]
    }

    beforeEach(() => {
      core.config.set('policies', [{ projectId: '*', domainId: '*', role: 'INSTANCE_ADMIN' }])
    })

    it('cannot revoke their own instance admin grant, so an instance admin cannot lock themselves out', async () => {
      const wrapper = await mountResolved({ user: viewer })
      expect(wrapper.vm.canRevoke({ project: '*', role: 'INSTANCE_ADMIN' })).toBe(false)
      await wrapper.vm.revokeRole({ project: '*', role: 'INSTANCE_ADMIN', domain: '*' })
      expect(mockApi.revokeInstanceRole).not.toHaveBeenCalled()
    })

    it('can revoke their own roles below instance admin', async () => {
      const wrapper = await mountResolved({ user: viewer })
      expect(wrapper.vm.canRevoke({ project: '*', role: 'DOMAIN_ADMIN' })).toBe(true)
      expect(wrapper.vm.canRevoke({ project: 'project-a', role: 'PROJECT_MEMBER' })).toBe(true)
      await wrapper.vm.revokeRole({ project: 'project-a', role: 'PROJECT_MEMBER', domain: 'default' })
      expect(mockApi.revokeUserRole).toHaveBeenCalledWith('viewer@example.org', 'project-a', { ifExists: true })
    })

    it('can change their own project role', async () => {
      const wrapper = await mountResolved({ user: viewer })
      expect(wrapper.findAllComponents(ProjectUsersRoleDropdown).at(1).props('disabled')).toBe(false)
      await wrapper.vm.changeRole({ project: 'project-a', role: 'PROJECT_MEMBER' }, 'PROJECT_ADMIN')
      expect(mockApi.grantUserRole).toHaveBeenCalledWith('viewer@example.org', 'project-a', 'admin')
    })

    it('treats an instance admin grant as the viewer\'s own until the username resolves', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.canRevoke({ project: '*', role: 'INSTANCE_ADMIN' })).toBe(false)
    })
  })

  describe('the add row', () => {
    it('is reset when switching to a different user, so a pick for one user is not granted to the next', async () => {
      const wrapper = await mountResolved()
      wrapper.vm.selectedProject = { name: 'project-c' }
      wrapper.vm.selectedRole = 'PROJECT_EDITOR'
      await wrapper.setProps({ user: { uid: 'bob@example.org', permissions: [] } })
      expect(wrapper.vm.selectedProject).toBe(null)
      expect(wrapper.vm.selectedRole).toBe('NO_ROLE')
      expect(wrapper.vm.canGrant).toBe(false)
    })

    it('is kept when the same user is refreshed after a grant', async () => {
      const wrapper = await mountResolved()
      wrapper.vm.selectedProject = { name: 'project-c' }
      await wrapper.setProps({ user: { ...user, permissions: [...user.permissions] } })
      expect(wrapper.vm.selectedProject).toEqual({ name: 'project-c' })
    })
  })

  describe('while a change is being saved', () => {
    it('keeps the rows and the add row disabled until the request settles', async () => {
      let resolveRevoke
      mockApi.revokeUserRole.mockReturnValue(new Promise(resolve => (resolveRevoke = resolve)))
      const wrapper = await mountResolved()
      const revoke = wrapper.vm.revokeRole({ project: 'project-a', role: 'PROJECT_MEMBER', domain: 'default' })
      await wrapper.vm.$nextTick()
      expect(wrapper.findComponent(ButtonRowActionDelete).attributes('disabled')).toBe('true')
      expect(wrapper.findComponent(ProjectDropdownSelector).props('disabled')).toBe(true)

      resolveRevoke()
      await revoke
      await wrapper.vm.$nextTick()
      expect(wrapper.findComponent(ButtonRowActionDelete).attributes('disabled')).toBe('false')
    })

    it('frees them right away when the change fails', async () => {
      mockApi.revokeUserRole.mockRejectedValue(new Error('nope'))
      const wrapper = await mountResolved()
      await wrapper.vm.revokeRole({ project: 'project-a', role: 'PROJECT_MEMBER', domain: 'default' })
      await wrapper.vm.$nextTick()
      expect(wrapper.findComponent(ButtonRowActionDelete).attributes('disabled')).toBe('false')
    })
  })
})
