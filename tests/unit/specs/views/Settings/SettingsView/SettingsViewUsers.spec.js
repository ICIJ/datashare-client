import { shallowMount, flushPromises } from '@vue/test-utils'
import { ButtonIcon } from '@icij/murmur'

import CoreSetup from '~tests/unit/CoreSetup'
import SettingsViewUsers from '@/views/Settings/SettingsView/SettingsViewUsers.vue'
import SettingsViewUsersCreateModal from '@/views/Settings/SettingsView/SettingsViewUsersCreateModal.vue'
import SettingsViewUsersDeleteModal from '@/views/Settings/SettingsView/SettingsViewUsersDeleteModal.vue'
import SettingsViewUsersEditModal from '@/views/Settings/SettingsView/SettingsViewUsersEditModal.vue'
import SettingsViewUsersRolesModal from '@/views/Settings/SettingsView/SettingsViewUsersRolesModal.vue'
import InstanceUsersList from '@/components/InstanceUsers/InstanceUsersList.vue'
import RowPaginationUsers from '@/components/RowPagination/RowPaginationUsers.vue'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch.vue'
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

const INSTANCE_ADMIN_POLICIES = [{ projectId: '*', domainId: '*', role: 'INSTANCE_ADMIN' }]
const DOMAIN_ADMIN_POLICIES = [{ projectId: '*', domainId: '*', role: 'DOMAIN_ADMIN' }]
const PROJECT_ADMIN_POLICIES = [{ projectId: 'foo', domainId: 'default', role: 'PROJECT_ADMIN' }]

