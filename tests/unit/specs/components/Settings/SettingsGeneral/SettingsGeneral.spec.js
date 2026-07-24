import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SettingsGeneral from '@/components/Settings/SettingsGeneral/SettingsGeneral'

describe('SettingsGeneral', () => {
  let plugins

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  function mountComponent(props = {}) {
    return mount(SettingsGeneral, {
      global: { plugins },
      props: {
        settings: {
          dataDir: '/home/datashare/data',
          defaultProject: 'local-datashare',
          oauthClientSecret: '******',
          ...props.settings
        },
        ...props
      }
    })
  }

  it('should render a form input for each setting', () => {
    const wrapper = mountComponent()
    const inputs = wrapper.findAll('input')
    expect(inputs).toHaveLength(3)
  })

  it('should disable inputs for obfuscated settings', () => {
    const wrapper = mountComponent()
    const secretInput = wrapper.find('#input-settings-oauthClientSecret')
    expect(secretInput.element.disabled).toBe(true)
  })

  it('should not disable inputs for non-obfuscated settings', () => {
    const wrapper = mountComponent()
    const dataDirInput = wrapper.find('#input-settings-dataDir')
    expect(dataDirInput.element.disabled).toBe(false)
  })

  it('should treat settings containing obfuscated value as obfuscated', () => {
    const wrapper = mountComponent({
      settings: {
        dataDir: '/home/datashare/data',
        apiKey: 'prefix-******-suffix'
      }
    })
    const apiKeyInput = wrapper.find('#input-settings-apiKey')
    expect(apiKeyInput.element.disabled).toBe(true)
  })

  it('should exclude obfuscated settings from save payload', async () => {
    const wrapper = mountComponent()
    const dataDirInput = wrapper.find('#input-settings-dataDir')
    await dataDirInput.setValue('/new/path')
    await wrapper.find('form').trigger('submit')
    const emitted = wrapper.emitted('save')
    expect(emitted).toHaveLength(1)
    expect(emitted[0][0]).toEqual({
      dataDir: '/new/path',
      defaultProject: 'local-datashare'
    })
    expect(emitted[0][0]).not.toHaveProperty('oauthClientSecret')
  })

  it('should include all non-obfuscated settings in save payload', async () => {
    const wrapper = mountComponent({
      settings: {
        dataDir: '/home/datashare/data',
        defaultProject: 'local-datashare'
      }
    })
    const dataDirInput = wrapper.find('#input-settings-dataDir')
    await dataDirInput.setValue('/new/path')
    await wrapper.find('form').trigger('submit')
    const emitted = wrapper.emitted('save')
    expect(emitted[0][0]).toEqual({
      dataDir: '/new/path',
      defaultProject: 'local-datashare'
    })
  })

  it('should detect changes only on non-obfuscated fields', async () => {
    const wrapper = mountComponent()
    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.element.disabled).toBe(true)
    const dataDirInput = wrapper.find('#input-settings-dataDir')
    await dataDirInput.setValue('/new/path')
    expect(submitButton.element.disabled).toBe(false)
  })

  it('should reset non-obfuscated fields to original values', async () => {
    const wrapper = mountComponent()
    const dataDirInput = wrapper.find('#input-settings-dataDir')
    await dataDirInput.setValue('/new/path')
    await wrapper.find('button[type="reset"]').trigger('click')
    expect(dataDirInput.element.value).toBe('/home/datashare/data')
  })
})
