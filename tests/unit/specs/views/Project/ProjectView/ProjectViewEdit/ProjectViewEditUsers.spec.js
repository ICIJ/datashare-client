import { shallowMount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup.js'
import ProjectViewEditUsers from '@/views/Project/ProjectView/ProjectViewEdit/ProjectViewEditUsers.vue'
import ProjectUsersList from '@/components/ProjectUsers/ProjectUsersList.vue'
import { apiInstance as api } from '@/api/apiInstance.js'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: {
    getProjectPolicies: vi.fn()
  }
}))

const mockToast = { success: vi.fn(), error: vi.fn() }
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({ toast: mockToast })
}))

describe('ProjectViewEditUsers.vue', () => {
  let core
  const props = { name: 'local-datashare' }

  const policies = {
    items: [
      { ptype: 'g', v0: 'alice@icij.org', v1: 'PROJECT_ADMIN', v2: 'default::local-datashare' },
      { ptype: 'g', v0: 'bob@icij.org', v1: 'PROJECT_MEMBER', v2: 'default::local-datashare' }
    ],
    pagination: { count: 2, from: 0, size: 10, total: 2 }
  }

  function shallowMountComponent(extraProps = {}) {
    return shallowMount(ProjectViewEditUsers, {
      global: { plugins: core.plugins },
      props: { ...props, ...extraProps }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    core = CoreSetup.init().useAll().useRouterWithoutGuards()
    api.getProjectPolicies.mockResolvedValue(policies)
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('calls getProjectPolicies with domain "default" and the project name on mount', async () => {
    shallowMountComponent()
    await flushPromises()
    expect(api.getProjectPolicies).toBeCalledWith('default', 'local-datashare', { from: 0, to: 10 })
  })

  it('renders a ProjectUsersList', () => {
    const wrapper = shallowMountComponent()
    expect(wrapper.findComponent(ProjectUsersList).exists()).toBe(true)
  })

  it('maps v0/v1 fields to { name, role } and passes them to ProjectUsersList', async () => {
    const wrapper = shallowMountComponent()
    await flushPromises()
    const list = wrapper.findComponent(ProjectUsersList)
    expect(list.props('users')).toEqual([
      { name: 'alice@icij.org', role: 'PROJECT_ADMIN' },
      { name: 'bob@icij.org', role: 'PROJECT_MEMBER' }
    ])
  })

  it('passes an empty users array before the API resolves', () => {
    const wrapper = shallowMountComponent()
    const list = wrapper.findComponent(ProjectUsersList)
    expect(list.props('users')).toEqual([])
  })

  it('passes an empty users array when the API returns an empty items list', async () => {
    api.getProjectPolicies.mockResolvedValue({ items: [], pagination: { count: 0, from: 0, size: 10, total: 0 } })
    const wrapper = shallowMountComponent()
    await flushPromises()
    expect(wrapper.findComponent(ProjectUsersList).props('users')).toEqual([])
  })

  it('passes an empty users array when items is null', async () => {
    api.getProjectPolicies.mockResolvedValue({ items: null })
    const wrapper = shallowMountComponent()
    await flushPromises()
    expect(wrapper.findComponent(ProjectUsersList).props('users')).toEqual([])
  })

  it('shows a toast error when the API call fails', async () => {
    api.getProjectPolicies.mockRejectedValue(new Error('Network error'))
    shallowMountComponent()
    await flushPromises()
    expect(mockToast.error).toHaveBeenCalledOnce()
  })

  it('still renders ProjectUsersList with empty users after a failed API call', async () => {
    api.getProjectPolicies.mockRejectedValue(new Error('Network error'))
    const wrapper = shallowMountComponent()
    await flushPromises()
    expect(wrapper.findComponent(ProjectUsersList).exists()).toBe(true)
    expect(wrapper.findComponent(ProjectUsersList).props('users')).toEqual([])
  })
})
