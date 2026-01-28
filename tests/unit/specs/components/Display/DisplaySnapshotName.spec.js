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
    const wrapper = mountComponent({ value: 'curious-green-fox' })
    expect(wrapper.find('.display-snapshot-name').exists()).toBeTruthy()
  })

  it('should display snapshot name without version and distribution', () => {
    const wrapper = mountComponent({ value: 'curious-green-fox-dist:opensearch-ver:2.11.0' })
    expect(wrapper.text()).toBe('curious-green-fox')
  })

  it('should display snapshot name without version only', () => {
    const wrapper = mountComponent({ value: 'curious-green-fox-ver:8.11.1' })
    expect(wrapper.text()).toBe('curious-green-fox')
  })

  it('should display snapshot name without distribution only', () => {
    const wrapper = mountComponent({ value: 'curious-green-fox-dist:elasticsearch' })
    expect(wrapper.text()).toBe('curious-green-fox')
  })

  it('should display snapshot name as-is when no version or distribution', () => {
    const wrapper = mountComponent({ value: 'curious-green-fox' })
    expect(wrapper.text()).toBe('curious-green-fox')
  })

  it('should use monospace font', () => {
    const wrapper = mountComponent({ value: 'curious-green-fox' })
    expect(wrapper.find('.font-monospace').exists()).toBeTruthy()
  })
})
