import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import { ROTATIONS_COUNTERWISE } from '@/enums/documentViewerPdf'
import RotateCounterClockwiseButton from '@/components/Document/DocumentViewer/DocumentViewerPdf/DocumentViewerPdfDropdown/DocumentViewerPdfDropdownRotationCounterClockwise.vue'

describe('RotateCounterClockwiseButton.vue', () => {
  // helper to create a wrapper with a specific modelValue
  const factory = (modelValue = undefined) => {
    const { plugins } = CoreSetup.init().useAll()

    return mount(RotateCounterClockwiseButton, {
      props: { modelValue },
      global: { plugins }
    })
  }

  it('renders the button correct label', () => {
    const wrapper = factory()
    expect(wrapper.text()).toContain('Rotate counterclockwise')
  })

  it('emits update:modelValue with the next rotation (default start)', async () => {
    const wrapper = factory()
    await wrapper.find('button').trigger('click')

    // default modelValue is 0, find its index in ROTATIONS_COUNTERWISE
    const startIndex = ROTATIONS_COUNTERWISE.indexOf(0)
    const expected = ROTATIONS_COUNTERWISE[(startIndex + 1) % ROTATIONS_COUNTERWISE.length]

    const events = wrapper.emitted('update:modelValue')
    expect(events).toHaveLength(1)
    expect(events[0]).toEqual([expected])
  })

  it('advances from a non‐zero starting rotation', async () => {
    const start = ROTATIONS_COUNTERWISE[2]
    const wrapper = factory(start)
    await wrapper.find('button').trigger('click')

    const startIndex = ROTATIONS_COUNTERWISE.indexOf(start)
    const expected = ROTATIONS_COUNTERWISE[(startIndex + 1) % ROTATIONS_COUNTERWISE.length]

    const events = wrapper.emitted('update:modelValue')
    expect(events[0]).toEqual([expected])
  })

  it('wraps around to first rotation after the last one', async () => {
    const last = ROTATIONS_COUNTERWISE[ROTATIONS_COUNTERWISE.length - 1]
    const wrapper = factory(last)
    await wrapper.find('button').trigger('click')

    // index of last is length - 1, so next should be index 0
    const expected = ROTATIONS_COUNTERWISE[0]

    const events = wrapper.emitted('update:modelValue')
    expect(events[0]).toEqual([expected])
  })
})
