import { flushPromises, mount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import CoreSetup from '~tests/unit/CoreSetup'
import SettingsViewApi from '@/views/Settings/SettingsView/SettingsViewApi'
import SettingsViewApiKeyForm from '@/views/Settings/SettingsView/SettingsViewApiKeyForm'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric'
import ProjectsButton from '@/components/Project/ProjectsButton'
import { MODE_NAME } from '@/mode'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      getApiKeys: vi.fn(),
      addApiKey: vi.fn(),
      removeApiKeyByHash: vi.fn()
    }
  }
})

const mockToast = { error: vi.fn(), success: vi.fn() }
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({ toast: mockToast })
}))

const mockConfirm = vi.fn().mockResolvedValue(true)
vi.mock('@/composables/useConfirmModal', () => ({
  useConfirmModal: () => ({ confirm: mockConfirm })
}))

const active = {
  hashedKey: 'aaa',
  projects: ['banana-papers'],
  creationDate: '2026-11-20T12:00:00Z',
  expirationDate: '2026-12-02T12:00:00Z'
}

const expired = {
  hashedKey: 'bbb',
  projects: [],
  creationDate: '2026-10-01T12:00:00Z',
  expirationDate: '2026-10-31T12:00:00Z'
}

describe('SettingsViewApi', () => {
  let plugins

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-11-25T12:00:00Z'))
    api.getApiKeys.mockResolvedValue([])
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
    core.config.set('projects', [{ name: 'banana-papers', label: 'Banana Papers' }])

    setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)
    core.config.merge({ mode: MODE_NAME.SERVER })
  })

  afterEach(async () => {
    vi.useRealTimers()
    removeCookie(process.env.VITE_DS_COOKIE_NAME)
    await flushPromises()
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should display a panel to generate the API key by default', () => {
    const wrapper = mount(SettingsViewApi, { global: { plugins } })
    expect(wrapper.find('.settings-view-api__create').exists()).toBeTruthy()
  })

  it('should display no keys by default', () => {
    const wrapper = mount(SettingsViewApi, { global: { plugins } })
    expect(wrapper.findAll('.settings-view-api__key')).toHaveLength(0)
  })

  it('should list one row per key', async () => {
    api.getApiKeys.mockResolvedValue([active, expired])
    const wrapper = mount(SettingsViewApi, { global: { plugins } })
    await flushPromises()

    expect(wrapper.findAll('.settings-view-api__key')).toHaveLength(2)
  })

  it('should show the project label of a scoped key', async () => {
    api.getApiKeys.mockResolvedValue([active, expired])
    const wrapper = mount(SettingsViewApi, { global: { plugins } })
    await flushPromises()

    const [row] = wrapper.findAll('.settings-view-api__key')
    expect(row.text()).toContain('Banana Papers')
  })

  it('should list the projects of a scoped key with the projects button', async () => {
    api.getApiKeys.mockResolvedValue([active, expired])
    const wrapper = mount(SettingsViewApi, { global: { plugins } })
    await flushPromises()

    const [row] = wrapper.findAll('.settings-view-api__key')
    expect(row.findComponent(ProjectsButton).props('projects')).toEqual(['banana-papers'])
  })

  it('should show the humanized name of a project the client does not know', async () => {
    api.getApiKeys.mockResolvedValue([{ ...active, projects: ['gone-leaks'] }])
    const wrapper = mount(SettingsViewApi, { global: { plugins } })
    await flushPromises()

    const [row] = wrapper.findAll('.settings-view-api__key')
    expect(row.text()).toContain('Gone Leaks')
  })

  it('should show "All projects" for an unscoped key', async () => {
    api.getApiKeys.mockResolvedValue([active, expired])
    const wrapper = mount(SettingsViewApi, { global: { plugins } })
    await flushPromises()

    const [, row] = wrapper.findAll('.settings-view-api__key')
    expect(row.text()).toContain('All projects')
  })

  it('should render the keys in the shared page table', async () => {
    api.getApiKeys.mockResolvedValue([active, expired])
    const wrapper = mount(SettingsViewApi, { global: { plugins } })
    await flushPromises()

    const table = wrapper.findComponent(PageTableGeneric)
    expect(table.findAll('.settings-view-api__key')).toHaveLength(2)
  })

  it('should show the expiration date in the same format as the creation date', async () => {
    api.getApiKeys.mockResolvedValue([active, expired])
    const wrapper = mount(SettingsViewApi, { global: { plugins } })
    await flushPromises()

    const [row] = wrapper.findAll('.settings-view-api__key')
    expect(row.text()).toContain('Nov 20, 2026')
    expect(row.text()).toContain('Dec 2, 2026')
    expect(row.text()).not.toContain('in 7 days')
  })

  it('should mute an expired key and badge it', async () => {
    api.getApiKeys.mockResolvedValue([active, expired])
    const wrapper = mount(SettingsViewApi, { global: { plugins } })
    await flushPromises()

    const [activeRow, expiredRow] = wrapper.findAll('.settings-view-api__key')
    expect(expiredRow.classes()).toContain('settings-view-api__key--expired')
    expect(expiredRow.text()).toContain('Expired')
    expect(activeRow.classes()).not.toContain('settings-view-api__key--expired')
    expect(activeRow.text()).not.toContain('Expired')
  })

  it('should delete only the confirmed key', async () => {
    api.getApiKeys.mockResolvedValue([active, expired])
    api.removeApiKeyByHash.mockResolvedValue('')
    const wrapper = mount(SettingsViewApi, { global: { plugins } })
    await flushPromises()

    await wrapper.find('.settings-view-api__key .settings-view-api__key__delete').trigger('click')
    await flushPromises()

    expect(api.removeApiKeyByHash).toBeCalledWith('doe', 'aaa')
    expect(api.getApiKeys).toBeCalledTimes(2)
  })

  it('should go back to the empty state after deleting the last key', async () => {
    api.getApiKeys.mockResolvedValueOnce([active]).mockResolvedValueOnce([])
    api.removeApiKeyByHash.mockResolvedValue('')
    const wrapper = mount(SettingsViewApi, { global: { plugins } })
    await flushPromises()
    expect(wrapper.find('.settings-view-api__create').exists()).toBeFalsy()

    await wrapper.find('.settings-view-api__key__delete').trigger('click')
    await flushPromises()

    expect(wrapper.find('.settings-view-api__create').exists()).toBeTruthy()
  })

  describe('creation modal', () => {
    const AppModalStub = { name: 'AppModal', props: ['modelValue'], emits: ['hidden'], template: '<div v-if="modelValue"><slot /></div>' }
    const stubs = { 'app-modal': AppModalStub }
    const payload = { projects: ['banana-papers'], expirationDate: '2026-12-25T12:00:00.000Z' }
    const created = {
      hashedKey: 'ccc',
      projects: [],
      creationDate: '2026-11-25T12:00:00Z',
      expirationDate: '2026-12-25T12:00:00Z'
    }

    async function createKey(wrapper) {
      await wrapper.find('.settings-view-api__create__button').trigger('click')
      wrapper.findComponent(SettingsViewApiKeyForm).vm.$emit('submit', payload)
      await flushPromises()
    }

    async function mountAndCreate() {
      api.getApiKeys.mockResolvedValueOnce([{ ...active }]).mockResolvedValueOnce([{ ...created }, { ...active }])
      api.addApiKey.mockResolvedValue({ apiKey: '123456abcdef' })
      const wrapper = mount(SettingsViewApi, { global: { plugins, stubs } })
      await flushPromises()
      await createKey(wrapper)
      return wrapper
    }

    it('should close the modal once the key is created', async () => {
      const wrapper = await mountAndCreate()
      const modal = wrapper.findComponent({ name: 'AppModal' })

      expect(wrapper.find('.settings-view-api-key-form').exists()).toBeFalsy()
      expect(modal.find('input[readonly]').exists()).toBeFalsy()
    })

    it('should toast the creation', async () => {
      await mountAndCreate()
      expect(mockToast.success).toBeCalledWith('API key created')
    })

    it('should badge the new key', async () => {
      const wrapper = await mountAndCreate()

      const newRows = wrapper.findAll('.settings-view-api__key--new')
      expect(newRows).toHaveLength(1)
      expect(newRows[0].text()).toContain('New')
      const activeRow = wrapper.findAll('.settings-view-api__key').at(1)
      expect(activeRow.classes()).not.toContain('settings-view-api__key--new')
      expect(activeRow.text()).not.toContain('New')
    })

    it('should show the new key under its row', async () => {
      const wrapper = await mountAndCreate()

      const table = wrapper.findComponent(PageTableGeneric)
      const input = table.find('.settings-view-api-key-created input[readonly]')
      expect(input.element.value).toBe('123456abcdef')
    })

    it('should reopen the panel with the key still there', async () => {
      const wrapper = await mountAndCreate()
      const toggle = wrapper.find('.settings-view-api__key--new .settings-view-api__key__toggle')

      await toggle.trigger('click')
      expect(wrapper.find('.settings-view-api-key-created').exists()).toBeFalsy()

      await toggle.trigger('click')
      const input = wrapper.find('.settings-view-api-key-created input[readonly]')
      expect(input.element.value).toBe('123456abcdef')
    })

    it('should show the key in the modal when the new row is not found', async () => {
      api.getApiKeys.mockResolvedValueOnce([{ ...active }]).mockResolvedValueOnce([{ ...active }])
      api.addApiKey.mockResolvedValue({ apiKey: '123456abcdef' })
      const wrapper = mount(SettingsViewApi, { global: { plugins, stubs } })
      await flushPromises()
      await createKey(wrapper)

      const modal = wrapper.findComponent({ name: 'AppModal' })
      const input = modal.find('.settings-view-api-key-created input[readonly]')
      expect(input.element.value).toBe('123456abcdef')
    })

    it('should show the key in the modal when the list fails to refresh', async () => {
      api.getApiKeys.mockResolvedValueOnce([{ ...active }]).mockRejectedValueOnce(new Error('network'))
      api.addApiKey.mockResolvedValue({ apiKey: '123456abcdef' })
      const wrapper = mount(SettingsViewApi, { global: { plugins, stubs } })
      await flushPromises()
      await createKey(wrapper)

      const modal = wrapper.findComponent({ name: 'AppModal' })
      const input = modal.find('.settings-view-api-key-created input[readonly]')
      expect(input.element.value).toBe('123456abcdef')
    })

    it('should show the key in the modal when several new rows are found', async () => {
      const other = { ...created, hashedKey: 'eee' }
      api.getApiKeys.mockResolvedValueOnce([{ ...active }]).mockResolvedValueOnce([{ ...other }, { ...created }, { ...active }])
      api.addApiKey.mockResolvedValue({ apiKey: '123456abcdef' })
      const wrapper = mount(SettingsViewApi, { global: { plugins, stubs } })
      await flushPromises()
      await createKey(wrapper)

      expect(wrapper.findAll('.settings-view-api__key--new')).toHaveLength(0)
      const modal = wrapper.findComponent({ name: 'AppModal' })
      const input = modal.find('.settings-view-api-key-created input[readonly]')
      expect(input.element.value).toBe('123456abcdef')
    })

    it('should only badge the latest key', async () => {
      const second = { ...created, hashedKey: 'ddd' }
      api.getApiKeys
        .mockResolvedValueOnce([{ ...active }])
        .mockResolvedValueOnce([{ ...created }, { ...active }])
        .mockResolvedValueOnce([{ ...second }, { ...created }, { ...active }])
      api.addApiKey
        .mockResolvedValueOnce({ apiKey: '123456abcdef' })
        .mockResolvedValueOnce({ apiKey: 'fedcba654321' })
      const wrapper = mount(SettingsViewApi, { global: { plugins, stubs } })
      await flushPromises()
      await createKey(wrapper)
      await createKey(wrapper)

      const newRows = wrapper.findAll('.settings-view-api__key--new')
      expect(newRows).toHaveLength(1)
      expect(newRows[0].text()).toContain('ddd')
      const inputs = wrapper.findAll('.settings-view-api-key-created input[readonly]')
      expect(inputs).toHaveLength(1)
      expect(inputs[0].element.value).toBe('fedcba654321')
      expect(wrapper.findAll('.page-table-generic__row-details')).toHaveLength(1)
    })

    it('should open the form when clicking "New API key"', async () => {
      const wrapper = mount(SettingsViewApi, { global: { plugins, stubs } })
      await flushPromises()
      expect(wrapper.find('.settings-view-api-key-form').exists()).toBeFalsy()

      await wrapper.find('.settings-view-api__create__button').trigger('click')

      expect(wrapper.find('.settings-view-api-key-form').exists()).toBeTruthy()
    })

    it('should create a key with the form payload', async () => {
      api.addApiKey.mockResolvedValue({ apiKey: '123456abcdef' })
      const wrapper = mount(SettingsViewApi, { global: { plugins, stubs } })
      await wrapper.find('.settings-view-api__create__button').trigger('click')

      wrapper.findComponent(SettingsViewApiKeyForm).vm.$emit('submit', payload)
      await flushPromises()

      expect(api.addApiKey).toBeCalledWith('doe', payload)
    })

    it('should stay on the form and toast the backend message on a 400', async () => {
      const error = { response: { status: 400, data: { error: 'projects not granted: banana-papers' } } }
      api.addApiKey.mockRejectedValue(error)
      const wrapper = mount(SettingsViewApi, { global: { plugins, stubs } })
      await wrapper.find('.settings-view-api__create__button').trigger('click')

      wrapper.findComponent(SettingsViewApiKeyForm).vm.$emit('submit', payload)
      await flushPromises()

      expect(mockToast.error).toBeCalledWith(expect.stringContaining('projects not granted: banana-papers'))
      expect(wrapper.find('.settings-view-api-key-form').exists()).toBeTruthy()
      expect(mockToast.success).not.toBeCalled()
    })

    it('should create one key on a double submit', async () => {
      api.addApiKey.mockReturnValue(new Promise(() => {}))
      const wrapper = mount(SettingsViewApi, { global: { plugins, stubs }, attachTo: document.body })
      await wrapper.find('.settings-view-api__create__button').trigger('click')

      await wrapper.find('.settings-view-api-key-form__submit').trigger('click')
      await wrapper.find('.settings-view-api-key-form__submit').trigger('click')

      expect(api.addApiKey).toBeCalledTimes(1)
      wrapper.unmount()
    })
  })
})
