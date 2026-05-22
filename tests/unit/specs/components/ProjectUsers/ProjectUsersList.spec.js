import { shallowMount, flushPromises } from '@vue/test-utils'
import { ButtonIcon } from '@icij/murmur-next'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectUsersList from '@/components/ProjectUsers/ProjectUsersList.vue'
import ProjectUsersActions from '@/components/ProjectUsers/ProjectUsersActions.vue'
import ProjectUsersAdminPromotionModal from '@/components/ProjectUsers/ProjectUsersAdminPromotionModal.vue'
import ProjectUsersCreateModal from '@/components/ProjectUsers/ProjectUsersCreateModal.vue'
import ProjectUsersRoleSelect from '@/components/ProjectUsers/ProjectUsersRoleSelect.vue'
import EmptyState from '@/components/EmptyState/EmptyState.vue'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch.vue'
import { apiInstance as api } from '@/api/apiInstance.js'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: { saveProjectPolicy: vi.fn() }
}))

const mockToast = { success: vi.fn(), error: vi.fn() }
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({ toast: mockToast })
}))

vi.mock('@/composables/usePolicies', () => ({
  usePolicies: vi.fn(() => ({
    getRoleByProject: vi.fn().mockReturnValue('INSTANCE_ADMIN'),
    formatRole: (_t, role) => role
  }))
}))

