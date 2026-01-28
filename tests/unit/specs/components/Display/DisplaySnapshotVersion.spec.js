import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DisplaySnapshotVersion from '@/components/Display/DisplaySnapshotVersion'

describe('DisplaySnapshotVersion', () => {
  let plugins

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  function mountComponent(props = {}) {
    return mount(DisplaySnapshotVersion, {
      global: { plugins },
      props
    })
  }

  it('should render the component', () => {
    const wrapper = mountComponent({ value: 'curious-green-fox-ver:8.11.1' })
    expect(wrapper.find('.display-snapshot-version').exists()).toBeTruthy()
  })

  it('should extract and display version from snapshot name', () => {
    const wrapper = mountComponent({ value: 'curious-green-fox-dist:opensearch-ver:2.11.0' })
    expect(wrapper.text()).toBe('2.11.0')
  })

  it('should display version when no distribution in name', () => {
    const wrapper = mountComponent({ value: 'curious-green-fox-ver:8.11.1' })
    expect(wrapper.text()).toBe('8.11.1')
  })

  it('should display dash when no version in snapshot name', () => {
    const wrapper = mountComponent({ value: 'curious-green-fox' })
    expect(wrapper.text()).toBe('-')
  })

  it('should display dash when only distribution in snapshot name', () => {
    const wrapper = mountComponent({ value: 'curious-green-fox-dist:elasticsearch' })
    expect(wrapper.text()).toBe('-')
  })

  it('should use DisplayVersion component under the hood', () => {
    const wrapper = mountComponent({ value: 'curious-green-fox-ver:8.11.1' })
    expect(wrapper.findComponent({ name: 'DisplayVersion' }).exists()).toBeTruthy()
  })
})
