import { shallowMount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectUsersList from '@/components/ProjectUsers/ProjectUsersList.vue'
import ProjectUsersActions from '@/components/ProjectUsers/ProjectUsersActions.vue'
import ProjectUsersAdminPromotionModal from '@/components/ProjectUsers/ProjectUsersAdminPromotionModal.vue'
import ProjectUsersRoleDropdown from '@/components/ProjectUsers/ProjectUsersRoleDropdown.vue'
import { apiInstance as api } from '@/api/apiInstance.js'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: { grantUserRole: vi.fn(), revokeUserRole: vi.fn() }
}))

const mockToast = { success: vi.fn(), error: vi.fn() }
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({ toast: mockToast })
}))

describe('ProjectUsersList.vue', () => {
  let core, global

  const project = 'local-datashare'

  function makeUsers() {
    return [
      { uid: 'alice@icij.org', role: 'PROJECT_EDITOR' },
      { uid: 'bob@icij.org', role: 'DOMAIN_ADMIN' }
    ]
  }

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    core.createPinia()
    global = { plugins: core.plugins, renderStubDefaultSlot: true, stubs: { PageTableGeneric: false } }
  })

  function mountComponent(props = {}) {
    return shallowMount(ProjectUsersList, {
      global,
      props: { users: makeUsers(), project, ...props }
    })
  }

  it('shows the empty label when there are no users and no search query', () => {
    const wrapper = mountComponent({ users: [], query: '' })
    expect(wrapper.text()).toContain(core.i18n.global.t('projectViewEdit.users.empty'))
  })

  it('shows the no-results label when there are no users and a search query is set', () => {
    const wrapper = mountComponent({ users: [], query: 'zzz' })
    expect(wrapper.text()).toContain(core.i18n.global.t('projectViewEdit.users.noResults'))
  })

  it('does not show an empty label when users are present', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).not.toContain(core.i18n.global.t('projectViewEdit.users.empty'))
  })

  it('renders a ProjectUsersRoleDropdown in each role cell', () => {
    const wrapper = mountComponent()
    expect(wrapper.findAllComponents(ProjectUsersRoleDropdown)).toHaveLength(2)
  })

  it('disables the domain admin and instance admin options in each role dropdown', () => {
    const wrapper = mountComponent()
    for (const dropdown of wrapper.findAllComponents(ProjectUsersRoleDropdown)) {
      expect(dropdown.props('disabledRoles')).toEqual(['DOMAIN_ADMIN', 'INSTANCE_ADMIN'])
    }
  })

  it('renders a ProjectUsersActions in each row', () => {
    const wrapper = mountComponent()
    expect(wrapper.findAllComponents(ProjectUsersActions)).toHaveLength(2)
  })

  it('forwards user:deleted from ProjectUsersActions', async () => {
    const wrapper = mountComponent()
    await wrapper.findAllComponents(ProjectUsersActions)[0].trigger('user:deleted', { uid: 'alice@icij.org' })
    expect(wrapper.emitted('user:deleted')).toEqual([[{ uid: 'alice@icij.org' }]])
  })

  describe('Delete action visibility (hide-delete)', () => {
    it('shows the delete action for an instance admin using a users-provider auth', () => {
      core.config.set('auth', 'form')
      core.config.set('policies', [{ projectId: '*', domainId: '*', role: 'INSTANCE_ADMIN' }])
      const wrapper = mountComponent()
      expect(wrapper.findAllComponents(ProjectUsersActions)[0].props('hideDelete')).toBe(false)
    })

    it('hides the delete action from a project admin who is not an instance admin', () => {
      core.config.set('auth', 'form')
      core.config.set('policies', [{ projectId: project, domainId: 'default', role: 'PROJECT_ADMIN' }])
      const wrapper = mountComponent()
      expect(wrapper.findAllComponents(ProjectUsersActions)[0].props('hideDelete')).toBe(true)
    })

    it('hides the delete action when auth is not a users-provider even for an instance admin', () => {
      core.config.set('auth', 'oauth')
      core.config.set('policies', [{ projectId: '*', domainId: '*', role: 'INSTANCE_ADMIN' }])
      const wrapper = mountComponent()
      expect(wrapper.findAllComponents(ProjectUsersActions)[0].props('hideDelete')).toBe(true)
    })
  })

  it('renders ProjectUsersAdminPromotionModal', () => {
    const wrapper = mountComponent()
    expect(wrapper.findComponent(ProjectUsersAdminPromotionModal).exists()).toBe(true)
  })

  describe('Controlled role select props', () => {
    it('passes user.role as modelValue when no pending change', () => {
      const wrapper = mountComponent()
      expect(wrapper.findAllComponents(ProjectUsersRoleDropdown)[0].props('modelValue')).toBe(
        wrapper.props('users')[0].role
      )
    })

    it('passes dirty=false when no pending change', () => {
      const wrapper = mountComponent()
      expect(wrapper.findAllComponents(ProjectUsersRoleDropdown)[0].props('dirty')).toBe(false)
    })

    it('updates pendingChanges when update:modelValue is emitted by a role select', async () => {
      const wrapper = mountComponent()
      const { uid } = wrapper.props('users')[0]
      await wrapper.findAllComponents(ProjectUsersRoleDropdown)[0].vm.$emit('update:modelValue', 'PROJECT_MEMBER')
      expect(wrapper.vm.pendingChanges[uid]).toBe('PROJECT_MEMBER')
    })

    it('passes dirty=true and updated modelValue after a role change', async () => {
      const wrapper = mountComponent()
      const roleSelect = wrapper.findAllComponents(ProjectUsersRoleDropdown)[0]
      await roleSelect.vm.$emit('update:modelValue', 'PROJECT_MEMBER')
      await wrapper.vm.$nextTick()
      expect(roleSelect.props('dirty')).toBe(true)
      expect(roleSelect.props('modelValue')).toBe('PROJECT_MEMBER')
    })

    it('removes entry from pendingChanges when role reverts to original', async () => {
      const wrapper = mountComponent()
      const { uid, role } = wrapper.props('users')[0]
      const roleSelect = wrapper.findAllComponents(ProjectUsersRoleDropdown)[0]
      await roleSelect.vm.$emit('update:modelValue', 'PROJECT_MEMBER')
      await roleSelect.vm.$emit('update:modelValue', role)
      expect(wrapper.vm.pendingChanges[uid]).toBeUndefined()
    })
  })

  describe('Sticky bar', () => {
    it('hides sticky bar when no pending changes', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.project-users-list__sticky-bar').exists()).toBe(false)
    })

    it('shows sticky bar when there are pending changes', async () => {
      const wrapper = mountComponent()
      await wrapper.findAllComponents(ProjectUsersRoleDropdown)[0].vm.$emit('update:modelValue', 'PROJECT_MEMBER')
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.project-users-list__sticky-bar').exists()).toBe(true)
    })
  })
  describe('Save users', () => {
    it('saveRoles calls grantUserRole for each pending change', async () => {
      api.grantUserRole.mockResolvedValue(undefined)
      const wrapper = mountComponent()
      const { uid } = wrapper.props('users')[0]
      await wrapper.findAllComponents(ProjectUsersRoleDropdown)[0].vm.$emit('update:modelValue', 'PROJECT_MEMBER')
      await wrapper.vm.saveRoles()
      await flushPromises()
      expect(api.grantUserRole).toHaveBeenCalledWith(uid, project, 'member')
    })

    it('clears pendingChanges on success without mutating the users prop', async () => {
      api.grantUserRole.mockResolvedValue(undefined)
      const wrapper = mountComponent()
      const originalRole = wrapper.props('users')[0].role
      await wrapper.findAllComponents(ProjectUsersRoleDropdown)[0].vm.$emit('update:modelValue', 'PROJECT_MEMBER')
      await wrapper.vm.saveRoles()
      await flushPromises()
      expect(wrapper.vm.pendingChanges).toEqual({})
      expect(wrapper.props('users')[0].role).toBe(originalRole)
    })

    it('emits roles:saved when a grant succeeds, so the parent can refetch', async () => {
      api.grantUserRole.mockResolvedValue(undefined)
      const wrapper = mountComponent()
      await wrapper.findAllComponents(ProjectUsersRoleDropdown)[0].vm.$emit('update:modelValue', 'PROJECT_MEMBER')
      await wrapper.vm.saveRoles()
      await flushPromises()
      expect(wrapper.emitted('roles:saved')).toHaveLength(1)
    })

    it('saveRoles shows success toast on success', async () => {
      api.grantUserRole.mockResolvedValue(undefined)
      const wrapper = mountComponent()
      await wrapper.findAllComponents(ProjectUsersRoleDropdown)[0].vm.$emit('update:modelValue', 'PROJECT_MEMBER')
      await wrapper.vm.saveRoles()
      await flushPromises()
      expect(mockToast.success).toHaveBeenCalledOnce()
    })

    it('keeps the failed change in pendingChanges and shows error toast on API failure', async () => {
      api.grantUserRole.mockRejectedValue(new Error('forbidden'))
      const wrapper = mountComponent()
      const { uid } = wrapper.props('users')[0]
      await wrapper.findAllComponents(ProjectUsersRoleDropdown)[0].vm.$emit('update:modelValue', 'PROJECT_MEMBER')
      await wrapper.vm.saveRoles()
      await flushPromises()
      expect(wrapper.vm.pendingChanges).toEqual({ [uid]: 'PROJECT_MEMBER' })
      expect(mockToast.error).toHaveBeenCalledOnce()
    })

    it('does not emit roles:saved when all grants fail', async () => {
      api.grantUserRole.mockRejectedValue(new Error('forbidden'))
      const wrapper = mountComponent()
      await wrapper.findAllComponents(ProjectUsersRoleDropdown)[0].vm.$emit('update:modelValue', 'PROJECT_MEMBER')
      await wrapper.vm.saveRoles()
      await flushPromises()
      expect(wrapper.emitted('roles:saved')).toBeUndefined()
    })

    it('on a partial failure, clears only the succeeded change, keeps the failed one pending, and still emits roles:saved', async () => {
      api.grantUserRole.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('forbidden'))
      const wrapper = mountComponent()
      const [userA, userB] = wrapper.props('users')
      await wrapper.findAllComponents(ProjectUsersRoleDropdown)[0].vm.$emit('update:modelValue', 'PROJECT_MEMBER')
      await wrapper.findAllComponents(ProjectUsersRoleDropdown)[1].vm.$emit('update:modelValue', 'PROJECT_MEMBER')
      await wrapper.vm.saveRoles()
      await flushPromises()
      expect(wrapper.vm.pendingChanges).toEqual({ [userB.uid]: 'PROJECT_MEMBER' })
      expect(userA.role).not.toBe('PROJECT_MEMBER')
      expect(mockToast.error).toHaveBeenCalledOnce()
      expect(mockToast.success).not.toHaveBeenCalled()
      expect(wrapper.emitted('roles:saved')).toHaveLength(1)
    })

    it('saveRoles calls revokeUserRole (not grantUserRole) when the pending change is NO_ROLE', async () => {
      api.revokeUserRole.mockResolvedValue(undefined)
      const wrapper = mountComponent()
      const { uid } = wrapper.props('users')[0]
      await wrapper.findAllComponents(ProjectUsersRoleDropdown)[0].vm.$emit('update:modelValue', 'NO_ROLE')
      await wrapper.vm.saveRoles()
      await flushPromises()
      expect(api.revokeUserRole).toHaveBeenCalledWith(uid, project, { ifExists: true })
      expect(api.grantUserRole).not.toHaveBeenCalled()
    })

    it('saveRoles emits a single roles:revoked with the revoked uid on success', async () => {
      api.revokeUserRole.mockResolvedValue(undefined)
      const wrapper = mountComponent()
      const { uid } = wrapper.props('users')[0]
      await wrapper.findAllComponents(ProjectUsersRoleDropdown)[0].vm.$emit('update:modelValue', 'NO_ROLE')
      await wrapper.vm.saveRoles()
      await flushPromises()
      expect(wrapper.emitted('roles:revoked')).toEqual([[[uid]]])
    })

    it('saveRoles handles a mix of a role change and a revocation', async () => {
      api.grantUserRole.mockResolvedValue(undefined)
      api.revokeUserRole.mockResolvedValue(undefined)
      const wrapper = mountComponent()
      const [userA, userB] = wrapper.props('users')
      await wrapper.findAllComponents(ProjectUsersRoleDropdown)[0].vm.$emit('update:modelValue', 'PROJECT_MEMBER')
      await wrapper.findAllComponents(ProjectUsersRoleDropdown)[1].vm.$emit('update:modelValue', 'NO_ROLE')
      await wrapper.vm.saveRoles()
      await flushPromises()
      expect(api.grantUserRole).toHaveBeenCalledWith(userA.uid, project, 'member')
      expect(api.revokeUserRole).toHaveBeenCalledWith(userB.uid, project, { ifExists: true })
      expect(wrapper.emitted('roles:revoked')).toEqual([[[userB.uid]]])
    })

    it('saveRoles emits a single roles:revoked event listing all revoked uids when multiple roles are revoked', async () => {
      api.revokeUserRole.mockResolvedValue(undefined)
      const wrapper = mountComponent()
      const [userA, userB] = wrapper.props('users')
      await wrapper.findAllComponents(ProjectUsersRoleDropdown)[0].vm.$emit('update:modelValue', 'NO_ROLE')
      await wrapper.findAllComponents(ProjectUsersRoleDropdown)[1].vm.$emit('update:modelValue', 'NO_ROLE')
      await wrapper.vm.saveRoles()
      await flushPromises()
      expect(wrapper.emitted('roles:revoked')).toEqual([[[userA.uid, userB.uid]]])
      expect(wrapper.emitted('roles:saved')).toBeUndefined()
    })
  })

  describe('Cancel', () => {
    it('cancelChanges clears all pending changes', async () => {
      const wrapper = mountComponent()
      await wrapper.findAllComponents(ProjectUsersRoleDropdown)[0].vm.$emit('update:modelValue', 'member')
      wrapper.vm.cancelChanges()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.pendingChanges).toEqual({})
    })
  })

  describe('Username resolution race condition', () => {
    it('disables the role dropdown and delete action for every row until the username resolves', async () => {
      const wrapper = mountComponent()
      expect(wrapper.findAllComponents(ProjectUsersRoleDropdown)[0].props('disabled')).toBe(true)
      expect(wrapper.findAllComponents(ProjectUsersActions)[0].props('disableDelete')).toBe(true)
      await flushPromises()
      expect(wrapper.findAllComponents(ProjectUsersRoleDropdown)[0].props('disabled')).toBe(false)
      expect(wrapper.findAllComponents(ProjectUsersActions)[0].props('disableDelete')).toBe(false)
    })
  })

  describe('Locking the dropdown for rows that outrank the viewer', () => {
    it('disables the whole dropdown for a row whose current role outranks what a project admin viewer may assign', async () => {
      core.config.set('auth', 'form')
      core.config.set('policies', [{ projectId: project, domainId: 'default', role: 'PROJECT_ADMIN' }])
      const wrapper = mountComponent({
        users: [
          { uid: 'alice@example.org', role: 'PROJECT_EDITOR' },
          { uid: 'bob@example.org', role: 'DOMAIN_ADMIN' },
          { uid: 'carole@example.org', role: 'INSTANCE_ADMIN' }
        ]
      })
      await flushPromises()
      const dropdowns = wrapper.findAllComponents(ProjectUsersRoleDropdown)
      expect(dropdowns[0].props('disabled')).toBe(false)
      expect(dropdowns[1].props('disabled')).toBe(true)
      expect(dropdowns[2].props('disabled')).toBe(true)
    })

    it('does not disable the dropdown for a row whose current role is within the viewer own hierarchy', async () => {
      core.config.set('auth', 'form')
      core.config.set('policies', [{ projectId: '*', domainId: '*', role: 'INSTANCE_ADMIN' }])
      const wrapper = mountComponent({
        users: [{ uid: 'bob@example.org', role: 'DOMAIN_ADMIN' }]
      })
      await flushPromises()
      expect(wrapper.findAllComponents(ProjectUsersRoleDropdown)[0].props('disabled')).toBe(false)
    })
  })

  describe('Admin promotion modal', () => {
    it('onSaveClicked opens admin modal when a pending change promotes to an admin role', async () => {
      // users[0] is PROJECT_EDITOR; promoting to PROJECT_ADMIN triggers the modal
      const wrapper = mountComponent()
      await wrapper.findAllComponents(ProjectUsersRoleDropdown)[0].vm.$emit('update:modelValue', 'PROJECT_ADMIN')
      wrapper.vm.onSaveClicked()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.showAdminModal).toBe(true)
    })

    it('onSaveClicked saves directly when pending changes contain no admin promotions', async () => {
      api.grantUserRole.mockResolvedValue(undefined)
      // users[1] is DOMAIN_ADMIN; changing to PROJECT_MEMBER is a demotion — no modal
      const wrapper = mountComponent()
      await wrapper.findAllComponents(ProjectUsersRoleDropdown)[1].vm.$emit('update:modelValue', 'PROJECT_MEMBER')
      wrapper.vm.onSaveClicked()
      await flushPromises()
      expect(api.grantUserRole).toHaveBeenCalled()
      expect(wrapper.vm.showAdminModal).toBe(false)
    })

    it('onSaveClicked opens admin modal when promoting a NO_ROLE (role-less) user straight to admin', async () => {
      const wrapper = mountComponent({ users: [{ uid: 'noone@example.org', role: 'NO_ROLE' }] })
      await wrapper.findAllComponents(ProjectUsersRoleDropdown)[0].vm.$emit('update:modelValue', 'PROJECT_ADMIN')
      wrapper.vm.onSaveClicked()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.showAdminModal).toBe(true)
    })
  })
})
