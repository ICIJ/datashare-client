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
    const wrapper = mountComponent({ value: 'snapshot-1706123456789-8.11.1' })
    expect(wrapper.find('.display-snapshot-version').exists()).toBeTruthy()
  })

  it('should extract and display version from snapshot name', () => {
    const wrapper = mountComponent({ value: 'snapshot-1706123456789-8.11.1-opensearch' })
    expect(wrapper.text()).toBe('8.11.1')
  })

  it('should display version when no distribution in name', () => {
    const wrapper = mountComponent({ value: 'snapshot-1706123456789-8.11.1' })
    expect(wrapper.text()).toBe('8.11.1')
  })

  it('should display dash when no version in snapshot name', () => {
    const wrapper = mountComponent({ value: 'snapshot-1706123456789' })
    expect(wrapper.text()).toBe('-')
  })

  it('should display dash for invalid snapshot name format', () => {
    const wrapper = mountComponent({ value: 'invalid-name' })
    expect(wrapper.text()).toBe('-')
  })

  it('should use DisplayVersion component under the hood', () => {
    const wrapper = mountComponent({ value: 'snapshot-1706123456789-8.11.1' })
    expect(wrapper.findComponent({ name: 'DisplayVersion' }).exists()).toBeTruthy()
  })
})
