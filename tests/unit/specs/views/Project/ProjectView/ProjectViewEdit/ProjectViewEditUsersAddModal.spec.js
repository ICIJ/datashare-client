import { flushPromises, shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup.js'
import ProjectViewEditUsersAddModal from '@/views/Project/ProjectView/ProjectViewEdit/ProjectViewEditUsersAddModal.vue'

const mockToast = { error: vi.fn(), success: vi.fn() }
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({ toast: mockToast })
}))

const mockApi = { getUsers: vi.fn(), grantUserRole: vi.fn() }
vi.mock('@/composables/useCore', () => ({
  useCore: () => ({ api: mockApi })
}))

describe('ProjectViewEditUsersAddModal.vue', () => {
  let core, global

  const project = 'local-datashare'

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockApi.getUsers.mockResolvedValue({ items: [] })
    mockApi.grantUserRole.mockResolvedValue(undefined)
    core.createPinia()
    global = { plugins: core.plugins, renderStubDefaultSlot: true }
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function mountComponent(props = {}) {
    return shallowMount(ProjectViewEditUsersAddModal, {
      global,
      props: { project, modelValue: true, ...props }
    })
  }

  it('does not call getUsers when the search query is empty', async () => {
    mountComponent()
    await vi.runAllTimersAsync()
    expect(mockApi.getUsers).not.toHaveBeenCalled()
  })

  it('debounces the search and calls getUsers with the query', async () => {
    const wrapper = mountComponent()
    wrapper.vm.query = 'ali'
    await vi.runAllTimersAsync()
    expect(mockApi.getUsers).toHaveBeenCalledWith({ q: 'ali' })
  })

  it('lists the matched users', async () => {
    mockApi.getUsers.mockResolvedValue({
      items: [{ uid: 'alice@example.org', name: 'Alice', email: 'alice@example.org' }]
    })
    const wrapper = mountComponent()
    wrapper.vm.query = 'ali'
    await vi.runAllTimersAsync()
    expect(wrapper.vm.results).toEqual([{ uid: 'alice@example.org', name: 'Alice', email: 'alice@example.org' }])
  })

  it('isValid is false until a user is picked from the results', () => {
    const wrapper = mountComponent()
    expect(wrapper.vm.isValid).toBe(false)
  })

  it('isValid becomes true once a user is selected', () => {
    const wrapper = mountComponent()
    wrapper.vm.selectUser({ uid: 'alice@example.org' })
    expect(wrapper.vm.isValid).toBe(true)
  })

  it('clearSelection drops the selected user', () => {
    const wrapper = mountComponent()
    wrapper.vm.selectUser({ uid: 'alice@example.org' })
    wrapper.vm.clearSelection()
    expect(wrapper.vm.isValid).toBe(false)
  })

  it('saveUser only calls grantUserRole, never createUser, and emits user:added', async () => {
    const wrapper = mountComponent()
    wrapper.vm.selectUser({ uid: 'alice@example.org' })
    await wrapper.vm.saveUser()
    expect(mockApi.grantUserRole).toHaveBeenCalledWith('alice@example.org', project, 'member')
    expect(wrapper.emitted('user:added')).toEqual([[{ uid: 'alice@example.org' }]])
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    expect(mockToast.success).toHaveBeenCalledOnce()
  })

  it('saveUser does nothing when no user is selected', async () => {
    const wrapper = mountComponent()
    await wrapper.vm.saveUser()
    expect(mockApi.grantUserRole).not.toHaveBeenCalled()
    expect(wrapper.emitted('user:added')).toBeFalsy()
  })

  it('shows an error toast and does not close when grantUserRole fails', async () => {
    mockApi.grantUserRole.mockRejectedValue(new Error('forbidden'))
    const wrapper = mountComponent()
    wrapper.vm.selectUser({ uid: 'alice@example.org' })
    await wrapper.vm.saveUser()
    await flushPromises()
    expect(wrapper.emitted('user:added')).toBeFalsy()
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    expect(mockToast.error).toHaveBeenCalledOnce()
  })

  it('saveUser prevents the modal default ok behavior', async () => {
    const wrapper = mountComponent()
    wrapper.vm.selectUser({ uid: 'alice@example.org' })
    const bvModalEvent = { preventDefault: vi.fn() }
    await wrapper.vm.saveUser(bvModalEvent)
    expect(bvModalEvent.preventDefault).toHaveBeenCalledOnce()
  })
})
