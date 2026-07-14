import { shallowMount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup.js'
import ProjectViewEditUsers from '@/views/Project/ProjectView/ProjectViewEdit/ProjectViewEditUsers.vue'
import ProjectUsersList from '@/components/ProjectUsers/ProjectUsersList.vue'
import RowPaginationUsers from '@/components/RowPagination/RowPaginationUsers.vue'
import { apiInstance as api } from '@/api/apiInstance.js'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: {
    getUsers: vi.fn()
  }
}))

const mockToast = { success: vi.fn(), error: vi.fn() }
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    toast: mockToast,
    toastedPromise: (promise, { successMessage, errorMessage } = {}) =>
      promise.then(
        (data) => {
          if (successMessage) mockToast.success(successMessage)
          return data
        },
        (err) => {
          if (errorMessage) mockToast.error(errorMessage)
          throw err
        }
      )
  })
}))

describe('ProjectViewEditUsers.vue', () => {
  let core
  const props = { name: 'local-datashare' }

  const usersResponse = {
    items: [
      {
        uid: 'alice@example.org',
        name: 'Alice A',
        email: 'alice@example.org',
        permissions: [{ v1: 'PROJECT_ADMIN', v2: 'default::local-datashare' }]
      },
      {
        uid: 'bob@example.org',
        name: 'Bob B',
        email: 'bob@example.org',
        permissions: [{ v1: 'PROJECT_MEMBER', v2: 'default::local-datashare' }]
      }
    ],
    pagination: { count: 2, from: 0, size: 10, total: 2 }
  }

  function shallowMountComponent(extraProps = {}) {
    return shallowMount(ProjectViewEditUsers, {
      global: { plugins: core.plugins },
      props: { ...props, ...extraProps }
    })
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    core = CoreSetup.init()
    core.createPinia()
    core.useAll().useRouterWithoutGuards()
    await core.router.replace({ query: {} })
    api.getUsers.mockResolvedValue({ items: [] })
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('renders a ProjectUsersList', () => {
    const wrapper = shallowMountComponent()
    expect(wrapper.findComponent(ProjectUsersList).exists()).toBe(true)
  })

  it('maps getUsers items to { uid, name, email } and extracts role from permissions', async () => {
    api.getUsers.mockResolvedValue(usersResponse)
    const wrapper = shallowMountComponent()
    await flushPromises()
    const list = wrapper.findComponent(ProjectUsersList)
    expect(list.props('users')).toEqual([
      { uid: 'alice@example.org', name: 'Alice A', email: 'alice@example.org', role: 'PROJECT_ADMIN' },
      { uid: 'bob@example.org', name: 'Bob B', email: 'bob@example.org', role: 'PROJECT_MEMBER' }
    ])
  })

  it('maps a user with no permission for the current project to role NO_ROLE', async () => {
    api.getUsers.mockResolvedValue({
      items: [
        {
          uid: 'jdoe',
          name: 'Jane D',
          email: 'jdoe@example.org',
          permissions: [{ v1: 'PROJECT_ADMIN', v2: 'default::other-project' }]
        }
      ],
      pagination: { count: 1, from: 0, size: 10, total: 1 }
    })
    const wrapper = shallowMountComponent()
    await flushPromises()
    const list = wrapper.findComponent(ProjectUsersList)
    expect(list.props('users')).toEqual([
      { uid: 'jdoe', name: 'Jane D', email: 'jdoe@example.org', role: 'NO_ROLE' }
    ])
  })

  it('passes an empty users array before the API resolves', () => {
    const wrapper = shallowMountComponent()
    const list = wrapper.findComponent(ProjectUsersList)
    expect(list.props('users')).toEqual([])
  })

  it('passes an empty users array when the API returns an empty items list', async () => {
    api.getUsers.mockResolvedValue({ items: [], pagination: { count: 0, from: 0, size: 10, total: 0 } })
    const wrapper = shallowMountComponent()
    await flushPromises()
    expect(wrapper.findComponent(ProjectUsersList).props('users')).toEqual([])
  })

  it('passes an empty users array when items is null', async () => {
    api.getUsers.mockResolvedValue({ items: null })
    const wrapper = shallowMountComponent()
    await flushPromises()
    expect(wrapper.findComponent(ProjectUsersList).props('users')).toEqual([])
  })

  it('shows a toast error when the API call fails', async () => {
    api.getUsers.mockRejectedValue(new Error('Network error'))
    shallowMountComponent()
    await flushPromises()
    expect(mockToast.error).toHaveBeenCalledOnce()
  })

  it('still renders ProjectUsersList with empty users after a failed API call', async () => {
    api.getUsers.mockRejectedValue(new Error('Network error'))
    const wrapper = shallowMountComponent()
    await flushPromises()
    expect(wrapper.findComponent(ProjectUsersList).exists()).toBe(true)
    expect(wrapper.findComponent(ProjectUsersList).props('users')).toEqual([])
  })

  it('passes the project name to ProjectUsersList', async () => {
    const wrapper = shallowMountComponent()
    await flushPromises()
    expect(wrapper.findComponent(ProjectUsersList).props('project')).toBe('local-datashare')
  })

  it('renders a RowPaginationUsers component', async () => {
    const wrapper = shallowMountComponent()
    await flushPromises()
    expect(wrapper.findComponent(RowPaginationUsers).exists()).toBe(true)
  })

  it('passes totalRows from getUsers pagination.total to RowPaginationUsers', async () => {
    api.getUsers.mockResolvedValue(usersResponse)
    const wrapper = shallowMountComponent()
    await flushPromises()
    expect(wrapper.findComponent(RowPaginationUsers).attributes('total-rows')).toBe('2')
  })

  it('sets totalRows to 0 when pagination is missing', async () => {
    api.getUsers.mockResolvedValue({ items: [] })
    const wrapper = shallowMountComponent()
    await flushPromises()
    expect(wrapper.findComponent(RowPaginationUsers).attributes('total-rows')).toBe('0')
  })

  describe('url-driven pagination and search', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('refetches users with updated from/size when page changes', async () => {
      const wrapper = shallowMountComponent()
      await vi.runAllTimersAsync()
      expect(api.getUsers).toBeCalledWith(expect.objectContaining({ from: 0, size: 10 }))

      wrapper.findComponent(RowPaginationUsers).vm.$emit('update:page', 2)
      await vi.runAllTimersAsync()
      expect(api.getUsers).toBeCalledWith(expect.objectContaining({ from: 10, size: 10 }))
    })

    it('reflects the page from the URL query on mount', async () => {
      await core.router.push({ query: { page: '3' } })
      const wrapper = shallowMountComponent()
      await vi.runAllTimersAsync()
      expect(wrapper.findComponent(RowPaginationUsers).attributes('page')).toBe('3')
      expect(api.getUsers).toBeCalledWith(expect.objectContaining({ from: 20, size: 10 }))
    })

    it('refetches users with the new sort/desc params when ProjectUsersList emits update:sort', async () => {
      const wrapper = shallowMountComponent()
      await vi.runAllTimersAsync()
      api.getUsers.mockClear()

      wrapper.findComponent(ProjectUsersList).vm.$emit('update:sort', 'email')
      await vi.runAllTimersAsync()

      expect(api.getUsers).toHaveBeenCalledWith(expect.objectContaining({ sort: 'email' }))
    })

    it('refetches users with the new desc param when ProjectUsersList emits update:order', async () => {
      const wrapper = shallowMountComponent()
      await vi.runAllTimersAsync()
      api.getUsers.mockClear()

      wrapper.findComponent(ProjectUsersList).vm.$emit('update:order', 'desc')
      await vi.runAllTimersAsync()

      expect(api.getUsers).toHaveBeenCalledWith(expect.objectContaining({ desc: true }))
    })

    it('keeps the current page when sort changes', async () => {
      const wrapper = shallowMountComponent()
      await vi.runAllTimersAsync()

      wrapper.findComponent(RowPaginationUsers).vm.$emit('update:page', 2)
      await vi.runAllTimersAsync()

      api.getUsers.mockClear()
      wrapper.findComponent(ProjectUsersList).vm.$emit('update:sort', 'email')
      await vi.runAllTimersAsync()

      expect(api.getUsers).toHaveBeenCalledWith(expect.objectContaining({ from: 10 }))
    })
  })

  describe('pagination adjustment on user:deleted', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('goes back one page when the deleted user was the only one on a page > 1', async () => {
      api.getUsers.mockResolvedValue(usersResponse)
      const wrapper = shallowMountComponent()
      await vi.runAllTimersAsync()

      api.getUsers.mockResolvedValueOnce({
        items: [{ uid: 'jdoe@example.org', name: 'Jane D', email: 'jdoe@example.org', permissions: [] }],
        pagination: { count: 1, from: 10, size: 10, total: 11 }
      })
      wrapper.findComponent(RowPaginationUsers).vm.$emit('update:page', 2)
      await vi.runAllTimersAsync()

      api.getUsers.mockClear()
      api.getUsers.mockResolvedValue(usersResponse)
      wrapper.findComponent(ProjectUsersList).vm.$emit('user:deleted', { uid: 'jdoe@example.org' })
      await vi.runAllTimersAsync()

      expect(wrapper.findComponent(RowPaginationUsers).attributes('page')).toBe('1')
      expect(api.getUsers).toHaveBeenCalledWith(expect.objectContaining({ from: 0 }))
    })

    it('stays on page 1 when the deleted user was the only one on page 1', async () => {
      api.getUsers.mockResolvedValue({
        items: [{ uid: 'jdoe@example.org', name: 'Jane D', email: 'jdoe@example.org', permissions: [] }],
        pagination: { count: 1, from: 0, size: 10, total: 1 }
      })
      const wrapper = shallowMountComponent()
      await vi.runAllTimersAsync()

      api.getUsers.mockClear()
      wrapper.findComponent(ProjectUsersList).vm.$emit('user:deleted', { uid: 'jdoe@example.org' })
      await vi.runAllTimersAsync()

      expect(wrapper.findComponent(RowPaginationUsers).attributes('page')).toBe('1')
      expect(api.getUsers).toHaveBeenCalledWith(expect.objectContaining({ from: 0 }))
    })

    it('does not change page when other users remain on the current page after deletion', async () => {
      api.getUsers.mockResolvedValue(usersResponse)
      const wrapper = shallowMountComponent()
      await vi.runAllTimersAsync()

      wrapper.findComponent(RowPaginationUsers).vm.$emit('update:page', 2)
      await vi.runAllTimersAsync()

      api.getUsers.mockClear()
      wrapper.findComponent(ProjectUsersList).vm.$emit('user:deleted', { uid: 'alice@example.org' })
      await vi.runAllTimersAsync()

      expect(wrapper.findComponent(RowPaginationUsers).attributes('page')).toBe('2')
      expect(api.getUsers).toHaveBeenCalledWith(expect.objectContaining({ from: 10 }))
    })
  })

  describe('pagination adjustment on roles:revoked (batch revoke)', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('refetches users exactly once when several roles are revoked in a single save', async () => {
      api.getUsers.mockResolvedValue(usersResponse)
      const wrapper = shallowMountComponent()
      await vi.runAllTimersAsync()

      api.getUsers.mockClear()
      wrapper.findComponent(ProjectUsersList).vm.$emit('roles:revoked', ['alice@example.org', 'bob@example.org'])
      await vi.runAllTimersAsync()

      expect(api.getUsers).toHaveBeenCalledOnce()
    })

    it('goes back one page when every user on a page > 1 was revoked in one save', async () => {
      api.getUsers.mockResolvedValue(usersResponse)
      const wrapper = shallowMountComponent()
      await vi.runAllTimersAsync()

      api.getUsers.mockResolvedValueOnce(usersResponse)
      wrapper.findComponent(RowPaginationUsers).vm.$emit('update:page', 2)
      await vi.runAllTimersAsync()

      api.getUsers.mockClear()
      api.getUsers.mockResolvedValue(usersResponse)
      wrapper.findComponent(ProjectUsersList).vm.$emit('roles:revoked', ['alice@example.org', 'bob@example.org'])
      await vi.runAllTimersAsync()

      expect(wrapper.findComponent(RowPaginationUsers).attributes('page')).toBe('1')
      expect(api.getUsers).toHaveBeenCalledWith(expect.objectContaining({ from: 0 }))
    })

    it('does not change page when some users remain on the current page after a batch revoke', async () => {
      api.getUsers.mockResolvedValue(usersResponse)
      const wrapper = shallowMountComponent()
      await vi.runAllTimersAsync()

      wrapper.findComponent(RowPaginationUsers).vm.$emit('update:page', 2)
      await vi.runAllTimersAsync()

      api.getUsers.mockClear()
      wrapper.findComponent(ProjectUsersList).vm.$emit('roles:revoked', ['alice@example.org'])
      await vi.runAllTimersAsync()

      expect(wrapper.findComponent(RowPaginationUsers).attributes('page')).toBe('2')
      expect(api.getUsers).toHaveBeenCalledWith(expect.objectContaining({ from: 10 }))
    })
  })

  describe('refetch on roles:saved', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('refetches users when ProjectUsersList emits roles:saved', async () => {
      api.getUsers.mockResolvedValue(usersResponse)
      const wrapper = shallowMountComponent()
      await vi.runAllTimersAsync()

      api.getUsers.mockClear()
      wrapper.findComponent(ProjectUsersList).vm.$emit('roles:saved')
      await vi.runAllTimersAsync()

      expect(api.getUsers).toHaveBeenCalledOnce()
    })
  })
})
