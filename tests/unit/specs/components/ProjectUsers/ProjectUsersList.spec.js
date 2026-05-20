import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectUsersList from '@/components/ProjectUsers/ProjectUsersList.vue'
import ProjectUsersActions from '@/components/ProjectUsers/ProjectUsersActions.vue'
import ProjectUsersRoleSelect from '@/components/ProjectUsers/ProjectUsersRoleSelect.vue'
import EmptyState from '@/components/EmptyState/EmptyState.vue'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch.vue'

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
    { name: 'Alice Martin', role: 'INSTANCE_ADMIN' },
    { name: 'Bob Chen', role: 'DOMAIN_ADMIN' }
  ]

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    core.createPinia()
    global = { plugins: core.plugins, renderStubDefaultSlot: true }
  })

  it('shows EmptyState when users is empty', () => {
    const wrapper = shallowMount(ProjectUsersList, { global, props: { users: [], projectName } })
    expect(wrapper.findComponent(EmptyState).exists()).toBe(true)
  })

  it('does not show EmptyState when users are present', () => {
    const wrapper = shallowMount(ProjectUsersList, { global, props: { users, projectName } })
    expect(wrapper.findComponent(EmptyState).exists()).toBe(false)
  })

  it('renders a row for each user', () => {
    const wrapper = shallowMount(ProjectUsersList, { global, props: { users, projectName } })
    expect(wrapper.findAll('tr')).toHaveLength(users.length)
  })

  it('renders a FormControlSearch input', () => {
    const wrapper = shallowMount(ProjectUsersList, { global, props: { users, projectName } })
    expect(wrapper.findComponent(FormControlSearch).exists()).toBe(true)
  })

  it('filters rows by name (case-insensitive substring)', async () => {
    const wrapper = shallowMount(ProjectUsersList, { global, props: { users, projectName } })
    await wrapper.findComponent(FormControlSearch).setValue('alice')
    expect(wrapper.findAll('tr')).toHaveLength(1)
  })

  it('shows EmptyState with noResults label when query matches nothing', async () => {
    const wrapper = shallowMount(ProjectUsersList, { global, props: { users, projectName } })
    await wrapper.findComponent(FormControlSearch).setValue('zzz')
    expect(wrapper.findComponent(EmptyState).exists()).toBe(true)
    expect(wrapper.findComponent(EmptyState).props('label')).toContain('match')
  })

  it('shows FormControlSearch even when users list is empty', () => {
    const wrapper = shallowMount(ProjectUsersList, { global, props: { users: [], projectName } })
    expect(wrapper.findComponent(FormControlSearch).exists()).toBe(true)
  })

  it('renders a ProjectUsersRoleSelect in each role cell', () => {
    const wrapper = shallowMount(ProjectUsersList, { global, props: { users, projectName } })
    expect(wrapper.findAllComponents(ProjectUsersRoleSelect)).toHaveLength(users.length)
  })

  it('updates localUsers when role:saved is emitted', async () => {
    const wrapper = shallowMount(ProjectUsersList, { global, props: { users, projectName } })
    const roleSelects = wrapper.findAllComponents(ProjectUsersRoleSelect)
    await roleSelects[0].trigger('role:saved', { name: 'Alice Martin', role: 'PROJECT_MEMBER' })
    // After update, the first role select should receive the updated user
    expect(roleSelects[0].props('user').role).toBe('PROJECT_MEMBER')
  })

  it('renders a ProjectUsersActions in each row', () => {
    const wrapper = shallowMount(ProjectUsersList, { global, props: { users, projectName } })
    expect(wrapper.findAllComponents(ProjectUsersActions)).toHaveLength(users.length)
  })

  it('removes a user from the list when user:deleted is emitted', async () => {
    const wrapper = shallowMount(ProjectUsersList, { global, props: { users, projectName } })
    const actions = wrapper.findAllComponents(ProjectUsersActions)
    await actions[0].trigger('user:deleted', { name: 'Alice Martin' })
    expect(wrapper.findAll('tr')).toHaveLength(1)
  })
})