describe('ProjectUsersList.vue', () => {
  let core, global

  const projectName = 'local-datashare'
  const users = [
    { name: 'Alice Martin', role: 'PROJECT_EDITOR' },
    { name: 'Bob Chen', role: 'DOMAIN_ADMIN' }
  ]

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    core.createPinia()
    global = { plugins: core.plugins, renderStubDefaultSlot: true }
  })

  function mountComponent(props = {}) {
    return shallowMount(ProjectUsersList, {
      global,
      props: { users, projectName, ...props }
    })
  }

  // ── Existing list behaviour ───────────────────────────────────────────────

  it('shows EmptyState when users is empty', () => {
    const wrapper = mountComponent({ users: [] })
    expect(wrapper.findComponent(EmptyState).exists()).toBe(true)
  })

  it('does not show EmptyState when users are present', () => {
    const wrapper = mountComponent()
    expect(wrapper.findComponent(EmptyState).exists()).toBe(false)
  })

  it('renders a row for each user', () => {
    const wrapper = mountComponent()
    expect(wrapper.findAll('tr')).toHaveLength(users.length)
  })

  it('renders a FormControlSearch input', () => {
    const wrapper = mountComponent()
    expect(wrapper.findComponent(FormControlSearch).exists()).toBe(true)
  })

  it('filters rows by name (case-insensitive substring)', async () => {
    const wrapper = mountComponent()
    await wrapper.findComponent(FormControlSearch).setValue('alice')
    expect(wrapper.findAll('tr')).toHaveLength(1)
  })

  it('shows EmptyState with noResults label when query matches nothing', async () => {
    const wrapper = mountComponent()
    await wrapper.findComponent(FormControlSearch).setValue('zzz')
    expect(wrapper.findComponent(EmptyState).exists()).toBe(true)
    expect(wrapper.findComponent(EmptyState).props('label')).toContain('match')
  })

  it('shows FormControlSearch even when users list is empty', () => {
    const wrapper = mountComponent({ users: [] })
    expect(wrapper.findComponent(FormControlSearch).exists()).toBe(true)
  })

  it('renders a ProjectUsersRoleSelect in each role cell', () => {
    const wrapper = mountComponent()
    expect(wrapper.findAllComponents(ProjectUsersRoleSelect)).toHaveLength(users.length)
  })

  it('renders a ProjectUsersActions in each row', () => {
    const wrapper = mountComponent()
    expect(wrapper.findAllComponents(ProjectUsersActions)).toHaveLength(users.length)
  })

  it('removes a user from the list when user:deleted is emitted', async () => {
    const wrapper = mountComponent()
    await wrapper.findAllComponents(ProjectUsersActions)[0].trigger('user:deleted', { name: 'Alice Martin' })
    expect(wrapper.findAll('tr')).toHaveLength(1)
  })

  it('renders a create user ButtonIcon', () => {
    const wrapper = mountComponent()
    expect(wrapper.findComponent(ButtonIcon).exists()).toBe(true)
  })

  it('adds a new user to the list when user:created is emitted', async () => {
    const wrapper = mountComponent()
    await wrapper.findComponent(ProjectUsersCreateModal).trigger('user:created', { name: 'Charlie', role: 'PROJECT_MEMBER' })
    expect(wrapper.findAll('tr')).toHaveLength(users.length + 1)
  })

  // ── Controlled role select props ──────────────────────────────────────────

  it('passes user.role as modelValue when no pending change', () => {
    const wrapper = mountComponent()
    expect(wrapper.findAllComponents(ProjectUsersRoleSelect)[0].props('modelValue')).toBe(users[0].role)
  })

  it('passes dirty=false when no pending change', () => {
    const wrapper = mountComponent()
    expect(wrapper.findAllComponents(ProjectUsersRoleSelect)[0].props('dirty')).toBe(false)
  })

  it('updates pendingChanges when update:modelValue is emitted by a role select', async () => {
    const wrapper = mountComponent()
    await wrapper.findAllComponents(ProjectUsersRoleSelect)[0].vm.$emit('update:modelValue', 'PROJECT_MEMBER')
    expect(wrapper.vm.pendingChanges[users[0].name]).toBe('PROJECT_MEMBER')
  })

  it('passes dirty=true and updated modelValue after a role change', async () => {
    const wrapper = mountComponent()
    const roleSelect = wrapper.findAllComponents(ProjectUsersRoleSelect)[0]
    await roleSelect.vm.$emit('update:modelValue', 'PROJECT_MEMBER')
    await wrapper.vm.$nextTick()
    expect(roleSelect.props('dirty')).toBe(true)
    expect(roleSelect.props('modelValue')).toBe('PROJECT_MEMBER')
  })

  it('removes entry from pendingChanges when role reverts to original', async () => {
    const wrapper = mountComponent()
    const roleSelect = wrapper.findAllComponents(ProjectUsersRoleSelect)[0]
    await roleSelect.vm.$emit('update:modelValue', 'PROJECT_MEMBER')
    await roleSelect.vm.$emit('update:modelValue', users[0].role)
    expect(wrapper.vm.pendingChanges[users[0].name]).toBeUndefined()
  })

  // ── Sticky bar ────────────────────────────────────────────────────────────

  it('hides sticky bar when no pending changes', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.project-users-list__sticky-bar').exists()).toBe(false)
  })

  it('shows sticky bar when there are pending changes', async () => {
    const wrapper = mountComponent()
    await wrapper.findAllComponents(ProjectUsersRoleSelect)[0].vm.$emit('update:modelValue', 'PROJECT_MEMBER')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.project-users-list__sticky-bar').exists()).toBe(true)
  })

  // ── Save ──────────────────────────────────────────────────────────────────

  it('saveRoles calls saveProjectPolicy for each pending change', async () => {
    api.saveProjectPolicy.mockResolvedValue(undefined)
    const wrapper = mountComponent()
    await wrapper.findAllComponents(ProjectUsersRoleSelect)[0].vm.$emit('update:modelValue', 'PROJECT_MEMBER')
    await wrapper.vm.saveRoles()
    await flushPromises()
    expect(api.saveProjectPolicy).toHaveBeenCalledWith('default', projectName, {
      user: users[0].name,
      role: 'PROJECT_MEMBER'
    })
  })

  it('saveRoles updates localUsers and clears pendingChanges on success', async () => {
    api.saveProjectPolicy.mockResolvedValue(undefined)
    const wrapper = mountComponent()
    await wrapper.findAllComponents(ProjectUsersRoleSelect)[0].vm.$emit('update:modelValue', 'PROJECT_MEMBER')
    await wrapper.vm.saveRoles()
    await flushPromises()
    expect(wrapper.vm.pendingChanges).toEqual({})
    expect(wrapper.vm.localUsers[0].role).toBe('PROJECT_MEMBER')
  })

  it('saveRoles shows success toast on success', async () => {
    api.saveProjectPolicy.mockResolvedValue(undefined)
    const wrapper = mountComponent()
    await wrapper.findAllComponents(ProjectUsersRoleSelect)[0].vm.$emit('update:modelValue', 'PROJECT_MEMBER')
    await wrapper.vm.saveRoles()
    await flushPromises()
    expect(mockToast.success).toHaveBeenCalledOnce()
  })

  it('saveRoles clears pendingChanges and shows error toast on API failure', async () => {
    api.saveProjectPolicy.mockRejectedValue(new Error('forbidden'))
    const wrapper = mountComponent()
    await wrapper.findAllComponents(ProjectUsersRoleSelect)[0].vm.$emit('update:modelValue', 'PROJECT_MEMBER')
    await wrapper.vm.saveRoles()
    await flushPromises()
    expect(wrapper.vm.pendingChanges).toEqual({})
    expect(mockToast.error).toHaveBeenCalledOnce()
  })

  // ── Cancel ────────────────────────────────────────────────────────────────

  it('cancelChanges clears all pending changes', async () => {
    const wrapper = mountComponent()
    await wrapper.findAllComponents(ProjectUsersRoleSelect)[0].vm.$emit('update:modelValue', 'PROJECT_MEMBER')
    wrapper.vm.cancelChanges()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.pendingChanges).toEqual({})
  })

  // ── Admin promotion modal ─────────────────────────────────────────────────

  it('onSaveClicked opens admin modal when a pending change promotes to an admin role', async () => {
    // users[0] is PROJECT_EDITOR; promoting to PROJECT_ADMIN triggers the modal
    const wrapper = mountComponent()
    await wrapper.findAllComponents(ProjectUsersRoleSelect)[0].vm.$emit('update:modelValue', 'PROJECT_ADMIN')
    wrapper.vm.onSaveClicked()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.showAdminModal).toBe(true)
  })

  it('onSaveClicked saves directly when pending changes contain no admin promotions', async () => {
    api.saveProjectPolicy.mockResolvedValue(undefined)
    // users[1] is DOMAIN_ADMIN; changing to PROJECT_MEMBER is a demotion — no modal
    const wrapper = mountComponent()
    await wrapper.findAllComponents(ProjectUsersRoleSelect)[1].vm.$emit('update:modelValue', 'PROJECT_MEMBER')
    wrapper.vm.onSaveClicked()
    await flushPromises()
    expect(api.saveProjectPolicy).toHaveBeenCalled()
    expect(wrapper.vm.showAdminModal).toBe(false)
  })

  it('renders ProjectUsersAdminPromotionModal', () => {
    const wrapper = mountComponent()
    expect(wrapper.findComponent(ProjectUsersAdminPromotionModal).exists()).toBe(true)
  })
})
