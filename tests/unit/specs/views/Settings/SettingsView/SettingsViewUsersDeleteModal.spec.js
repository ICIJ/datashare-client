import { shallowMount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup.js'
import SettingsViewUsersDeleteModal from '@/views/Settings/SettingsView/SettingsViewUsersDeleteModal.vue'

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

  it('shows error toast and keeps modal open on failure', async () => {
    mockApi.deleteUser.mockRejectedValue(new Error('forbidden'))
    const wrapper = mountComponent()
    await wrapper.vm.confirmDeletion()
    await flushPromises()
    expect(mockToast.error).toHaveBeenCalledOnce()
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })
})
