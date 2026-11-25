import { flushPromises, mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SettingsViewApiKeyCreated from '@/views/Settings/SettingsView/SettingsViewApiKeyCreated'

describe('SettingsViewApiKeyCreated', () => {
  let plugins

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  function mountPanel() {
    const props = { apiKey: '123456abcdef' }
    return mount(SettingsViewApiKeyCreated, { global: { plugins }, props })
  }

  async function mountUnfolded() {
    const wrapper = mountPanel()
    await wrapper.find('.settings-view-api-key-created__mcp-toggle').trigger('click')
    return wrapper
  }

  it('should show the key in a read-only field', () => {
    const wrapper = mountPanel()
    expect(wrapper.find('input[readonly]').element.value).toBe('123456abcdef')
  })

  it('should warn the key is shown once', () => {
    const wrapper = mountPanel()
    expect(wrapper.text()).toContain('Copy it now: Datashare won\'t show it again.')
  })

  it('should fold the AI assistant setup by default', () => {
    const wrapper = mountPanel()
    expect(wrapper.find('.settings-view-api__mcp').exists()).toBe(false)
  })

  it('should unfold the AI assistant setup on toggle', async () => {
    const wrapper = await mountUnfolded()
    expect(wrapper.find('.settings-view-api__mcp').exists()).toBe(true)
  })

  it('should title the AI assistant setup once', async () => {
    const wrapper = await mountUnfolded()
    const titles = wrapper.text().split('Connect an AI assistant')
    expect(titles).toHaveLength(2)
  })

  it('should show the Claude Code command to connect Datashare MCP with the new key', async () => {
    const wrapper = await mountUnfolded()

    const command = wrapper.find('.settings-view-api__mcp__snippet').text()
    expect(command).toContain('claude mcp add --transport http datashare http://localhost:9009/api/mcp')
    expect(command).toContain('--header "Authorization: Bearer 123456abcdef"')
  })

  it('should open the Claude Code tab by default', async () => {
    const wrapper = await mountUnfolded()
    await flushPromises()

    expect(wrapper.find('.settings-view-api__mcp .nav-link.active').text()).toBe('Claude Code')
  })

  it('should highlight the key as a string in the Claude Code command', async () => {
    const wrapper = await mountUnfolded()
    await vi.waitFor(() => expect(wrapper.find('.settings-view-api__mcp__snippet .tok-string').exists()).toBe(true))

    const string = wrapper.find('.settings-view-api__mcp__snippet .tok-string').text()
    expect(string).toBe('"Authorization: Bearer 123456abcdef"')
  })
})