describe('SettingsViewUsers.vue', () => {
  let core

  const usersResponse = {
    items: [
      { uid: 'alice@example.org', name: 'Alice A', email: 'alice@example.org', permissions: [] },
      { uid: 'bob@example.org', name: 'Bob B', email: 'bob@example.org', permissions: [] }
    ],
    pagination: { count: 2, from: 0, size: 10, total: 2 }
  }

  function shallowMountComponent() {
    return shallowMount(SettingsViewUsers, {
      global: { plugins: core.plugins, renderStubDefaultSlot: true }
    })
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    core = CoreSetup.init()
    core.createPinia()
    core.useAll().useRouterWithoutGuards()
    await core.router.replace({ query: {} })
    core.config.set('auth', 'form')
    core.config.set('policies', INSTANCE_ADMIN_POLICIES)
    api.getUsers.mockResolvedValue({ items: [] })
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('shows the no-access message and does not fetch users when the viewer is not an instance admin', async () => {
    core.config.set('policies', PROJECT_ADMIN_POLICIES)
    const wrapper = shallowMountComponent()
    await flushPromises()
    expect(wrapper.text()).toContain(core.i18n.global.t('settings.users.noAccess'))
    expect(api.getUsers).not.toHaveBeenCalled()
  })

  it('renders an InstanceUsersList for an instance admin', () => {
    const wrapper = shallowMountComponent()
    expect(wrapper.findComponent(InstanceUsersList).exists()).toBe(true)
  })

  it('renders an InstanceUsersList for a domain admin', () => {
    core.config.set('policies', DOMAIN_ADMIN_POLICIES)
    const wrapper = shallowMountComponent()
    expect(wrapper.findComponent(InstanceUsersList).exists()).toBe(true)
  })

  it('hides "Create user" from a domain admin and ignores /settings/users/create, since accounts are instance-wide', async () => {
    core.config.set('policies', DOMAIN_ADMIN_POLICIES)
    await core.router.push('/settings/users/create')
    const wrapper = shallowMountComponent()
    expect(wrapper.findComponent(ButtonIcon).exists()).toBe(false)
    expect(wrapper.findComponent(SettingsViewUsersCreateModal).props('modelValue')).toBe(false)
  })

  it('lists users with no role too under OAuth', async () => {
    core.config.set('auth', 'oauth')
    api.getUsers.mockResolvedValue(usersResponse)
    shallowMountComponent()
    await flushPromises()
    expect(api.getUsers).toHaveBeenCalledWith(expect.objectContaining({ noRole: true }))
  })

  it('fetches users on mount with the instance-wide params', async () => {
    api.getUsers.mockResolvedValue(usersResponse)
    shallowMountComponent()
    await flushPromises()
    expect(api.getUsers).toHaveBeenCalledWith(
      expect.objectContaining({ domain: 'default', index: null, noRole: true, from: 0, size: 10 })
    )
  })

  // A users store that can't list accounts answers 501: that's not a failure to report, there's
  // just no list to show.
  it('shows that the users provider cannot list accounts on a 501, instead of the list and an error toast', async () => {
    api.getUsers.mockRejectedValue({ response: { status: 501 } })
    const wrapper = shallowMountComponent()
    await flushPromises()
    expect(wrapper.text()).toContain(core.i18n.global.t('settings.users.listUnsupported'))
    expect(wrapper.findComponent(InstanceUsersList).exists()).toBe(false)
    expect(mockToast.error).not.toHaveBeenCalled()
  })

  it('still reports other errors with a toast', async () => {
    api.getUsers.mockRejectedValue({ response: { status: 500 } })
    const wrapper = shallowMountComponent()
    await flushPromises()
    expect(mockToast.error).toHaveBeenCalledOnce()
    expect(wrapper.findComponent(InstanceUsersList).exists()).toBe(true)
  })

  it('falls back to 10 users per page when perPage in the URL is not a number', async () => {
    await core.router.push({ path: '/settings/users', query: { perPage: 'abc' } })
    shallowMountComponent()
    await flushPromises()
    expect(api.getUsers).toHaveBeenCalledWith(expect.objectContaining({ from: 0, size: 10 }))
  })

  it('passes fetched users to InstanceUsersList', async () => {
    api.getUsers.mockResolvedValue(usersResponse)
    const wrapper = shallowMountComponent()
    await flushPromises()
    expect(wrapper.findComponent(InstanceUsersList).props('users')).toEqual(usersResponse.items)
  })

  it('passes totalRows from pagination.total to RowPaginationUsers', async () => {
    api.getUsers.mockResolvedValue(usersResponse)
    const wrapper = shallowMountComponent()
    await flushPromises()
    expect(wrapper.findComponent(RowPaginationUsers).attributes('total-rows')).toBe('2')
  })

  describe('search debounce and pagination refetch', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('drops a search typed just before leaving the page', async () => {
      const wrapper = shallowMountComponent()
      await vi.runAllTimersAsync()
      api.getUsers.mockClear()

      await wrapper.findComponent(FormControlSearch).vm.$emit('update:modelValue', 'alice')
      wrapper.unmount()
      await vi.runAllTimersAsync()

      expect(api.getUsers).not.toHaveBeenCalled()
    })

    it('debounces search input before refetching with the query', async () => {
      const wrapper = shallowMountComponent()
      await vi.runAllTimersAsync()
      api.getUsers.mockClear()

      await wrapper.findComponent(FormControlSearch).vm.$emit('update:modelValue', 'alice')
      expect(api.getUsers).not.toHaveBeenCalled()

      await vi.runAllTimersAsync()
      expect(api.getUsers).toHaveBeenCalledWith(expect.objectContaining({ q: 'alice' }))
    })

    it('refetches users with updated from/size when the page changes', async () => {
      const wrapper = shallowMountComponent()
      await vi.runAllTimersAsync()
      expect(api.getUsers).toBeCalledWith(expect.objectContaining({ from: 0, size: 10 }))

      wrapper.findComponent(RowPaginationUsers).vm.$emit('update:page', 2)
      await vi.runAllTimersAsync()
      expect(api.getUsers).toBeCalledWith(expect.objectContaining({ from: 10, size: 10 }))
    })

    it('refetches users with the new sort/desc params when InstanceUsersList emits update:sort', async () => {
      const wrapper = shallowMountComponent()
      await vi.runAllTimersAsync()
      api.getUsers.mockClear()

      wrapper.findComponent(InstanceUsersList).vm.$emit('update:sort', 'email')
      await vi.runAllTimersAsync()

      expect(api.getUsers).toHaveBeenCalledWith(expect.objectContaining({ sort: 'email' }))
    })
  })

  it('opens the create-user modal when the "+ Create user" button is clicked', async () => {
    const wrapper = shallowMountComponent()
    expect(wrapper.findComponent(SettingsViewUsersCreateModal).props('modelValue')).toBe(false)

    await wrapper.findComponent(ButtonIcon).trigger('click')
    await flushPromises()

    expect(core.router.currentRoute.value.path).toBe('/settings/users/create')
    expect(wrapper.findComponent(SettingsViewUsersCreateModal).props('modelValue')).toBe(true)
  })

  it('opens the create-user modal when landing on /settings/users/create', async () => {
    await core.router.push('/settings/users/create')
    const wrapper = shallowMountComponent()
    expect(wrapper.findComponent(SettingsViewUsersCreateModal).props('modelValue')).toBe(true)
  })

  it('goes back to /settings/users when the create-user modal closes, keeping the list query', async () => {
    await core.router.push({ path: '/settings/users/create', query: { q: 'ali' } })
    const wrapper = shallowMountComponent()
    wrapper.findComponent(SettingsViewUsersCreateModal).vm.$emit('update:modelValue', false)
    await flushPromises()
    expect(core.router.currentRoute.value).toMatchObject({ path: '/settings/users', query: { q: 'ali' } })
  })

  // The roles/edit/delete modals live on the page and open from /settings/users/<action>/<uid>,
  // with the user looked up by uid (it may not be on the current page of the list).
  describe('routed user modals', () => {
    const zoe = { uid: 'zoe@example.org', name: 'Zoe', email: 'zoe@example.org', permissions: [] }

    // The backend resolves uid exactly, so an unknown uid comes back as an empty page
    beforeEach(() => {
      api.getUsers.mockImplementation(async ({ uid }) => {
        if (!uid) return usersResponse
        const items = uid === zoe.uid ? [zoe] : []
        return { items, pagination: { total: items.length } }
      })
    })

    it.each([
      ['manage', SettingsViewUsersRolesModal],
      ['edit', SettingsViewUsersEditModal],
      ['delete', SettingsViewUsersDeleteModal]
    ])('opens the %s modal for the user named in the URL', async (action, modal) => {
      await core.router.push(`/settings/users/${action}/${zoe.uid}`)
      const wrapper = shallowMountComponent()
      await flushPromises()
      expect(wrapper.findComponent(modal).props()).toMatchObject({ modelValue: true, user: zoe, notFound: false })
    })

    // A uid search by q only matches a substring, so a short uid could fall outside the page and
    // the modal would claim the user does not exist (ICIJ/datashare#2434).
    it('looks the routed user up by exact uid, not with a q search over a page of hits', async () => {
      await core.router.push(`/settings/users/edit/${zoe.uid}`)
      shallowMountComponent()
      await flushPromises()
      // noRole stays on: a user holding no role in the scope must still resolve
      expect(api.getUsers).toHaveBeenCalledWith(expect.objectContaining({ uid: zoe.uid, noRole: true }))
      expect(api.getUsers).not.toHaveBeenCalledWith(expect.objectContaining({ q: zoe.uid }))
    })

    it.each([
      ['manage', SettingsViewUsersRolesModal],
      ['edit', SettingsViewUsersEditModal],
      ['delete', SettingsViewUsersDeleteModal]
    ])('flags the %s modal as not found when the URL names an unknown user', async (action, modal) => {
      await core.router.push(`/settings/users/${action}/ghost`)
      const wrapper = shallowMountComponent()
      await flushPromises()
      expect(wrapper.findComponent(modal).props()).toMatchObject({ modelValue: true, user: { uid: 'ghost' }, notFound: true })
    })

    it('does not open the delete modal for the viewer\'s own account', async () => {
      vi.spyOn(core.auth, 'getUsername').mockResolvedValue(zoe.uid)
      await core.router.push(`/settings/users/delete/${zoe.uid}`)
      const wrapper = shallowMountComponent()
      await flushPromises()
      expect(wrapper.findComponent(SettingsViewUsersDeleteModal).props('modelValue')).toBe(false)
    })

    it('does not open the delete modal before the viewer\'s username resolves', async () => {
      vi.spyOn(core.auth, 'getUsername').mockReturnValue(new Promise(() => {}))
      await core.router.push(`/settings/users/delete/${zoe.uid}`)
      const wrapper = shallowMountComponent()
      await flushPromises()
      expect(wrapper.findComponent(SettingsViewUsersDeleteModal).props('modelValue')).toBe(false)
    })

    it('reuses the first list request for a deep-linked user on the page, without a lookup of its own', async () => {
      // A list response still in flight, like a real request, when the lookup starts
      let resolveList
      api.getUsers.mockReturnValue(new Promise((resolve) => {
        resolveList = () => resolve(usersResponse)
      }))
      await core.router.push('/settings/users/edit/alice@example.org')
      const wrapper = shallowMountComponent()
      await flushPromises()
      resolveList()
      await flushPromises()
      expect(api.getUsers).toHaveBeenCalledOnce()
      expect(wrapper.findComponent(SettingsViewUsersEditModal).props()).toMatchObject({
        modelValue: true,
        user: usersResponse.items[0]
      })
    })

    it('does not look the user up for a viewer without access', async () => {
      core.config.set('policies', PROJECT_ADMIN_POLICIES)
      await core.router.push(`/settings/users/manage/${zoe.uid}`)
      shallowMountComponent()
      await flushPromises()
      expect(api.getUsers).not.toHaveBeenCalled()
    })

    it('reports a failed lookup and goes back to the list, instead of saying the user does not exist', async () => {
      api.getUsers.mockImplementation(async ({ uid }) => {
        if (uid === zoe.uid) throw new Error('timeout')
        return usersResponse
      })
      await core.router.push(`/settings/users/manage/${zoe.uid}`)
      const wrapper = shallowMountComponent()
      await flushPromises()
      expect(mockToast.error).toHaveBeenCalledWith(core.i18n.global.t('settings.users.fetchError'))
      expect(core.router.currentRoute.value.path).toBe('/settings/users')
      expect(wrapper.findComponent(SettingsViewUsersRolesModal).props('notFound')).toBe(false)
    })

    it('explains a 501 lookup as a provider that cannot list users, and goes back to the list', async () => {
      api.getUsers.mockRejectedValue({ response: { status: 501 } })
      await core.router.push(`/settings/users/manage/${zoe.uid}`)
      shallowMountComponent()
      await flushPromises()
      expect(mockToast.error).toHaveBeenCalledWith(core.i18n.global.t('settings.users.listUnsupported'))
      expect(core.router.currentRoute.value.path).toBe('/settings/users')
    })

    it('waits for the user lookup before opening a modal', async () => {
      api.getUsers.mockReturnValue(new Promise(() => {}))
      await core.router.push(`/settings/users/manage/${zoe.uid}`)
      const wrapper = shallowMountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.findComponent(SettingsViewUsersRolesModal).props('modelValue')).toBe(false)
    })

    it('opens the modal a list row asks for, keeping the list query', async () => {
      await core.router.push({ path: '/settings/users', query: { q: 'zo' } })
      const wrapper = shallowMountComponent()
      await flushPromises()
      wrapper.findComponent(InstanceUsersList).vm.$emit('open', { action: 'edit', uid: zoe.uid })
      await flushPromises()
      const { name, params, query } = core.router.currentRoute.value
      expect({ name, params, query }).toEqual({ name: 'settings.users', params: { action: 'edit', uid: zoe.uid }, query: { q: 'zo' } })
    })

    it.each(['edit', 'manage', 'delete'])('replaces /settings/users/%s without a uid with the plain list', async (action) => {
      await core.router.push({ path: `/settings/users/${action}`, query: { q: 'zo' } })
      shallowMountComponent()
      await flushPromises()
      expect(core.router.currentRoute.value).toMatchObject({ path: '/settings/users', query: { q: 'zo' } })
    })

    it('goes back to /settings/users when a routed modal closes', async () => {
      await core.router.push(`/settings/users/edit/${zoe.uid}`)
      const wrapper = shallowMountComponent()
      await flushPromises()
      wrapper.findComponent(SettingsViewUsersEditModal).vm.$emit('update:modelValue', false)
      await flushPromises()
      expect(core.router.currentRoute.value.path).toBe('/settings/users')
    })

    it('opens the roles modal for the new user once it is created, and refetches the list', async () => {
      const wrapper = shallowMountComponent()
      await flushPromises()
      api.getUsers.mockClear()

      wrapper.findComponent(SettingsViewUsersCreateModal).vm.$emit('user:created', { uid: zoe.uid })
      await flushPromises()

      expect(core.router.currentRoute.value.params).toEqual({ action: 'manage', uid: zoe.uid })
      expect(wrapper.findComponent(SettingsViewUsersRolesModal).props()).toMatchObject({ modelValue: true, user: zoe })
      expect(api.getUsers).toHaveBeenCalledWith(expect.objectContaining({ q: null, from: 0 }))
    })

    it('does not open the roles modal for a new user when the users provider cannot list accounts', async () => {
      api.getUsers.mockRejectedValue({ response: { status: 501 } })
      const wrapper = shallowMountComponent()
      await flushPromises()

      wrapper.findComponent(SettingsViewUsersCreateModal).vm.$emit('user:created', { uid: zoe.uid })
      await flushPromises()

      expect(core.router.currentRoute.value.params.action).toBeUndefined()
      expect(mockToast.error).not.toHaveBeenCalled()
    })

    it('takes a user listed on the current page from the list, without a lookup of its own', async () => {
      api.getUsers.mockResolvedValue(usersResponse)
      await core.router.push('/settings/users/manage/alice@example.org')
      const wrapper = shallowMountComponent()
      await flushPromises()
      api.getUsers.mockClear()

      const alice = { ...usersResponse.items[0], permissions: [{ v1: 'PROJECT_MEMBER', v2: 'default::project-a' }] }
      api.getUsers.mockResolvedValue({ ...usersResponse, items: [alice, usersResponse.items[1]] })
      wrapper.findComponent(SettingsViewUsersRolesModal).vm.$emit('user:updated', { uid: alice.uid })
      await flushPromises()

      expect(api.getUsers).toHaveBeenCalledOnce()
      expect(api.getUsers).toHaveBeenCalledWith(expect.objectContaining({ q: null }))
      expect(wrapper.findComponent(SettingsViewUsersRolesModal).props('user')).toEqual(alice)
    })

    it('waits for fresh data when reopening a user after an edit, instead of showing the cached one', async () => {
      await core.router.push(`/settings/users/edit/${zoe.uid}`)
      const wrapper = shallowMountComponent()
      await flushPromises()

      // Save then close: the refetch started by user:updated is dropped once the modal closes
      const renamed = { ...zoe, name: 'Zoe Renamed' }
      api.getUsers.mockImplementation(async ({ uid }) => (uid === zoe.uid ? { items: [renamed] } : usersResponse))
      wrapper.findComponent(SettingsViewUsersEditModal).vm.$emit('user:updated', { uid: zoe.uid })
      wrapper.findComponent(SettingsViewUsersEditModal).vm.$emit('update:modelValue', false)
      await flushPromises()

      let resolveLookup
      api.getUsers.mockImplementation(({ uid }) => (uid === zoe.uid
        ? new Promise((resolve) => {
          resolveLookup = () => resolve({ items: [renamed] })
        })
        : Promise.resolve(usersResponse)))
      await core.router.push(`/settings/users/edit/${zoe.uid}`)
      await flushPromises()
      expect(wrapper.findComponent(SettingsViewUsersEditModal).props('modelValue')).toBe(false)

      resolveLookup()
      await flushPromises()
      expect(wrapper.findComponent(SettingsViewUsersEditModal).props()).toMatchObject({ modelValue: true, user: renamed })
    })

    it('keeps the roles modal open while it refetches the user after a grant', async () => {
      await core.router.push(`/settings/users/manage/${zoe.uid}`)
      const wrapper = shallowMountComponent()
      await flushPromises()

      api.getUsers.mockReturnValue(new Promise(() => {}))
      wrapper.findComponent(SettingsViewUsersRolesModal).vm.$emit('user:updated', { uid: zoe.uid })
      await wrapper.vm.$nextTick()
      expect(wrapper.findComponent(SettingsViewUsersRolesModal).props('modelValue')).toBe(true)
    })

    it('refreshes the routed user and the list after a grant', async () => {
      await core.router.push(`/settings/users/manage/${zoe.uid}`)
      const wrapper = shallowMountComponent()
      await flushPromises()

      const granted = { ...zoe, permissions: [{ v1: 'PROJECT_MEMBER', v2: 'default::project-a' }] }
      api.getUsers.mockImplementation(async ({ uid }) => (uid === zoe.uid ? { items: [granted] } : usersResponse))
      api.getUsers.mockClear()
      wrapper.findComponent(SettingsViewUsersRolesModal).vm.$emit('user:updated', { uid: zoe.uid })
      await flushPromises()

      expect(api.getUsers).toHaveBeenCalledWith(expect.objectContaining({ uid: zoe.uid }))
      expect(api.getUsers).toHaveBeenCalledWith(expect.objectContaining({ q: null }))
      expect(wrapper.findComponent(SettingsViewUsersRolesModal).props('user')).toEqual(granted)
    })

    it('keeps the latest list when two refreshes answer out of order', async () => {
      api.getUsers.mockResolvedValue(usersResponse)
      await core.router.push('/settings/users/manage/alice@example.org')
      const wrapper = shallowMountComponent()
      await flushPromises()

      const alice = usersResponse.items[0]
      const withOneGrant = { ...alice, permissions: [{ v1: 'PROJECT_MEMBER', v2: 'default::project-a' }] }
      const withTwoGrants = { ...alice, permissions: [...withOneGrant.permissions, { v1: 'PROJECT_EDITOR', v2: 'default::project-b' }] }
      const responses = []
      api.getUsers.mockImplementation(() => new Promise((resolve) => {
        responses.push(user => resolve({ items: [user, usersResponse.items[1]], pagination: { total: 2 } }))
      }))
      const rolesModal = () => wrapper.findComponent(SettingsViewUsersRolesModal)
      rolesModal().vm.$emit('user:updated', { uid: alice.uid })
      rolesModal().vm.$emit('user:updated', { uid: alice.uid })
      // The second (latest) refresh answers first, then the first one, late and stale
      responses[1](withTwoGrants)
      await flushPromises()
      responses[0](withOneGrant)
      await flushPromises()

      expect(wrapper.findComponent(InstanceUsersList).props('users')[0]).toEqual(withTwoGrants)
      expect(rolesModal().props('user')).toEqual(withTwoGrants)
    })

    it('does not toast a refresh that fails after a newer one answered', async () => {
      api.getUsers.mockResolvedValue(usersResponse)
      await core.router.push('/settings/users/manage/alice@example.org')
      const wrapper = shallowMountComponent()
      await flushPromises()

      const responses = []
      api.getUsers.mockImplementation(() => new Promise((resolve, reject) => responses.push({ resolve, reject })))
      const rolesModal = () => wrapper.findComponent(SettingsViewUsersRolesModal)
      rolesModal().vm.$emit('user:updated', { uid: 'alice@example.org' })
      rolesModal().vm.$emit('user:updated', { uid: 'alice@example.org' })
      responses[1].resolve(usersResponse)
      await flushPromises()
      responses[0].reject({ response: { status: 500 } })
      await flushPromises()

      expect(mockToast.error).not.toHaveBeenCalled()
    })

    it('does not toggle the loading flag on a grant (a refresh must not unmount the list rows)', async () => {
      await core.router.push(`/settings/users/manage/${zoe.uid}`)
      const wrapper = shallowMountComponent()
      await flushPromises()

      let resolveFetch
      api.getUsers.mockReturnValue(
        new Promise((resolve) => {
          resolveFetch = () => resolve(usersResponse)
        })
      )

      wrapper.findComponent(SettingsViewUsersRolesModal).vm.$emit('user:updated', { uid: zoe.uid })
      await wrapper.vm.$nextTick()
      expect(wrapper.findComponent(InstanceUsersList).props('loading')).toBe(false)

      resolveFetch()
      await flushPromises()
      expect(wrapper.findComponent(InstanceUsersList).props('loading')).toBe(false)
    })
  })

  describe('user:deleted', () => {
    it('refetches users when not on the last page', async () => {
      api.getUsers.mockResolvedValue(usersResponse)
      const wrapper = shallowMountComponent()
      await flushPromises()
      api.getUsers.mockClear()

      wrapper.findComponent(SettingsViewUsersDeleteModal).vm.$emit('user:deleted', { uid: 'alice@example.org' })
      await flushPromises()

      expect(api.getUsers).toHaveBeenCalledOnce()
    })

    it('steps back a page when deleting the last row of a page beyond the first', async () => {
      api.getUsers.mockResolvedValueOnce({
        items: [{ uid: 'alice@example.org', name: 'Alice A', email: 'alice@example.org', permissions: [] }],
        pagination: { count: 1, from: 10, size: 10, total: 11 }
      })
      const wrapper = shallowMountComponent()
      await flushPromises()

      wrapper.findComponent(RowPaginationUsers).vm.$emit('update:page', 2)
      await flushPromises()
      api.getUsers.mockResolvedValue(usersResponse)
      api.getUsers.mockClear()

      wrapper.findComponent(SettingsViewUsersDeleteModal).vm.$emit('user:deleted', { uid: 'alice@example.org' })
      await flushPromises()

      expect(api.getUsers).toHaveBeenCalledWith(expect.objectContaining({ from: 0, size: 10 }))
    })

    it('stays on the page when the deleted user was not its last row', async () => {
      const lastRow = { items: [{ uid: 'alice@example.org', name: 'Alice A', email: 'alice@example.org', permissions: [] }], pagination: { total: 11 } }
      api.getUsers.mockResolvedValue(lastRow)
      await core.router.push({ path: '/settings/users', query: { page: 2 } })
      const wrapper = shallowMountComponent()
      await flushPromises()
      api.getUsers.mockClear()

      wrapper.findComponent(SettingsViewUsersDeleteModal).vm.$emit('user:deleted', { uid: 'someone-else@example.org' })
      await flushPromises()

      expect(api.getUsers).toHaveBeenCalledWith(expect.objectContaining({ from: 10, size: 10 }))
    })
  })
})
