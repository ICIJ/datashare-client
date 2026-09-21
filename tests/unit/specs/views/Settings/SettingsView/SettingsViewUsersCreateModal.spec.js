import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup.js'
import SettingsViewUsersCreateModal from '@/views/Settings/SettingsView/SettingsViewUsersCreateModal.vue'

const mockToast = { error: vi.fn(), success: vi.fn() }
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({ toast: mockToast })
}))

const mockApi = { createUser: vi.fn(), grantUserRole: vi.fn() }
vi.mock('@/composables/useCore', () => ({
  useCore: () => ({ api: mockApi, projects: [{ name: 'local-datashare' }] })
}))

describe('SettingsViewUsersCreateModal.vue', () => {
  let core, global

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockApi.createUser.mockResolvedValue(undefined)
    mockApi.grantUserRole.mockResolvedValue(undefined)
    core.createPinia()
    global = { plugins: core.plugins, renderStubDefaultSlot: true }
  })

  function mountComponent(props = {}) {
    return shallowMount(SettingsViewUsersCreateModal, {
      global,
      props: { modelValue: true, ...props }
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

  function fillRequiredFields(wrapper) {
    wrapper.vm.username = 'alice'
    wrapper.vm.email = 'alice@example.org'
    wrapper.vm.name = 'Alice'
    wrapper.vm.password = 'secret'
    wrapper.vm.confirmPassword = 'secret'
  }

  it('isValid is false when username is empty', () => {
    const wrapper = mountComponent()
    expect(wrapper.vm.isValid).toBe(false)
  })

  it('isValid is false when passwords do not match', async () => {
    const wrapper = mountComponent()
    fillRequiredFields(wrapper)
    wrapper.vm.confirmPassword = 'different'
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isValid).toBe(false)
  })

  it('isValid is true when all required fields are set and match, with grantAccess collapsed', async () => {
    const wrapper = mountComponent()
    fillRequiredFields(wrapper)
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isValid).toBe(true)
  })

  it('isValid is false when grantAccess is open but no project is selected', async () => {
    const wrapper = mountComponent()
    fillRequiredFields(wrapper)
    wrapper.vm.grantAccess = true
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isValid).toBe(false)
  })

  it('isValid is true when grantAccess is open and a project is selected', async () => {
    const wrapper = mountComponent()
    fillRequiredFields(wrapper)
    wrapper.vm.grantAccess = true
    wrapper.vm.selectedProject = { name: 'local-datashare' }
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isValid).toBe(true)
  })

  it('calls createUser only when grantAccess is not set, emits user:created, closes modal, resets form and shows a success toast', async () => {
    const wrapper = mountComponent()
    stubFormValidity(wrapper, true)
    fillRequiredFields(wrapper)
    await wrapper.vm.saveUser()
    expect(mockApi.createUser).toHaveBeenCalledWith({
      uid: 'alice',
      email: 'alice@example.org',
      name: 'Alice',
      provider: 'external',
      password: 'secret',
      domain: 'default'
    })
    expect(mockApi.grantUserRole).not.toHaveBeenCalled()
    expect(wrapper.emitted('user:created')).toEqual([[{ uid: 'alice' }]])
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    expect(wrapper.vm.username).toBe('')
    expect(mockToast.success).toHaveBeenCalledOnce()
  })

  it('calls createUser then grantUserRole when the project+role section is filled in', async () => {
    const wrapper = mountComponent()
    stubFormValidity(wrapper, true)
    fillRequiredFields(wrapper)
    wrapper.vm.grantAccess = true
    wrapper.vm.selectedProject = { name: 'local-datashare' }
    await wrapper.vm.saveUser()
    expect(mockApi.createUser).toHaveBeenCalledOnce()
    expect(mockApi.grantUserRole).toHaveBeenCalledWith('alice', 'local-datashare', 'member')
    expect(wrapper.emitted('user:created')).toEqual([[{ uid: 'alice' }]])
    expect(mockToast.success).toHaveBeenCalledOnce()
  })

  it('shows a distinct error toast when createUser fails with a 409 conflict', async () => {
    mockApi.createUser.mockRejectedValue({ response: { status: 409 } })
    const wrapper = mountComponent()
    stubFormValidity(wrapper, true)
    fillRequiredFields(wrapper)
    await wrapper.vm.saveUser()
    expect(mockApi.grantUserRole).not.toHaveBeenCalled()
    expect(wrapper.emitted('user:created')).toBeFalsy()
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    expect(mockToast.success).not.toHaveBeenCalled()
    expect(mockToast.error).toHaveBeenCalledWith('This username is already taken.')
  })

  it('shows the generic error toast when createUser fails with a non-conflict error', async () => {
    mockApi.createUser.mockRejectedValue({ response: { status: 500 } })
    const wrapper = mountComponent()
    stubFormValidity(wrapper, true)
    fillRequiredFields(wrapper)
    await wrapper.vm.saveUser()
    expect(wrapper.emitted('user:created')).toBeFalsy()
    expect(mockToast.error).toHaveBeenCalledWith('Failed to create user.')
  })

  it('shows the generic error toast when grantUserRole fails', async () => {
    mockApi.grantUserRole.mockRejectedValue({ response: { status: 500 } })
    const wrapper = mountComponent()
    stubFormValidity(wrapper, true)
    fillRequiredFields(wrapper)
    wrapper.vm.grantAccess = true
    wrapper.vm.selectedProject = { name: 'local-datashare' }
    await wrapper.vm.saveUser()
    expect(wrapper.emitted('user:created')).toBeFalsy()
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    expect(mockToast.success).not.toHaveBeenCalled()
    expect(mockToast.error).toHaveBeenCalledWith('Failed to create user.')
  })

  it('saveUser does not emit user:created when the form is invalid', async () => {
    const wrapper = mountComponent()
    const element = stubFormValidity(wrapper, false)
    fillRequiredFields(wrapper)
    await wrapper.vm.saveUser()
    expect(element.reportValidity).toHaveBeenCalledOnce()
    expect(mockApi.createUser).not.toHaveBeenCalled()
    expect(wrapper.emitted('user:created')).toBeFalsy()
  })

  it('saveUser prevents the modal default ok behavior', async () => {
    const wrapper = mountComponent()
    stubFormValidity(wrapper, false)
    const bvModalEvent = { preventDefault: vi.fn() }
    await wrapper.vm.saveUser(bvModalEvent)
    expect(bvModalEvent.preventDefault).toHaveBeenCalledOnce()
  })
})
