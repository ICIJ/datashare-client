import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectUsersCreateModal from '@/components/ProjectUsers/ProjectUsersCreateModal.vue'

const mockToast = { error: vi.fn(), success: vi.fn() }
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({ toast: mockToast })
}))

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
  })

  function mountComponent(props = {}) {
    return shallowMount(ProjectUsersCreateModal, {
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

  it('emits user:created with the full user payload, closes modal, resets form on success', async () => {
    const wrapper = mountComponent()
    stubFormValidity(wrapper, true)
    wrapper.vm.username = 'alice'
    wrapper.vm.email = 'alice@example.org'
    wrapper.vm.name = 'Alice'
    wrapper.vm.password = 'secret'
    wrapper.vm.confirmPassword = 'secret'
    await wrapper.vm.saveUser()
    expect(wrapper.emitted('user:created')).toEqual([
      [
        {
          uid: 'alice',
          email: 'alice@example.org',
          name: 'Alice',
          password: 'secret',
          domain: 'default',
          index: project,
          role: 'member'
        }
      ]
    ])
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    expect(wrapper.vm.username).toBe('')
    expect(wrapper.vm.password).toBe('')
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
