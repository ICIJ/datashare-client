import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DisplaySnapshotName from '@/components/Display/DisplaySnapshotName'

describe('DisplaySnapshotName', () => {
  let plugins

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  function mountComponent(props = {}) {
    return mount(DisplaySnapshotName, {
      global: { plugins },
      props
    })
  }

  it('should render the component', () => {
    const wrapper = mountComponent({ value: 'snapshot-1706123456789' })
    expect(wrapper.find('.display-snapshot-name').exists()).toBeTruthy()
  })

  it('should display snapshot name without version and distribution', () => {
    const wrapper = mountComponent({ value: 'snapshot-1706123456789-8.11.1-opensearch' })
    expect(wrapper.text()).toBe('snapshot-1706123456789')
  })

  it('should display snapshot name without version only', () => {
    const wrapper = mountComponent({ value: 'snapshot-1706123456789-8.11.1' })
    expect(wrapper.text()).toBe('snapshot-1706123456789')
  })

  it('should display snapshot name as-is when no version or distribution', () => {
    const wrapper = mountComponent({ value: 'snapshot-1706123456789' })
    expect(wrapper.text()).toBe('snapshot-1706123456789')
  })

  it('should use monospace font', () => {
    const wrapper = mountComponent({ value: 'snapshot-1706123456789' })
    expect(wrapper.find('.font-monospace').exists()).toBeTruthy()
  })

  it('should handle invalid snapshot name format', () => {
    const wrapper = mountComponent({ value: 'invalid-name' })
    expect(wrapper.text()).toBe('invalid-name')
  })
})
