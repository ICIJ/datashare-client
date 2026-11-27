import { flushPromises, mount } from '@vue/test-utils'
import { ButtonIcon } from '@icij/murmur'
import IPhSparkle from '~icons/ph/sparkle'

import CoreSetup from '~tests/unit/CoreSetup'
import SettingsViewApiKeyCreated from '@/views/Settings/SettingsView/SettingsViewApiKeyCreated'

describe('SettingsViewApiKeyCreated', () => {
  let core
  let plugins

  beforeEach(() => {
    core = CoreSetup.init().useAll()
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

  it('should warn the key is shown once before the key field', () => {
    const wrapper = mountPanel()
    const [first] = wrapper.element.children
    expect(first.textContent.trim()).toMatch(/^Copy it now and keep it somewhere safe, like a password manager or an encrypted file\. You won't be able to see it again\./)
  })

  it('should put in bold that the key cannot be seen again', () => {
    const wrapper = mountPanel()
    const [first] = wrapper.element.children
    const strong = first.querySelector('strong')
    expect(strong.textContent.trim()).toBe('You won\'t be able to see it again.')
  })

  it('should link the security box to the API documentation', () => {
    const wrapper = mountPanel()
    const hrefs = wrapper.findAll('.settings-view-api-key-created__security a').map(link => link.attributes('href'))
    expect(hrefs).toContain('https://icij.gitbook.io/datashare/developers/backend/api')
  })

  it('should mark the AI assistant toggle with a sparkle', () => {
    const wrapper = mountPanel()
    const buttons = wrapper.findAllComponents(ButtonIcon)
    const toggle = buttons.find(button => button.classes('settings-view-api-key-created__mcp-toggle'))
    expect(toggle.props('iconLeft')).toEqual(IPhSparkle)
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

  it('should ask for the key in a first Claude Code command', async () => {
    const wrapper = await mountUnfolded()

    const [prompt] = wrapper.findAll('.settings-view-api__mcp .tab-pane.active .settings-view-api__mcp__snippet')
    expect(prompt.text()).toBe('printf \'Datashare API key: \' && read -rs DATASHARE_API_KEY && echo')
  })

  it('should connect Claude Code with the key variable in a second command', async () => {
    const wrapper = await mountUnfolded()

    const [, connect] = wrapper.findAll('.settings-view-api__mcp .tab-pane.active .settings-view-api__mcp__snippet')
    const command = connect.text()
    expect(command).toBe('claude mcp add --transport http datashare http://localhost:9009/api/mcp --header "Authorization: Bearer $DATASHARE_API_KEY"')
    expect(command).not.toContain('123456abcdef')
  })

  it('should link to the API key security docs while the AI assistant setup is folded', () => {
    const wrapper = mountPanel()

    const link = wrapper.find('.settings-view-api-key-created__security a')
    expect(link.attributes('href')).toBe('https://icij.gitbook.io/datashare/developers/api-keys')
  })

  it('should keep the API key security docs out of the AI assistant setup', async () => {
    const wrapper = await mountUnfolded()

    const hrefs = wrapper.findAll('.settings-view-api__mcp a').map(link => link.attributes('href'))
    expect(hrefs).not.toContain('https://icij.gitbook.io/datashare/developers/api-keys')
  })

  it('should tell users of an untranslated locale to paste their key', async () => {
    await core.loadI18Locale('fr')
    const wrapper = await mountUnfolded()
    await flushPromises()

    const hint = wrapper.find('.settings-view-api__mcp .tab-pane.active p').text()
    expect(hint).toContain('paste your API key')
    await core.loadI18Locale('en')
  })

  it('should keep the key in the Codex config', async () => {
    const wrapper = await mountUnfolded()
    await flushPromises()

    const codexLink = wrapper.findAll('.settings-view-api__mcp .nav-link').find(link => link.text() === 'Codex')
    await codexLink.trigger('click')
    await flushPromises()

    const config = wrapper.find('.settings-view-api__mcp .tab-pane.active .settings-view-api__mcp__snippet').text()
    expect(config).toContain('Authorization = "Bearer 123456abcdef"')
  })

  it('should open the Claude Code tab by default', async () => {
    const wrapper = await mountUnfolded()
    await flushPromises()

    expect(wrapper.find('.settings-view-api__mcp .nav-link.active').text()).toBe('Claude Code')
  })

  it('should highlight the header as a string in the Claude Code command', async () => {
    const wrapper = await mountUnfolded()
    await vi.waitFor(() => expect(wrapper.find('.settings-view-api__mcp__snippet .tok-string').exists()).toBe(true))

    const strings = wrapper.findAll('.settings-view-api__mcp__snippet .tok-string').map(string => string.text())
    const headerString = strings.find(string => string.includes('Authorization: Bearer'))
    expect(headerString).toBeDefined()
  })
})
