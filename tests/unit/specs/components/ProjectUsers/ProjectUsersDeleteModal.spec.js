import { shallowMount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectUsersDeleteModal from '@/components/ProjectUsers/ProjectUsersDeleteModal.vue'
import { apiInstance as api } from '@/api/apiInstance.js'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: {
    removeProjectPolicy: vi.fn(),
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
    config: { get: mockConfigGet }
  })
}))

import { apiInstance } from '@/api/apiInstance.js'

describe('ProjectUsersDeleteModal.vue', () => {
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
    // Default: form auth (password provider)
    mockConfigGet.mockImplementation(key => key === 'auth' ? 'form' : undefined)
  })

  function mountComponent(props = {}) {
    return shallowMount(ProjectUsersDeleteModal, {
      global,
      props: { user, projectName, modelValue: true, ...props }
    })
  }

  it('renders the user name in the title slot', () => {
    const wrapper = mountComponent()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.props('user')).toEqual(user)
  })

  describe('form/basic auth mode (password provider)', () => {
    it('calls deleteUser with the login on confirm', async () => {
      api.deleteUser.mockResolvedValue(undefined)
      const wrapper = mountComponent()
      await wrapper.vm.confirmDeletion()
      await flushPromises()
      expect(api.deleteUser).toHaveBeenCalledWith(user.name)
      expect(api.removeProjectPolicy).not.toHaveBeenCalled()
    })

    it('emits user:deleted and closes modal on success', async () => {
      api.deleteUser.mockResolvedValue(undefined)
      const wrapper = mountComponent()
      await wrapper.vm.confirmDeletion()
      await flushPromises()
      expect(wrapper.emitted('user:deleted')).toEqual([[{ name: user.name }]])
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

  describe('oauth mode', () => {
    beforeEach(() => {
      mockConfigGet.mockImplementation(key => key === 'auth' ? 'oauth' : undefined)
    })

    it('calls removeProjectPolicy (not deleteUser) on confirm', async () => {
      api.removeProjectPolicy.mockResolvedValue(undefined)
      const wrapper = mountComponent()
      await wrapper.vm.confirmDeletion()
      await flushPromises()
      expect(api.removeProjectPolicy).toHaveBeenCalledWith('default', projectName, { user: user.name })
      expect(api.deleteUser).not.toHaveBeenCalled()
    })

    it('emits user:deleted and closes modal on success', async () => {
      api.removeProjectPolicy.mockResolvedValue(undefined)
      const wrapper = mountComponent()
      await wrapper.vm.confirmDeletion()
      await flushPromises()
      expect(wrapper.emitted('user:deleted')).toEqual([[{ name: user.name }]])
      expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    })

    it('shows error toast and keeps modal open on failure', async () => {
      api.removeProjectPolicy.mockRejectedValue(new Error('forbidden'))
      const wrapper = mountComponent()
      await wrapper.vm.confirmDeletion()
      await flushPromises()
      expect(mockToast.error).toHaveBeenCalledOnce()
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })
  })
})
