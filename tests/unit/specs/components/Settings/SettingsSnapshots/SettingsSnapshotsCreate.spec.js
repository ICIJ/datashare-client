import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SettingsSnapshotsCreate from '@/components/Settings/SettingsSnapshots/SettingsSnapshotsCreate'

describe('SettingsSnapshotsCreate', () => {
  let plugins

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  function mountComponent(props = {}) {
    return mount(SettingsSnapshotsCreate, {
      global: { plugins },
      props: {
        isLoading: false,
        ...props
      }
    })
  }

  it('should render the create button', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.settings-snapshots-create').exists()).toBeTruthy()
  })

  it('should emit create event when clicked', async () => {
    const wrapper = mountComponent()
    await wrapper.trigger('click')
    expect(wrapper.emitted('create')).toBeTruthy()
  })

  it('should be disabled when loading', () => {
    const wrapper = mountComponent({ isLoading: true })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('should not be disabled when not loading', () => {
    const wrapper = mountComponent({ isLoading: false })
    expect(wrapper.attributes('disabled')).toBeUndefined()
  })
})
