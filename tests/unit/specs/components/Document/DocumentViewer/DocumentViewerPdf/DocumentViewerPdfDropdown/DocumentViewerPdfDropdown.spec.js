import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentViewerPdfDropdown from '@/components/Document/DocumentViewer/DocumentViewerPdf/DocumentViewerPdfDropdown/DocumentViewerPdfDropdown.vue'

describe('DocumentViewerPdfDropdown.vue', () => {
  const factory = () => {
    const { plugins } = CoreSetup.init().useAll()

    return mount(DocumentViewerPdfDropdown, {
      global: { plugins }
    })
  }

  it('teleports the dropdown menu to the body so it is not clipped by an ancestor stacking context', () => {
    const wrapper = factory()
    const dropdown = wrapper.findComponent({ name: 'BDropdown' })
    expect(dropdown.props('teleportTo')).toBe('body')
  })

  it('constrains the dropdown menu to the viewport boundary', () => {
    const wrapper = factory()
    const dropdown = wrapper.findComponent({ name: 'BDropdown' })
    expect(dropdown.props('boundary')).toBe('viewport')
  })
})
