import { mount } from '@vue/test-utils'

import FormControlRangeSliderBullet from '@/components/Form/FormControl/FormControlRange/FormControlRangeSliderBullet'
import FormControlRangeTicks from '@/components/Form/FormControl/FormControlRange/FormControlRangeTicks'

describe('FormControlRangeSliderBullet.vue', () => {
  const factory = (props = {}) =>
    mount(FormControlRangeSliderBullet, {
      props: { min: 0, max: 10, step: 1, modelValue: 0, ...props }
    })

  describe('bullet position', () => {
    it('centers the dot on the first step', () => {
      const wrapper = factory({ modelValue: 0 })
      // 11 steps (0..10), each bucket is 100/11%, dot centered in its bucket
      expect(wrapper.vm.style.left).toBe('0%')
      expect(wrapper.vm.style.width).toBe(`${100 / 11}%`)
    })

    it('centers the dot on the last step', () => {
      const wrapper = factory({ modelValue: 10 })
      expect(wrapper.vm.style.left).toBe(`${(100 / 11) * 10}%`)
      expect(wrapper.vm.style.width).toBe(`${100 / 11}%`)
    })
  })

  describe('draggable directive', () => {
    it('disables the resizable-panel thresholds so it always emits drag', () => {
      const wrapper = factory()
      const dirs = wrapper.vm.$.subTree.dirs ?? []
      const binding = dirs.map(d => d.value).find(v => v && 'target' in v)
      expect(binding).toBeTruthy()
      expect(binding.expandThreshold).toBe(-Infinity)
      expect(binding.reduceThreshold).toBe(Infinity)
    })
  })

  describe('dragging', () => {
    it('selects the last step when dragged to the far right', async () => {
      const wrapper = factory({ modelValue: 0 })
      await wrapper.find('.form-control-range-slider-bullet').trigger('drag', { detail: 100 })

      const events = wrapper.emitted('update:modelValue')
      expect(events).toBeTruthy()
      expect(events.at(-1)[0]).toBe(10)
    })

    it('never emits an out-of-range (undefined) value when dragged past the end', async () => {
      const wrapper = factory({ modelValue: 0 })
      await wrapper.find('.form-control-range-slider-bullet').trigger('drag', { detail: 150 })

      const events = wrapper.emitted('update:modelValue')
      expect(events.at(-1)[0]).toBe(10)
    })

    it('selects the first step when dragged to the far left', async () => {
      const wrapper = factory({ modelValue: 10 })
      await wrapper.find('.form-control-range-slider-bullet').trigger('drag', { detail: 0 })

      const events = wrapper.emitted('update:modelValue')
      expect(events.at(-1)[0]).toBe(0)
    })
  })
})

describe('FormControlRangeTicks.vue', () => {
  const factory = (props = {}) =>
    mount(FormControlRangeTicks, {
      props: { min: 0, max: 10, step: 1, modelValue: 0, ...props }
    })

  it('renders one entry per step', () => {
    const wrapper = factory()
    expect(wrapper.findAll('.form-control-range-ticks-entry')).toHaveLength(11)
  })

  it('does not carry the alignment-breaking gap/margin utilities on the row', () => {
    const row = factory().find('.form-control-range-ticks').classes()
    expect(row).not.toContain('gap-1')
    expect(row).not.toContain('gap-sm-3')
    expect(row).not.toContain('mx-3')
  })

  it('applies symmetric horizontal spacing on each entry instead of the row gap', () => {
    const entry = factory().find('.form-control-range-ticks-entry').classes()
    expect(entry).toContain('mx-1')
    expect(entry).toContain('mx-sm-2')
  })
})
