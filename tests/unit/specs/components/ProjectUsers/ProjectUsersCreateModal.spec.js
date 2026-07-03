import { shallowMount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectUsersCreateModal from '@/components/ProjectUsers/ProjectUsersCreateModal.vue'
import { apiInstance as api } from '@/api/apiInstance.js'
import { usePolicies } from '@/composables/usePolicies.js'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: {
    createUser: vi.fn(),
    saveProjectPolicy: vi.fn()
  }
}))

const mockToast = { error: vi.fn(), success: vi.fn() }
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({ toast: mockToast })
}))

vi.mock('@/composables/usePolicies', () => ({
  usePolicies: vi.fn(() => ({
    getRoleByProject: vi.fn().mockReturnValue('INSTANCE_ADMIN'),
    formatRole: (_t, role) => role
  }))
}))

const mockConfigGet = vi.fn()

vi.mock('@/composables/useCore', () => ({
  useCore: () => ({
    api: apiInstance,
    config: { get: mockConfigGet },
    auth: { getUsername: vi.fn().mockResolvedValue(null), isBasicAuth: vi.fn().mockResolvedValue(false) }
  })
}))

// apiInstance is the mocked module — import after vi.mock so the reference resolves
import { apiInstance } from '@/api/apiInstance.js'

describe('ProjectUsersCreateModal.vue', () => {
  let core, global

  const project = 'local-datashare'

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    core.createPinia()
    global = { plugins: core.plugins }
    // Default: form auth → password fields shown
    mockConfigGet.mockImplementation(key => key === 'auth' ? 'form' : undefined)
    vi.mocked(usePolicies).mockReturnValue({
      getRoleByProject: vi.fn().mockReturnValue('INSTANCE_ADMIN'),
      formatRole: (_t, role) => role
    })
  })

  function mountComponent(props = {}) {
    return shallowMount(ProjectUsersCreateModal, {
      global: { ...global, renderStubDefaultSlot: true },
      props: { project, modelValue: true, ...props }
    })
  }

  it('renders b-form-inputs for all fields', () => {
    const wrapper = mountComponent()
    expect(wrapper.findAll('b-form-input-stub').length).toBeGreaterThanOrEqual(1)
  })

  it('renders a b-form-select with available roles', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('b-form-select-stub').exists()).toBe(true)
    expect(wrapper.vm.availableRoles.length).toBeGreaterThan(0)
  })

  it('isValid is false when username is empty', () => {
    const wrapper = mountComponent()
    expect(wrapper.vm.isValid).toBe(false)
  })

  it('isValid is false when username is set but password is empty', async () => {
    const wrapper = mountComponent()
    wrapper.vm.username = 'alice'
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isValid).toBe(false)
  })

  it('isValid is false when passwords do not match', async () => {
    const wrapper = mountComponent()
    wrapper.vm.username = 'alice'
    wrapper.vm.password = 'secret'
    wrapper.vm.confirmPassword = 'different'
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isValid).toBe(false)
  })

  it('isValid is true when username, password, and confirmPassword all match', async () => {
    const wrapper = mountComponent()
    wrapper.vm.username = 'alice'
    wrapper.vm.password = 'secret'
    wrapper.vm.confirmPassword = 'secret'
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isValid).toBe(true)
  })

  it('passwordMismatch is false when confirmPassword is empty', async () => {
    const wrapper = mountComponent()
    wrapper.vm.password = 'secret'
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.passwordMismatch).toBe(false)
  })

  it('passwordMismatch is true when confirmPassword differs from password', async () => {
    const wrapper = mountComponent()
    wrapper.vm.password = 'secret'
    wrapper.vm.confirmPassword = 'other'
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.passwordMismatch).toBe(true)
  })

  it('createUser calls createUser API with correct payload', async () => {
    api.createUser.mockResolvedValue({})
    api.saveProjectPolicy.mockResolvedValue(undefined)
    const wrapper = mountComponent()
    wrapper.vm.username = 'alice'
    wrapper.vm.email = 'alice@example.org'
    wrapper.vm.name = 'Alice'
    wrapper.vm.password = 'secret'
    wrapper.vm.confirmPassword = 'secret'
    await wrapper.vm.$nextTick()
    await wrapper.vm.createUser()
    await flushPromises()
    expect(api.createUser).toHaveBeenCalledWith({
      login: 'alice',
      email: 'alice@example.org',
      name: 'Alice',
      provider: 'external',
      password: 'secret',
      domain: 'default',
      index: project
    })
  })

  it('createUser calls saveProjectPolicy after createUser succeeds', async () => {
    api.createUser.mockResolvedValue({})
    api.saveProjectPolicy.mockResolvedValue(undefined)
    const wrapper = mountComponent()
    wrapper.vm.username = 'alice'
    wrapper.vm.password = 'secret'
    wrapper.vm.confirmPassword = 'secret'
    await wrapper.vm.$nextTick()
    await wrapper.vm.saveUser()
    await flushPromises()
    expect(api.saveProjectPolicy).toHaveBeenCalledWith('default', project, {
      user: 'alice',
      role: 'PROJECT_MEMBER'
    })
  })

  it('emits user:created, closes modal, resets form on success', async () => {
    api.createUser.mockResolvedValue({})
    api.saveProjectPolicy.mockResolvedValue(undefined)
    const wrapper = mountComponent()
    wrapper.vm.username = 'alice'
    wrapper.vm.password = 'secret'
    wrapper.vm.confirmPassword = 'secret'
    await wrapper.vm.$nextTick()
    await wrapper.vm.saveUser()
    await flushPromises()
    expect(wrapper.emitted('user:created')).toEqual([[{ uid: 'alice', role: 'PROJECT_MEMBER' }]])
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    expect(wrapper.vm.username).toBe('')
    expect(wrapper.vm.password).toBe('')
  })

  it('shows generic error toast and keeps modal open on API failure', async () => {
    api.createUser.mockRejectedValue(new Error('server error'))
    const wrapper = mountComponent()
    wrapper.vm.username = 'alice'
    wrapper.vm.password = 'secret'
    wrapper.vm.confirmPassword = 'secret'
    await wrapper.vm.$nextTick()
    await wrapper.vm.saveUser()
    await flushPromises()
    expect(mockToast.error).toHaveBeenCalledOnce()
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    expect(wrapper.vm.username).toBe('alice')
  })

  it('shows conflict error toast on 409 response', async () => {
    const err = new Error('conflict')
    err.response = { status: 409 }
    api.createUser.mockRejectedValue(err)
    const wrapper = mountComponent()
    wrapper.vm.username = 'alice'
    wrapper.vm.password = 'secret'
    wrapper.vm.confirmPassword = 'secret'
    await wrapper.vm.$nextTick()
    await wrapper.vm.saveUser()
    await flushPromises()
    expect(mockToast.error).toHaveBeenCalledWith(
      core.i18n.global.t('projectViewEdit.users.create.saveErrorConflict')
    )
  })

  describe('isUsersProvider', () => {
    it('is true when auth is "form"', () => {
      mockConfigGet.mockImplementation(key => key === 'auth' ? 'form' : undefined)
      const wrapper = mountComponent()
      expect(wrapper.vm.isUsersProvider).toBe(true)
    })

    it('is true when auth is "basic"', () => {
      mockConfigGet.mockImplementation(key => key === 'auth' ? 'basic' : undefined)
      const wrapper = mountComponent()
      expect(wrapper.vm.isUsersProvider).toBe(true)
    })

    it('is false when auth is "oauth"', () => {
      mockConfigGet.mockImplementation(key => key === 'auth' ? 'oauth' : undefined)
      const wrapper = mountComponent()
      expect(wrapper.vm.isUsersProvider).toBe(false)
    })

    it('isValid is true with only a username when auth is "oauth"', async () => {
      mockConfigGet.mockImplementation(key => key === 'auth' ? 'oauth' : undefined)
      const wrapper = mountComponent()
      wrapper.vm.username = 'alice'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isValid).toBe(true)
    })

    it('createUser omits password from payload when auth is "oauth"', async () => {
      mockConfigGet.mockImplementation(key => key === 'auth' ? 'oauth' : undefined)
      api.createUser.mockResolvedValue({})
      api.saveProjectPolicy.mockResolvedValue(undefined)
      const wrapper = mountComponent()
      wrapper.vm.username = 'alice'
      await wrapper.vm.$nextTick()
      await wrapper.vm.createUser()
      await flushPromises()
      expect(api.createUser).toHaveBeenCalledWith(expect.not.objectContaining({ password: expect.anything() }))
    })
  })
})
