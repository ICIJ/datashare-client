import { mount } from '@vue/test-utils'

import DisplayPath from '@/components/Display/DisplayPath'

// Mock useDataDir
vi.mock('@/composables/useDataDir', () => ({
  useDataDir: vi.fn(() => ({
    dataDir: { value: '/data/datashare' },
    mountedDataDir: { value: '/mounted/datashare' },
    getMountedPath: vi.fn((path) => {
      const dataDir = '/data/datashare'
      const mountedDataDir = '/mounted/datashare'
      if (path.startsWith(dataDir)) {
        return path.replace(dataDir, mountedDataDir)
      }
      return path
    })
  }))
}))

describe('DisplayPath', () => {
  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should display the mounted path when value starts with dataDir', () => {
    const wrapper = mount(DisplayPath, {
      props: {
        value: '/data/datashare/documents/file.pdf'
      }
    })
    expect(wrapper.text()).toBe('/mounted/datashare/documents/file.pdf')
  })

  it('should display the original path when it does not start with dataDir', () => {
    const wrapper = mount(DisplayPath, {
      props: {
        value: '/other/path/file.pdf'
      }
    })
    expect(wrapper.text()).toBe('/other/path/file.pdf')
  })

  it('should display empty string when value is empty', () => {
    const wrapper = mount(DisplayPath, {
      props: {
        value: ''
      }
    })
    expect(wrapper.text()).toBe('')
  })

  it('should have the correct CSS class', () => {
    const wrapper = mount(DisplayPath, {
      props: {
        value: '/data/datashare/file.pdf'
      }
    })
    expect(wrapper.find('.display-path').exists()).toBe(true)
  })

  it('should handle paths with special characters', () => {
    const wrapper = mount(DisplayPath, {
      props: {
        value: '/data/datashare/documents/file with spaces (copy).pdf'
      }
    })
    expect(wrapper.text()).toBe('/mounted/datashare/documents/file with spaces (copy).pdf')
  })

  it('should handle deeply nested paths', () => {
    const wrapper = mount(DisplayPath, {
      props: {
        value: '/data/datashare/projects/client/contracts/2024/agreement.docx'
      }
    })
    expect(wrapper.text()).toBe('/mounted/datashare/projects/client/contracts/2024/agreement.docx')
  })

  it('should use default empty string when no value provided', () => {
    const wrapper = mount(DisplayPath)
    expect(wrapper.text()).toBe('')
  })
})
