import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentViewerPdfDropdown from '@/components/Document/DocumentViewer/DocumentViewerPdf/DocumentViewerPdfDropdown/DocumentViewerPdfDropdown.vue'

describe('DocumentViewerPdfDropdown.vue', () => {
  const factory = (options = {}) => {
    const { plugins } = CoreSetup.init().useAll()

    return mount(DocumentViewerPdfDropdown, {
      global: { plugins },
      ...options
    })
  }

  it('teleports the dropdown menu to the body so it is not clipped by an ancestor stacking context', async () => {
    const wrapper = factory()
    await nextTick()
    const dropdown = wrapper.findComponent({ name: 'BDropdown' })
    expect(dropdown.props('teleportTo')).toBe(document.body)
  })

  it('teleports the dropdown menu into the closest modal so it is not hidden behind it', async () => {
    const modal = document.createElement('div')
    modal.classList.add('modal')
    document.body.appendChild(modal)
    const wrapper = factory({ attachTo: modal })
    await nextTick()
    const dropdown = wrapper.findComponent({ name: 'BDropdown' })
    expect(dropdown.props('teleportTo')).toBe(modal)
  })

  it('constrains the dropdown menu to the viewport boundary', () => {
    const wrapper = factory()
    const dropdown = wrapper.findComponent({ name: 'BDropdown' })
    expect(dropdown.props('boundary')).toBe('viewport')
  })
})
