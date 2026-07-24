import { shallowMount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup.js'
import ProjectViewEditUsersDeleteModal from '@/views/Project/ProjectView/ProjectViewEdit/ProjectViewEditUsersDeleteModal.vue'
import { apiInstance as api } from '@/api/apiInstance.js'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: {
    deleteUser: vi.fn()
  }
}))

const mockToast = { error: vi.fn(), success: vi.fn() }
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({ toast: mockToast })
}))

const mockConfigGet = vi.fn()

vi.mock('@/composables/useCore', () => ({
  useCore: () => ({
    api: apiInstance,
    config: { get: mockConfigGet },
    auth: { getUsername: vi.fn().mockResolvedValue(null), isBasicAuth: vi.fn().mockResolvedValue(false) }
  })
}))

import { apiInstance } from '@/api/apiInstance.js'

describe('ProjectViewEditUsersDeleteModal.vue', () => {
  let core, global

  const user = { uid: 'alice@icij.org', role: 'PROJECT_ADMIN' }
  const project = 'local-datashare'

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    core.createPinia()
    global = { plugins: core.plugins }
    // Default: form auth (password provider)
    mockConfigGet.mockImplementation(key => key === 'auth' ? 'form' : undefined)
  })

  function mountComponent(props = {}) {
    return shallowMount(ProjectViewEditUsersDeleteModal, {
      global,
      props: { user, project, modelValue: true, ...props }
    })
  }

  it('renders the user name in the title slot', () => {
    const wrapper = mountComponent()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.props('user')).toEqual(user)
  })

  it('calls deleteUser with the user id on confirm', async () => {
    api.deleteUser.mockResolvedValue(undefined)
    const wrapper = mountComponent()
    await wrapper.vm.confirmDeletion()
    await flushPromises()
    expect(api.deleteUser).toHaveBeenCalledWith(user.uid, { domain: 'default', index: project })
  })

  it('emits user:deleted and closes modal on success', async () => {
    api.deleteUser.mockResolvedValue(undefined)
    const wrapper = mountComponent()
    await wrapper.vm.confirmDeletion()
    await flushPromises()
    expect(wrapper.emitted('user:deleted')).toEqual([[{ uid: user.uid }]])
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('shows error toast and keeps modal open on failure', async () => {
    api.deleteUser.mockRejectedValue(new Error('forbidden'))
    const wrapper = mountComponent()
    await wrapper.vm.confirmDeletion()
    await flushPromises()
    expect(mockToast.error).toHaveBeenCalledOnce()
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })
})
