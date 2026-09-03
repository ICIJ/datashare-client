import { ref } from 'vue'
import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ButtonRowActionDelete from '@/components/Button/ButtonRowAction/ButtonRowActionDelete.vue'
import ButtonRowActionEdit from '@/components/Button/ButtonRowAction/ButtonRowActionEdit.vue'
import ButtonRowActionRoles from '@/components/Button/ButtonRowAction/ButtonRowActionRoles.vue'
import InstanceUsersActions from '@/components/InstanceUsers/InstanceUsersActions.vue'
import SettingsViewUsersDeleteModal from '@/views/Settings/SettingsView/SettingsViewUsersDeleteModal.vue'
import SettingsViewUsersEditModal from '@/views/Settings/SettingsView/SettingsViewUsersEditModal.vue'
import SettingsViewUsersRolesModal from '@/views/Settings/SettingsView/SettingsViewUsersRolesModal.vue'

const mockUsername = ref('bob@example.org')
const mockIsUsernameResolved = ref(true)
const mockIsAuthWithUsersProvider = ref(true)
vi.mock('@/composables/useAuth.js', () => ({
  default: () => ({
    username: mockUsername,
    isUsernameResolved: mockIsUsernameResolved,
    isAuthWithUsersProvider: mockIsAuthWithUsersProvider
  })
}))

describe('InstanceUsersActions.vue', () => {
  let core, global

  const user = { uid: 'alice@example.org', name: 'Alice', email: 'alice@example.org' }

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    core.createPinia()
    mockUsername.value = 'bob@example.org'
    mockIsUsernameResolved.value = true
    mockIsAuthWithUsersProvider.value = true
    global = { plugins: core.plugins, renderStubDefaultSlot: true }
  })

  function mountComponent(props = {}) {
    return shallowMount(InstanceUsersActions, {
      global,
      props: { user, ...props }
    })
  }

  it('opens the edit modal when the edit action is clicked', async () => {
    const wrapper = mountComponent()
    expect(wrapper.findComponent(SettingsViewUsersEditModal).props('modelValue')).toBe(false)
    await wrapper.findComponent(ButtonRowActionEdit).vm.$emit('click')
    expect(wrapper.findComponent(SettingsViewUsersEditModal).props('modelValue')).toBe(true)
  })

  it('passes the user down to the edit modal', () => {
    const wrapper = mountComponent()
    expect(wrapper.findComponent(SettingsViewUsersEditModal).props('user')).toEqual(user)
  })

  it('forwards user:updated from the edit modal', () => {
    const wrapper = mountComponent()
    wrapper.findComponent(SettingsViewUsersEditModal).vm.$emit('user:updated', { uid: user.uid })
    expect(wrapper.emitted('user:updated')).toEqual([[{ uid: user.uid }]])
  })

  it('opens the delete modal when the delete action is clicked', async () => {
    const wrapper = mountComponent()
    expect(wrapper.findComponent(SettingsViewUsersDeleteModal).props('modelValue')).toBe(false)
    await wrapper.findComponent(ButtonRowActionDelete).vm.$emit('click')
    expect(wrapper.findComponent(SettingsViewUsersDeleteModal).props('modelValue')).toBe(true)
  })

  it('passes the user down to the delete modal', () => {
    const wrapper = mountComponent()
    expect(wrapper.findComponent(SettingsViewUsersDeleteModal).props('user')).toEqual(user)
  })

  it('forwards user:deleted from the delete modal', () => {
    const wrapper = mountComponent()
    wrapper.findComponent(SettingsViewUsersDeleteModal).vm.$emit('user:deleted', { uid: user.uid })
    expect(wrapper.emitted('user:deleted')).toEqual([[{ uid: user.uid }]])
  })

  it('disables the delete action for the currently-logged-in user', () => {
    mockUsername.value = user.uid
    const wrapper = mountComponent()
    expect(wrapper.findComponent(ButtonRowActionDelete).attributes('disabled')).toBeDefined()
  })

  it('does not disable the delete action for another user', () => {
    mockUsername.value = 'bob@example.org'
    const wrapper = mountComponent()
    expect(wrapper.findComponent(ButtonRowActionDelete).attributes('disabled')).toBe('false')
  })

  it('disables the delete action while the username has not resolved yet', () => {
    mockIsUsernameResolved.value = false
    const wrapper = mountComponent()
    expect(wrapper.findComponent(ButtonRowActionDelete).attributes('disabled')).toBeDefined()
  })

  it('hides the edit and delete actions when auth is not backed by a users provider (e.g. OAuth)', () => {
    mockIsAuthWithUsersProvider.value = false
    const wrapper = mountComponent()
    expect(wrapper.findComponent(ButtonRowActionEdit).exists()).toBe(false)
    expect(wrapper.findComponent(ButtonRowActionDelete).exists()).toBe(false)
    expect(wrapper.findComponent(SettingsViewUsersEditModal).exists()).toBe(false)
    expect(wrapper.findComponent(SettingsViewUsersDeleteModal).exists()).toBe(false)
  })

  it('still shows the manage-roles action when auth is not backed by a users provider (e.g. OAuth)', () => {
    mockIsAuthWithUsersProvider.value = false
    const wrapper = mountComponent()
    expect(wrapper.findComponent(ButtonRowActionRoles).exists()).toBe(true)
  })

  it('opens the roles modal when the manage-roles action is clicked', async () => {
    const wrapper = mountComponent()
    expect(wrapper.findComponent(SettingsViewUsersRolesModal).props('modelValue')).toBe(false)
    await wrapper.findComponent(ButtonRowActionRoles).vm.$emit('click')
    expect(wrapper.findComponent(SettingsViewUsersRolesModal).props('modelValue')).toBe(true)
  })

  it('passes the user down to the roles modal', () => {
    const wrapper = mountComponent()
    expect(wrapper.findComponent(SettingsViewUsersRolesModal).props('user')).toEqual(user)
  })

  it('forwards user:updated from the roles modal', () => {
    const wrapper = mountComponent()
    wrapper.findComponent(SettingsViewUsersRolesModal).vm.$emit('user:updated', { uid: user.uid })
    expect(wrapper.emitted('user:updated')).toEqual([[{ uid: user.uid }]])
  })
})
