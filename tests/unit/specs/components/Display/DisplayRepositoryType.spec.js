import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DisplayRepositoryType from '@/components/Display/DisplayRepositoryType'

describe('DisplayRepositoryType', () => {
  let plugins

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  function mountComponent(props = {}) {
    return mount(DisplayRepositoryType, {
      global: { plugins },
      props
    })
  }

  it('should render the component', () => {
    const wrapper = mountComponent({ value: 'fs' })
    expect(wrapper.find('.display-repository-type').exists()).toBeTruthy()
  })

  it('should display the icon', () => {
    const wrapper = mountComponent({ value: 'fs' })
    expect(wrapper.find('.display-repository-type__icon').exists()).toBeTruthy()
  })

  it('should display the label', () => {
    const wrapper = mountComponent({ value: 'fs' })
    expect(wrapper.find('.display-repository-type__label').exists()).toBeTruthy()
  })

  it('should display "File system" for fs type', () => {
    const wrapper = mountComponent({ value: 'fs' })
    expect(wrapper.text()).toContain('File system')
  })

  it('should display "Amazon S3" for s3 type', () => {
    const wrapper = mountComponent({ value: 's3' })
    expect(wrapper.text()).toContain('Amazon S3')
  })

  it('should default to fs type when no value provided', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('File system')
  })
})
