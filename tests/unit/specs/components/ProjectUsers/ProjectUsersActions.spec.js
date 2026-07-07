import { ref } from 'vue'
import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectUsersActions from '@/components/ProjectUsers/ProjectUsersActions.vue'
import ProjectUsersDeleteModal from '@/components/ProjectUsers/ProjectUsersDeleteModal.vue'
import { useAuth } from '@/composables/useAuth.js'

function mockAuth({ username = 'someone-else@icij.org', isUsersProvider = true } = {}) {
  useAuth.mockReturnValue({ username: ref(username), isUsersProvider: ref(isUsersProvider) })
}

vi.mock('@/composables/useAuth.js', () => ({
  useAuth: vi.fn()
}))

describe('ProjectUsersActions.vue', () => {
  let core, global

  const user = { login: 'alice@icij.org', role: 'PROJECT_ADMIN' }
  const projectName = 'local-datashare'

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    core.createPinia()
    global = { plugins: core.plugins }
    mockAuth()
  })

  function mountComponent(props = {}) {
    return shallowMount(ProjectUsersActions, {
      global,
      props: { user, projectName, ...props }
    })
  }

  it('renders a copy button and a delete button', () => {
    const wrapper = mountComponent()
    expect(wrapper.findAll('haptic-copy-stub')).toHaveLength(1)
    expect(wrapper.findAll('button-row-action-stub')).toHaveLength(1)
  })

  it('copy button is a haptic-copy configured to copy the user login', () => {
    const wrapper = mountComponent()
    const hapticCopy = wrapper.find('haptic-copy-stub')
    expect(hapticCopy.attributes('text')).toBe(user.login)
  })

  it('delete button opens the delete modal', async () => {
    const wrapper = mountComponent()
    expect(wrapper.findComponent(ProjectUsersDeleteModal).props('modelValue')).toBe(false)
    await wrapper.find('button-row-action-stub').trigger('click')
    expect(wrapper.findComponent(ProjectUsersDeleteModal).props('modelValue')).toBe(true)
  })

  it('forwards user:deleted from the modal', async () => {
    const wrapper = mountComponent()
    await wrapper.findComponent(ProjectUsersDeleteModal).trigger('user:deleted', { login: user.login })
    expect(wrapper.emitted('user:deleted')).toEqual([[{ login: user.login }]])
  })

  it('disables the delete button when the user is the current logged-in user', () => {
    mockAuth({ username: user.login })
    const wrapper = mountComponent()
    expect(wrapper.find('button-row-action-stub').attributes('disabled')).toBe('true')
  })

  it('does not disable the delete button for another user', () => {
    mockAuth({ username: 'someone-else@icij.org' })
    const wrapper = mountComponent()
    expect(wrapper.find('button-row-action-stub').attributes('disabled')).toBe('false')
  })

  it('does not disable the copy button for the current logged-in user', () => {
    mockAuth({ username: user.login })
    const wrapper = mountComponent()
    expect(wrapper.find('haptic-copy-stub').attributes('disabled')).toBeUndefined()
  })

  it('hides the delete button when the auth provider is not a users provider', () => {
    mockAuth({ isUsersProvider: false })
    const wrapper = mountComponent()
    expect(wrapper.findAll('button-row-action-stub')).toHaveLength(0)
  })
})
