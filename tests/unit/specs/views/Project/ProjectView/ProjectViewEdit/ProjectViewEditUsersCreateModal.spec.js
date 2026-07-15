import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup.js'
import ProjectViewEditUsersCreateModal from '@/views/Project/ProjectView/ProjectViewEdit/ProjectViewEditUsersCreateModal.vue'

const mockToast = { error: vi.fn(), success: vi.fn() }
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({ toast: mockToast })
}))

const mockApi = { createUser: vi.fn(), grantUserRole: vi.fn() }
vi.mock('@/composables/useCore', () => ({
  useCore: () => ({ api: mockApi })
}))

describe('ProjectViewEditUsersCreateModal.vue', () => {
  let core, global

  const project = 'local-datashare'

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockApi.createUser.mockResolvedValue(undefined)
    mockApi.grantUserRole.mockResolvedValue(undefined)
    core.createPinia()
    global = { plugins: core.plugins }
  })

  function mountComponent(props = {}) {
    return shallowMount(ProjectViewEditUsersCreateModal, {
      global: { ...global, renderStubDefaultSlot: true },
      props: { project, modelValue: true, ...props }
    })
  }

  function stubFormValidity(wrapper, valid) {
    wrapper.vm.form = {
      element: {
        checkValidity: vi.fn().mockReturnValue(valid),
        reportValidity: vi.fn()
      }
    }
    return wrapper.vm.form.element
  }

  it('renders b-form-inputs for all fields', () => {
    const wrapper = mountComponent()
    expect(wrapper.findAll('b-form-input-stub').length).toBeGreaterThanOrEqual(1)
  })

  it('renders a project-users-role-dropdown bound to the project and selectedRole', () => {
    const wrapper = mountComponent()
    const dropdown = wrapper.find('project-users-role-dropdown-stub')
    expect(dropdown.exists()).toBe(true)
    expect(dropdown.attributes('project')).toBe(project)
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

  it('isValid is true when username, email, name, password, and confirmPassword are all set and match', async () => {
    const wrapper = mountComponent()
    wrapper.vm.username = 'alice'
    wrapper.vm.email = 'alice@example.org'
    wrapper.vm.name = 'Alice'
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

  it('calls createUser and grantUserRole, emits user:created, closes modal, resets form and shows a success toast', async () => {
    const wrapper = mountComponent()
    stubFormValidity(wrapper, true)
    wrapper.vm.username = 'alice'
    wrapper.vm.email = 'alice@example.org'
    wrapper.vm.name = 'Alice'
    wrapper.vm.password = 'secret'
    wrapper.vm.confirmPassword = 'secret'
    await wrapper.vm.saveUser()
    expect(mockApi.createUser).toHaveBeenCalledWith({
      uid: 'alice',
      email: 'alice@example.org',
      name: 'Alice',
      provider: 'external',
      password: 'secret',
      domain: 'default',
      index: project
    })
    expect(mockApi.grantUserRole).toHaveBeenCalledWith('alice', project, 'member')
    expect(wrapper.emitted('user:created')).toEqual([[{ uid: 'alice' }]])
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    expect(wrapper.vm.username).toBe('')
    expect(wrapper.vm.password).toBe('')
    expect(mockToast.success).toHaveBeenCalledOnce()
  })

  it('does not emit user:created, close, reset, or toast success when createUser fails with a conflict', async () => {
    mockApi.createUser.mockRejectedValue({ response: { status: 409 } })
    const wrapper = mountComponent()
    stubFormValidity(wrapper, true)
    wrapper.vm.username = 'alice'
    wrapper.vm.email = 'alice@example.org'
    wrapper.vm.name = 'Alice'
    wrapper.vm.password = 'secret'
    wrapper.vm.confirmPassword = 'secret'
    await wrapper.vm.saveUser()
    expect(mockApi.grantUserRole).not.toHaveBeenCalled()
    expect(wrapper.emitted('user:created')).toBeFalsy()
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    expect(wrapper.vm.username).toBe('alice')
    expect(mockToast.success).not.toHaveBeenCalled()
    expect(mockToast.error).toHaveBeenCalledOnce()
  })

  it('shows the generic error toast when grantUserRole fails with a non-conflict error', async () => {
    mockApi.grantUserRole.mockRejectedValue({ response: { status: 500 } })
    const wrapper = mountComponent()
    stubFormValidity(wrapper, true)
    wrapper.vm.username = 'alice'
    wrapper.vm.email = 'alice@example.org'
    wrapper.vm.name = 'Alice'
    wrapper.vm.password = 'secret'
    wrapper.vm.confirmPassword = 'secret'
    await wrapper.vm.saveUser()
    expect(wrapper.emitted('user:created')).toBeFalsy()
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    expect(mockToast.success).not.toHaveBeenCalled()
    expect(mockToast.error).toHaveBeenCalledOnce()
  })

  it('saveUser does not emit user:created when the form is invalid', async () => {
    const wrapper = mountComponent()
    const element = stubFormValidity(wrapper, false)
    wrapper.vm.username = 'alice'
    wrapper.vm.password = 'secret'
    wrapper.vm.confirmPassword = 'secret'
    await wrapper.vm.saveUser()
    expect(element.reportValidity).toHaveBeenCalledOnce()
    expect(wrapper.emitted('user:created')).toBeFalsy()
    expect(wrapper.vm.saving).toBe(false)
  })

  it('saveUser emits user:created when the form is valid', async () => {
    const wrapper = mountComponent()
    stubFormValidity(wrapper, true)
    wrapper.vm.username = 'alice'
    wrapper.vm.email = 'alice@example.org'
    wrapper.vm.password = 'secret'
    wrapper.vm.confirmPassword = 'secret'
    await wrapper.vm.saveUser()
    expect(wrapper.emitted('user:created')).toHaveLength(1)
  })

  it('saveUser prevents the modal default ok behavior so it does not auto-close regardless of validity', async () => {
    const wrapper = mountComponent()
    stubFormValidity(wrapper, false)
    const bvModalEvent = { preventDefault: vi.fn() }
    await wrapper.vm.saveUser(bvModalEvent)
    expect(bvModalEvent.preventDefault).toHaveBeenCalledOnce()
  })
})
