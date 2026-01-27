import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SettingsSnapshotsActions from '@/components/Settings/SettingsSnapshots/SettingsSnapshotsActions'

describe('SettingsSnapshotsActions', () => {
  let plugins

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  function mountComponent(props = {}) {
    return mount(SettingsSnapshotsActions, {
      global: { plugins },
      props: {
        name: 'snapshot-1',
        state: 'SUCCESS',
        ...props
      }
    })
  }

  it('should render the actions component', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.settings-snapshots-actions').exists()).toBeTruthy()
  })

  it('should render restore button', () => {
    const wrapper = mountComponent()
    expect(wrapper.findComponent({ name: 'ButtonRowAction' }).exists()).toBeTruthy()
  })

  it('should render delete button', () => {
    const wrapper = mountComponent()
    expect(wrapper.findComponent({ name: 'ButtonRowActionDelete' }).exists()).toBeTruthy()
  })

  it('should disable buttons when snapshot is in progress', () => {
    const wrapper = mountComponent({ state: 'IN_PROGRESS' })
    const restoreButton = wrapper.findComponent({ name: 'ButtonRowAction' })
    const deleteButton = wrapper.findComponent({ name: 'ButtonRowActionDelete' })
    expect(restoreButton.attributes('disabled')).toBeDefined()
    expect(deleteButton.attributes('disabled')).toBeDefined()
  })

  it('should enable buttons when snapshot is not in progress', () => {
    const wrapper = mountComponent({ state: 'SUCCESS' })
    const restoreButton = wrapper.findComponent({ name: 'ButtonRowAction' })
    const deleteButton = wrapper.findComponent({ name: 'ButtonRowActionDelete' })
    expect(restoreButton.attributes('disabled')).toBeUndefined()
    expect(deleteButton.attributes('disabled')).toBeUndefined()
  })
})
