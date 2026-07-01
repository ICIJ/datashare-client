import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectUsersActions from '@/components/ProjectUsers/ProjectUsersActions.vue'
import ProjectUsersDeleteModal from '@/components/ProjectUsers/ProjectUsersDeleteModal.vue'
import { useAuth } from '@/composables/useAuth.js'

const mockToast = { success: vi.fn(), error: vi.fn() }
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({ toast: mockToast })
}))

vi.mock('@/composables/useAuth.js', () => ({
  useAuth: vi.fn()
}))

const mockWriteText = vi.fn()
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: mockWriteText },
  writable: true
})

describe('ProjectUsersActions.vue', () => {
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
    useAuth.mockReturnValue({ username: { value: 'someone-else@icij.org' } })
  })

  function mountComponent(props = {}) {
    return shallowMount(ProjectUsersActions, {
      global,
      props: { user, projectName, ...props }
    })
  }

  it('renders a copy button and a delete button', () => {
    const wrapper = mountComponent()
    const buttons = wrapper.findAll('button-row-action-stub')
    expect(buttons).toHaveLength(2)
  })

  it('copy button writes user name to clipboard and shows success toast', async () => {
    mockWriteText.mockResolvedValue(undefined)
    const wrapper = mountComponent()
    await wrapper.findAll('button-row-action-stub')[0].trigger('click')
    expect(mockWriteText).toHaveBeenCalledWith(user.name)
    await Promise.resolve()
    expect(mockToast.success).toHaveBeenCalledOnce()
  })

  it('delete button opens the delete modal', async () => {
    const wrapper = mountComponent()
    expect(wrapper.findComponent(ProjectUsersDeleteModal).props('modelValue')).toBe(false)
    await wrapper.findAll('button-row-action-stub')[1].trigger('click')
    expect(wrapper.findComponent(ProjectUsersDeleteModal).props('modelValue')).toBe(true)
  })

  it('forwards user:deleted from the modal', async () => {
    const wrapper = mountComponent()
    await wrapper.findComponent(ProjectUsersDeleteModal).trigger('user:deleted', { name: user.name })
    expect(wrapper.emitted('user:deleted')).toEqual([[{ name: user.name }]])
  })

  it('disables the delete button when the user is the current logged-in user', () => {
    useAuth.mockReturnValue({ username: { value: user.name } })
    const wrapper = mountComponent()
    expect(wrapper.findAll('button-row-action-stub')[1].attributes('disabled')).toBe('true')
  })

  it('does not disable the delete button for another user', () => {
    useAuth.mockReturnValue({ username: { value: 'someone-else@icij.org' } })
    const wrapper = mountComponent()
    expect(wrapper.findAll('button-row-action-stub')[1].attributes('disabled')).toBe('false')
  })

  it('does not disable the copy button for the current logged-in user', () => {
    useAuth.mockReturnValue({ username: { value: user.name } })
    const wrapper = mountComponent()
    expect(wrapper.findAll('button-row-action-stub')[0].attributes('disabled')).toBeUndefined()
  })
})
