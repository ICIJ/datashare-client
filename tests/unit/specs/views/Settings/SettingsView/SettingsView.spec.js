import { mount, shallowMount, flushPromises } from '@vue/test-utils'
import { ButtonIcon } from '@icij/murmur'

import CoreSetup from '~tests/unit/CoreSetup'
import SettingsView from '@/views/Settings/SettingsView/SettingsView'
import SettingsViewUsers from '@/views/Settings/SettingsView/SettingsViewUsers.vue'
import SettingsViewUsersCreateModal from '@/views/Settings/SettingsView/SettingsViewUsersCreateModal.vue'
import InstanceUsersList from '@/components/InstanceUsers/InstanceUsersList.vue'
import RowPaginationUsers from '@/components/RowPagination/RowPaginationUsers.vue'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch.vue'
import { MODE_NAME } from '@/mode'
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

describe('SettingsView', () => {
  let plugins
  let core

  beforeEach(() => {
    core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  it('shows the Users tab when mode is SERVER and the user is instance admin', () => {
    core.config.set('mode', MODE_NAME.SERVER)
    core.config.set('policies', INSTANCE_ADMIN_POLICIES)
    const wrapper = mount(SettingsView, { global: { plugins } })

    expect(wrapper.text()).toContain('Users')
  })

  it('shows the Users tab when mode is SERVER and the user is domain admin', () => {
    core.config.set('mode', MODE_NAME.SERVER)
    core.config.set('policies', DOMAIN_ADMIN_POLICIES)
    const wrapper = mount(SettingsView, { global: { plugins } })

    expect(wrapper.text()).toContain('Users')
  })

  it('hides the Users tab when the user is not domain or instance admin', () => {
    core.config.set('mode', MODE_NAME.SERVER)
    core.config.set('policies', PROJECT_ADMIN_POLICIES)
    const wrapper = mount(SettingsView, { global: { plugins } })

    expect(wrapper.text()).not.toContain('Users')
  })

  it('hides the Users tab when mode is not SERVER, even for an instance admin', () => {
    core.config.set('mode', MODE_NAME.LOCAL)
    core.config.set('policies', INSTANCE_ADMIN_POLICIES)
    const wrapper = mount(SettingsView, { global: { plugins } })

    expect(wrapper.text()).not.toContain('Users')
  })
})

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

  it('fetches users on mount with the instance-wide params', async () => {
    api.getUsers.mockResolvedValue(usersResponse)
    shallowMountComponent()
    await flushPromises()
    expect(api.getUsers).toHaveBeenCalledWith(
      expect.objectContaining({ domain: 'default', index: null, noRole: true, from: 0, size: 10 })
    )
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

    expect(wrapper.findComponent(SettingsViewUsersCreateModal).props('modelValue')).toBe(true)
  })

  it('refetches users when the create-user modal emits user:created', async () => {
    api.getUsers.mockResolvedValue(usersResponse)
    const wrapper = shallowMountComponent()
    await flushPromises()
    api.getUsers.mockClear()

    wrapper.findComponent(SettingsViewUsersCreateModal).vm.$emit('user:created', { uid: 'alice@example.org' })
    await flushPromises()

    expect(api.getUsers).toHaveBeenCalledOnce()
  })

  describe('user:updated', () => {
    it('refetches users when InstanceUsersList emits user:updated', async () => {
      api.getUsers.mockResolvedValue(usersResponse)
      const wrapper = shallowMountComponent()
      await flushPromises()
      api.getUsers.mockClear()

      wrapper.findComponent(InstanceUsersList).vm.$emit('user:updated', { uid: 'alice@example.org' })
      await flushPromises()

      expect(api.getUsers).toHaveBeenCalledOnce()
    })

    it('does not toggle the loading flag (a role grant/revoke must not unmount the open roles modal)', async () => {
      api.getUsers.mockResolvedValue(usersResponse)
      const wrapper = shallowMountComponent()
      await flushPromises()

      let resolveFetch
      api.getUsers.mockReturnValue(
        new Promise((resolve) => {
          resolveFetch = () => resolve(usersResponse)
        })
      )

      wrapper.findComponent(InstanceUsersList).vm.$emit('user:updated', { uid: 'alice@example.org' })
      await wrapper.vm.$nextTick()

      // The refetch triggered by user:updated must be a quiet one: PageTable swaps its whole
      // tbody for a loading skeleton when `loading` is true, which would unmount every row
      // (and the open roles modal's local state with it).
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

      wrapper.findComponent(InstanceUsersList).vm.$emit('user:deleted', { uid: 'alice@example.org' })
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

      wrapper.findComponent(InstanceUsersList).vm.$emit('user:deleted', { uid: 'alice@example.org' })
      await flushPromises()

      expect(api.getUsers).toHaveBeenCalledWith(expect.objectContaining({ from: 0, size: 10 }))
    })
  })
})
