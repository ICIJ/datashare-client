import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DisplayVersion from '@/components/Display/DisplayVersion'

describe('DisplayVersion', () => {
  let plugins

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  function mountComponent(props = {}) {
    return mount(DisplayVersion, {
      global: { plugins },
      props
    })
  }

  it('should render the component', () => {
    const wrapper = mountComponent({ value: '8.11.1' })
    expect(wrapper.find('.display-version').exists()).toBeTruthy()
  })

  it('should display the version value', () => {
    const wrapper = mountComponent({ value: '8.11.1' })
    expect(wrapper.text()).toBe('8.11.1')
  })

  it('should display dash when value is null', () => {
    const wrapper = mountComponent({ value: null })
    expect(wrapper.text()).toBe('-')
  })

  it('should display dash when value is not provided', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toBe('-')
  })

  it('should have empty class when no value', () => {
    const wrapper = mountComponent({ value: null })
    expect(wrapper.find('.display-version--empty').exists()).toBeTruthy()
  })
})
