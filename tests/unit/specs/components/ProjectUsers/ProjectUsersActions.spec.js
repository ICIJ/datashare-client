import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectUsersActions from '@/components/ProjectUsers/ProjectUsersActions.vue'
import ProjectUsersDeleteModal from '@/components/ProjectUsers/ProjectUsersDeleteModal.vue'

describe('ProjectUsersActions.vue', () => {
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
  })

  function mountComponent(props = {}) {
    return shallowMount(ProjectUsersActions, {
      global,
      props: { user, project, ...props }
    })
  }

  it('renders a copy button and a delete button', () => {
    const wrapper = mountComponent()
    expect(wrapper.findAll('haptic-copy-stub')).toHaveLength(1)
    expect(wrapper.findAll('button-row-action-stub')).toHaveLength(1)
  })

  it('copy button is a haptic-copy configured to copy the user id', () => {
    const wrapper = mountComponent()
    const hapticCopy = wrapper.find('haptic-copy-stub')
    expect(hapticCopy.attributes('text')).toBe(user.uid)
  })

  it('delete button opens the delete modal', async () => {
    const wrapper = mountComponent()
    expect(wrapper.findComponent(ProjectUsersDeleteModal).props('modelValue')).toBe(false)
    await wrapper.find('button-row-action-stub').trigger('click')
    expect(wrapper.findComponent(ProjectUsersDeleteModal).props('modelValue')).toBe(true)
  })

  it('forwards user:deleted from the modal', async () => {
    const wrapper = mountComponent()
    await wrapper.findComponent(ProjectUsersDeleteModal).trigger('user:deleted', { uid: user.uid })
    expect(wrapper.emitted('user:deleted')).toEqual([[{ uid: user.uid }]])
  })

  it('disables the delete button when disableDelete is true', () => {
    const wrapper = mountComponent({ disableDelete: true })
    expect(wrapper.find('button-row-action-stub').attributes('disabled')).toBe('true')
  })

  it('does not disable the delete button when disableDelete is false', () => {
    const wrapper = mountComponent({ disableDelete: false })
    expect(wrapper.find('button-row-action-stub').attributes('disabled')).toBe('false')
  })

  it('does not disable the copy button when disableDelete is true', () => {
    const wrapper = mountComponent({ disableDelete: true })
    expect(wrapper.find('haptic-copy-stub').attributes('disabled')).toBeUndefined()
  })

  it('hides the delete button when hideDelete is true', () => {
    const wrapper = mountComponent({ hideDelete: true })
    expect(wrapper.findAll('button-row-action-stub')).toHaveLength(0)
  })

  it('mounts the delete modal when the delete button is neither hidden nor disabled', () => {
    const wrapper = mountComponent({ hideDelete: false, disableDelete: false })
    expect(wrapper.findComponent(ProjectUsersDeleteModal).exists()).toBe(true)
  })

  it('does not mount the delete modal when hideDelete is true', () => {
    const wrapper = mountComponent({ hideDelete: true, disableDelete: false })
    expect(wrapper.findComponent(ProjectUsersDeleteModal).exists()).toBe(false)
  })

  it('does not mount the delete modal when disableDelete is true', () => {
    const wrapper = mountComponent({ hideDelete: false, disableDelete: true })
    expect(wrapper.findComponent(ProjectUsersDeleteModal).exists()).toBe(false)
  })

  it('does not mount the delete modal when both hideDelete and disableDelete are true', () => {
    const wrapper = mountComponent({ hideDelete: true, disableDelete: true })
    expect(wrapper.findComponent(ProjectUsersDeleteModal).exists()).toBe(false)
  })
})
