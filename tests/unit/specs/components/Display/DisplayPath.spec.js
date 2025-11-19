import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DisplayPath from '@/components/Display/DisplayPath'

describe('DisplayPath', () => {
  let core

  beforeAll(() => {
    core = CoreSetup.init().useAll()
    // Configure data directories for testing
    core.config.set('dataDir', '/data/datashare')
    core.config.set('mountedDataDir', '/mounted/datashare')
  })

  function mountComponent(props = {}) {
    return mount(DisplayPath, {
      props,
      global: { plugins: core.plugins }
    })
  }

  it('should display the mounted path when value starts with dataDir', () => {
    const wrapper = mountComponent({
      value: '/data/datashare/documents/file.pdf'
    })
    expect(wrapper.text()).toBe('/mounted/datashare/documents/file.pdf')
  })

  it('should display the original path when it does not start with dataDir', () => {
    const wrapper = mountComponent({
      value: '/other/path/file.pdf'
    })
    expect(wrapper.text()).toBe('/other/path/file.pdf')
  })

  it('should display empty string when value is empty', () => {
    const wrapper = mountComponent({
      value: ''
    })
    expect(wrapper.text()).toBe('')
  })

  it('should have the correct CSS class', () => {
    const wrapper = mountComponent({
      value: '/data/datashare/file.pdf'
    })
    expect(wrapper.find('.display-path').exists()).toBe(true)
  })

  it('should handle paths with special characters', () => {
    const wrapper = mountComponent({
      value: '/data/datashare/documents/file with spaces (copy).pdf'
    })
    expect(wrapper.text()).toBe('/mounted/datashare/documents/file with spaces (copy).pdf')
  })

  it('should handle deeply nested paths', () => {
    const wrapper = mountComponent({
      value: '/data/datashare/projects/client/contracts/2024/agreement.docx'
    })
    expect(wrapper.text()).toBe('/mounted/datashare/projects/client/contracts/2024/agreement.docx')
  })

  it('should use default empty string when no value provided', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toBe('')
  })
})
