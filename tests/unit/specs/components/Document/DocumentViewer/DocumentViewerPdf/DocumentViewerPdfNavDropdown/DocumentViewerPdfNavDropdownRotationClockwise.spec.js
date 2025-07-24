import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import { ROTATIONS } from '@/enums/documentViewerPdf'
import RotateClockwiseButton from '@/components/Document/DocumentViewer/DocumentViewerPdf/DocumentViewerPdfDropdown/DocumentViewerPdfDropdownRotationClockwise.vue'

describe('RotateClockwiseButton.vue', () => {
  // helper to create a wrapper with a specific modelValue
  const factory = (modelValue = undefined) => {
    const { plugins } = CoreSetup.init().useAll()

    return mount(RotateClockwiseButton, {
      props: { modelValue },
      global: { plugins }
    })
  }

  it('renders the button correct label', () => {
    const wrapper = factory()
    expect(wrapper.text()).toContain('Rotate clockwise')
  })

  it('emits update:modelValue with the next rotation (default start)', async () => {
    const wrapper = factory()
    await wrapper.find('button').trigger('click')

    // default modelValue is 0, find its index in ROTATIONS
    const startIndex = ROTATIONS.indexOf(0)
    const expected = ROTATIONS[(startIndex + 1) % ROTATIONS.length]

    const events = wrapper.emitted('update:modelValue')
    expect(events).toHaveLength(1)
    expect(events[0]).toEqual([expected])
  })

  it('advances from a non‐zero starting rotation', async () => {
    const start = ROTATIONS[2]
    const wrapper = factory(start)
    await wrapper.find('button').trigger('click')

    const startIndex = ROTATIONS.indexOf(start)
    const expected = ROTATIONS[(startIndex + 1) % ROTATIONS.length]

    const events = wrapper.emitted('update:modelValue')
    expect(events[0]).toEqual([expected])
  })

  it('wraps around to first rotation after the last one', async () => {
    const last = ROTATIONS[ROTATIONS.length - 1]
    const wrapper = factory(last)
    await wrapper.find('button').trigger('click')

    // index of last is length - 1, so next should be index 0
    const expected = ROTATIONS[0]

    const events = wrapper.emitted('update:modelValue')
    expect(events[0]).toEqual([expected])
  })
})
