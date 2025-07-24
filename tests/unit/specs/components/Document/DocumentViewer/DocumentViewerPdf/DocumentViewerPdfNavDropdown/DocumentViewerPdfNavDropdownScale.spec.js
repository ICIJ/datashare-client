import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import { SCALE_FIT, SCALE_WIDTH } from '@/enums/documentViewerPdf'
import DocumentViewerPdfScaleDropdown from '@/components/Document/DocumentViewer/DocumentViewerPdf/DocumentViewerPdfDropdown/DocumentViewerPdfDropdownScale.vue'

describe('DocumentViewerPdfDropdownScale.vue', () => {
  // helper to create a wrapper with a specific modelValue
  const factory = (modelValue = SCALE_FIT) => {
    const { plugins } = CoreSetup.init().useAll()

    return mount(DocumentViewerPdfScaleDropdown, {
      props: { modelValue },
      global: { plugins }
    })
  }

  it('emits update:modelValue when clicking fit', async () => {
    const wrapper = factory(SCALE_WIDTH)
    const items = wrapper.findAllComponents({ name: 'b-dropdown-item-button' })
    await items[0].find('button').trigger('click')

    const events = wrapper.emitted('update:modelValue')
    expect(events).toHaveLength(1)
    expect(events[0]).toEqual([SCALE_FIT])
  })

  it('emits update:modelValue when clicking width', async () => {
    const wrapper = factory(SCALE_FIT)
    const items = wrapper.findAllComponents({ name: 'b-dropdown-item-button' })
    await items[1].find('button').trigger('click')

    const events = wrapper.emitted('update:modelValue')
    expect(events).toHaveLength(1)
    expect(events[0]).toEqual([SCALE_WIDTH])
  })

  it('displays numeric scale text for default numeric value', () => {
    const wrapper = factory()
    // default modelValue is SCALE_FIT (string), lastNumericValue starts at 1
    expect(wrapper.text()).toContain('100%')
  })

  it('zooms out and zooms in numeric scales', async () => {
    // start at middle scale
    const wrapper = factory(1)
    const buttons = wrapper.findAllComponents({ name: 'button-row-action' })

    // click zoom out
    await buttons[0].trigger('click')
    let events = wrapper.emitted('update:modelValue')
    expect(events[0]).toEqual([0.75])

    // click zoom in
    await buttons[1].trigger('click')
    events = wrapper.emitted('update:modelValue')
    expect(events[1]).toEqual([1])
  })
})
