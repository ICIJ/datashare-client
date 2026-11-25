import { flushPromises, mount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import CoreSetup from '~tests/unit/CoreSetup'
import SettingsViewApi from '@/views/Settings/SettingsView/SettingsViewApi'
import SettingsViewApiKeyForm from '@/views/Settings/SettingsView/SettingsViewApiKeyForm'
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

  it('should show the Claude Code command to connect Datashare MCP with the new key', async () => {
    api.addApiKey.mockResolvedValue({ apiKey: '123456abcdef' })
    const stubs = { 'app-modal': { template: '<div><slot /></div>' } }
    const wrapper = mount(SettingsViewApi, { global: { plugins, stubs } })
    await wrapper.vm.addApiKey({ projects: [] })

    const command = wrapper.find('.settings-view-api__mcp__snippet').text()
    expect(command).toContain('claude mcp add --transport http datashare http://localhost:9009/api/mcp')
    expect(command).toContain('--header "Authorization: Bearer 123456abcdef"')
  })

  it('should open the Claude Code tab by default', async () => {
    api.addApiKey.mockResolvedValue({ apiKey: '123456abcdef' })
    const stubs = { 'app-modal': { template: '<div><slot /></div>' } }
    const wrapper = mount(SettingsViewApi, { global: { plugins, stubs } })
    await wrapper.vm.addApiKey({ projects: [] })
    await flushPromises()

    expect(wrapper.find('.settings-view-api__mcp .nav-link.active').text()).toBe('Claude Code')
  })

  it('should highlight the key as a string in the Claude Code command', async () => {
    api.addApiKey.mockResolvedValue({ apiKey: '123456abcdef' })
    const stubs = { 'app-modal': { template: '<div><slot /></div>' } }
    const wrapper = mount(SettingsViewApi, { global: { plugins, stubs } })
    await wrapper.vm.addApiKey({ projects: [] })
    await vi.waitFor(() => expect(wrapper.find('.settings-view-api__mcp__snippet .tok-string').exists()).toBe(true))

    const string = wrapper.find('.settings-view-api__mcp__snippet .tok-string').text()
    expect(string).toBe('"Authorization: Bearer 123456abcdef"')
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

  it('should show the raw name of a project the client does not know', async () => {
    api.getApiKeys.mockResolvedValue([{ ...active, projects: ['gone-leaks'] }])
    const wrapper = mount(SettingsViewApi, { global: { plugins } })
    await flushPromises()

    const [row] = wrapper.findAll('.settings-view-api__key')
    expect(row.text()).toContain('gone-leaks')
  })

  it('should show "All projects" for an unscoped key', async () => {
    api.getApiKeys.mockResolvedValue([active, expired])
    const wrapper = mount(SettingsViewApi, { global: { plugins } })
    await flushPromises()

    const [, row] = wrapper.findAll('.settings-view-api__key')
    expect(row.text()).toContain('All projects')
  })

  it('should show when an active key expires', async () => {
    api.getApiKeys.mockResolvedValue([active, expired])
    const wrapper = mount(SettingsViewApi, { global: { plugins } })
    await flushPromises()

    const [row] = wrapper.findAll('.settings-view-api__key')
    expect(row.text()).toContain('in 7 days')
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
      expect(wrapper.find('.settings-view-api-key-form').exists()).toBeFalsy()
      expect(wrapper.find('input[readonly]').element.value).toBe('123456abcdef')
    })

    it('should refresh the list when the modal closes', async () => {
      api.addApiKey.mockResolvedValue({ apiKey: '123456abcdef' })
      const wrapper = mount(SettingsViewApi, { global: { plugins, stubs } })
      await wrapper.find('.settings-view-api__create__button').trigger('click')
      wrapper.findComponent(SettingsViewApiKeyForm).vm.$emit('submit', payload)
      await flushPromises()

      wrapper.findComponent({ name: 'AppModal' }).vm.$emit('hidden')
      await flushPromises()
      expect(api.getApiKeys).toBeCalledTimes(2)

      await wrapper.find('.settings-view-api__create__button').trigger('click')
      expect(wrapper.find('.settings-view-api-key-form').exists()).toBeTruthy()
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
