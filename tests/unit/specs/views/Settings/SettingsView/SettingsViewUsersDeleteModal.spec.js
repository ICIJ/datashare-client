import { shallowMount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup.js'
import SettingsViewUsersDeleteModal from '@/views/Settings/SettingsView/SettingsViewUsersDeleteModal.vue'
import AppModal from '@/components/AppModal/AppModal.vue'
import SettingsViewUsersNotFound from '@/views/Settings/SettingsView/SettingsViewUsersNotFound.vue'

const mockToast = { error: vi.fn(), success: vi.fn() }
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({ toast: mockToast })
}))

const mockApi = { deleteUser: vi.fn() }
vi.mock('@/composables/useCore', () => ({
  useCore: () => ({ api: mockApi })
}))

describe('SettingsViewUsersDeleteModal.vue', () => {
  let core, global

  const user = { uid: 'alice@example.org' }

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockApi.deleteUser.mockResolvedValue(undefined)
    core.createPinia()
    global = { plugins: core.plugins }
  })

  function mountComponent(props = {}) {
    return shallowMount(SettingsViewUsersDeleteModal, {
      global,
      props: { user, modelValue: true, ...props }
    })
  }

  it('renders the user in the props', () => {
    const wrapper = mountComponent()
    expect(wrapper.props('user')).toEqual(user)
  })

  it('calls deleteUser with the user id on confirm', async () => {
    const wrapper = mountComponent()
    await wrapper.vm.confirmDeletion()
    await flushPromises()
    expect(mockApi.deleteUser).toHaveBeenCalledWith(user.uid)
  })

  it('emits user:deleted and closes modal on success', async () => {
    const wrapper = mountComponent()
    await wrapper.vm.confirmDeletion()
    await flushPromises()
    expect(wrapper.emitted('user:deleted')).toEqual([[{ uid: user.uid }]])
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('emits the deleted uid even when the user prop is cleared while the request is pending', async () => {
    let resolveDelete
    mockApi.deleteUser.mockReturnValue(new Promise(resolve => (resolveDelete = resolve)))
    const wrapper = mountComponent()
    const deletion = wrapper.vm.confirmDeletion()
    await wrapper.setProps({ user: { uid: null } })
    resolveDelete()
    await deletion
    expect(wrapper.emitted('user:deleted')).toEqual([[{ uid: user.uid }]])
  })

  it('shows error toast and keeps modal open on failure', async () => {
    mockApi.deleteUser.mockRejectedValue(new Error('forbidden'))
    const wrapper = mountComponent()
    await wrapper.vm.confirmDeletion()
    await flushPromises()
    expect(mockToast.error).toHaveBeenCalledOnce()
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('bolds the key verb of each consequence, and says tasks are kept', () => {
    const wrapper = shallowMount(SettingsViewUsersDeleteModal, {
      global: { ...global, renderStubDefaultSlot: true },
      props: { user, modelValue: true }
    })
    const verbs = wrapper.findAll('li strong').map(el => el.text())
    expect(verbs).toEqual(['remove', 'delete', 'keep'])
  })

  it('says the user does not exist instead of the consequences, and disables delete, when notFound', () => {
    const wrapper = shallowMount(SettingsViewUsersDeleteModal, {
      global: { ...global, renderStubDefaultSlot: true },
      props: { user: { uid: 'ghost' }, modelValue: true, notFound: true }
    })
    expect(wrapper.findComponent(SettingsViewUsersNotFound).props('uid')).toBe('ghost')
    expect(wrapper.find('li').exists()).toBe(false)
    expect(wrapper.findComponent(AppModal).props('okDisabled')).toBe(true)
  })
})
