import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup.js'
import SettingsViewUsersEditModal from '@/views/Settings/SettingsView/SettingsViewUsersEditModal.vue'

const mockToast = { error: vi.fn(), success: vi.fn() }
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({ toast: mockToast })
}))

const mockApi = { updateUser: vi.fn() }
vi.mock('@/composables/useCore', () => ({
  useCore: () => ({ api: mockApi })
}))

const user = { uid: 'alice', name: 'Alice', email: 'alice@example.org' }

describe('SettingsViewUsersEditModal.vue', () => {
  let core, global

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockApi.updateUser.mockResolvedValue(undefined)
    core.createPinia()
    global = { plugins: core.plugins, renderStubDefaultSlot: true }
  })

  function mountComponent(props = {}) {
    return shallowMount(SettingsViewUsersEditModal, {
      global,
      props: { modelValue: true, user, ...props }
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

  it('pre-fills name and email from the user prop', () => {
    const wrapper = mountComponent()
    expect(wrapper.vm.name).toBe('Alice')
    expect(wrapper.vm.email).toBe('alice@example.org')
    expect(wrapper.vm.resetPassword).toBe(false)
  })

  it('re-prefills when the modal is reopened with a different user', async () => {
    const wrapper = mountComponent()
    wrapper.vm.name = 'Changed'
    await wrapper.setProps({ user: { uid: 'bob', name: 'Bob', email: 'bob@example.org' } })
    expect(wrapper.vm.name).toBe('Bob')
    expect(wrapper.vm.email).toBe('bob@example.org')
  })

  it('isValid is false when name is empty', async () => {
    const wrapper = mountComponent()
    wrapper.vm.name = ''
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isValid).toBe(false)
  })

  it('isValid is false when resetPassword is on but passwords do not match', async () => {
    const wrapper = mountComponent()
    wrapper.vm.resetPassword = true
    wrapper.vm.password = 'secret'
    wrapper.vm.confirmPassword = 'different'
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isValid).toBe(false)
  })

  it('isValid is true without touching the password fields', () => {
    const wrapper = mountComponent()
    expect(wrapper.vm.isValid).toBe(true)
  })

  it('calls updateUser with only the changed fields, emits user:updated, closes the modal, shows a success toast', async () => {
    const wrapper = mountComponent()
    stubFormValidity(wrapper, true)
    wrapper.vm.name = 'Alice Updated'
    await wrapper.vm.saveUser()
    expect(mockApi.updateUser).toHaveBeenCalledWith('alice', { name: 'Alice Updated' })
    expect(wrapper.emitted('user:updated')).toEqual([[{ uid: 'alice' }]])
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    expect(mockToast.success).toHaveBeenCalledOnce()
  })

  it('submits without password change when resetPassword is off', async () => {
    const wrapper = mountComponent()
    stubFormValidity(wrapper, true)
    wrapper.vm.email = 'new@example.org'
    await wrapper.vm.saveUser()
    expect(mockApi.updateUser).toHaveBeenCalledWith('alice', { email: 'new@example.org' })
  })

  it('includes the password field when resetPassword is on and confirmed', async () => {
    const wrapper = mountComponent()
    stubFormValidity(wrapper, true)
    wrapper.vm.resetPassword = true
    wrapper.vm.password = 'newsecret'
    wrapper.vm.confirmPassword = 'newsecret'
    await wrapper.vm.saveUser()
    expect(mockApi.updateUser).toHaveBeenCalledWith('alice', { password: 'newsecret' })
  })

  it('shows an error toast and does not emit user:updated when updateUser fails', async () => {
    mockApi.updateUser.mockRejectedValue({ response: { status: 500 } })
    const wrapper = mountComponent()
    stubFormValidity(wrapper, true)
    wrapper.vm.name = 'Alice Updated'
    await wrapper.vm.saveUser()
    expect(wrapper.emitted('user:updated')).toBeFalsy()
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    expect(mockToast.success).not.toHaveBeenCalled()
    expect(mockToast.error).toHaveBeenCalledWith('Failed to update user.')
  })

  it('saveUser does not call updateUser when the form is invalid', async () => {
    const wrapper = mountComponent()
    const element = stubFormValidity(wrapper, false)
    wrapper.vm.name = 'Alice Updated'
    await wrapper.vm.saveUser()
    expect(element.reportValidity).toHaveBeenCalledOnce()
    expect(mockApi.updateUser).not.toHaveBeenCalled()
    expect(wrapper.emitted('user:updated')).toBeFalsy()
  })

  it('saveUser prevents the modal default ok behavior', async () => {
    const wrapper = mountComponent()
    stubFormValidity(wrapper, false)
    const bvModalEvent = { preventDefault: vi.fn() }
    await wrapper.vm.saveUser(bvModalEvent)
    expect(bvModalEvent.preventDefault).toHaveBeenCalledOnce()
  })
})
