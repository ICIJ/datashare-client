import { shallowMount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectUsersCreateModal from '@/components/ProjectUsers/ProjectUsersCreateModal.vue'
import { apiInstance as api } from '@/api/apiInstance.js'
import { usePolicies } from '@/composables/usePolicies.js'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: { saveProjectPolicy: vi.fn() }
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

describe('ProjectUsersCreateModal.vue', () => {
  let core, global

  const projectName = 'local-datashare'

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    core.createPinia()
    global = { plugins: core.plugins }
    vi.mocked(usePolicies).mockReturnValue({
      getRoleByProject: vi.fn().mockReturnValue('INSTANCE_ADMIN'),
      formatRole: (_t, role) => role
    })
  })

  function mountComponent(props = {}) {
    return shallowMount(ProjectUsersCreateModal, {
      global: { ...global, renderStubDefaultSlot: true },
      props: { projectName, modelValue: true, ...props }
    })
  }

  it('renders a b-form-input for the username', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('b-form-input-stub').exists()).toBe(true)
  })

  it('renders a b-form-select with available roles', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('b-form-select-stub').exists()).toBe(true)
    expect(wrapper.vm.availableRoles.length).toBeGreaterThan(0)
  })

  it('isValid is false when username is empty', () => {
    const wrapper = mountComponent()
    expect(wrapper.vm.username).toBe('')
    expect(wrapper.vm.isValid).toBe(false)
  })

  it('isValid is true when username is non-empty', async () => {
    const wrapper = mountComponent()
    wrapper.vm.username = 'alice@icij.org'
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isValid).toBe(true)
  })

  it('createUser calls saveProjectPolicy, emits user:created, closes modal, resets form', async () => {
    api.saveProjectPolicy.mockResolvedValue(undefined)
    const wrapper = mountComponent()
    wrapper.vm.username = 'alice@icij.org'
    await wrapper.vm.$nextTick()
    await wrapper.vm.createUser()
    await flushPromises()
    expect(api.saveProjectPolicy).toHaveBeenCalledWith('default', projectName, {
      user: 'alice@icij.org',
      role: 'PROJECT_MEMBER'
    })
    expect(wrapper.emitted('user:created')).toEqual([[{ name: 'alice@icij.org', role: 'PROJECT_MEMBER' }]])
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    expect(wrapper.vm.username).toBe('')
  })

  it('shows error toast and keeps modal open on API failure', async () => {
    api.saveProjectPolicy.mockRejectedValue(new Error('forbidden'))
    const wrapper = mountComponent()
    wrapper.vm.username = 'alice@icij.org'
    await wrapper.vm.$nextTick()
    await wrapper.vm.createUser()
    await flushPromises()
    expect(mockToast.error).toHaveBeenCalledOnce()
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    expect(wrapper.vm.username).toBe('alice@icij.org')
  })
})
