import { mount } from '@vue/test-utils'

import FormControlRangeSlider from '@/components/Form/FormControl/FormControlRange/FormControlRangeSlider'
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

  describe('overflow value (beyond max)', () => {
    const overflow = (props = {}) => factory({ min: 1, max: 6, step: 1, ...props })

    it('places the bullet on the appended custom slot', () => {
      const wrapper = overflow({ modelValue: 8 })
      // steps become [1,2,3,4,5,6,8] -> 7 slots, custom slot is index 6
      expect(wrapper.vm.style.left).toBe(`${(100 / 7) * 6}%`)
      expect(wrapper.vm.style.width).toBe(`${100 / 7}%`)
    })

    it('snaps to the max (never an intermediate value) when dragged off the custom slot', async () => {
      const wrapper = overflow({ modelValue: 8 })
      await wrapper.find('.form-control-range-slider-bullet').trigger('drag', { detail: 70 })
      // round(7 * 0.70) = 5 -> steps[5] = 6, with no value 7 in between
      expect(wrapper.emitted('update:modelValue').at(-1)[0]).toBe(6)
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

  describe('overflow value (beyond max)', () => {
    const ticksFactory = (props = {}) =>
      mount(FormControlRangeTicks, { props: { min: 1, max: 6, step: 1, modelValue: 0, ...props } })

    it('renders an extra tick for the out-of-range value', () => {
      const wrapper = ticksFactory({ modelValue: 8 })
      const labels = wrapper.findAll('.form-control-range-ticks-entry').map(e => e.text())
      expect(labels).toEqual(['1', '2', '3', '4', '5', '6', '8'])
    })

    it('renders only the normal ticks when the value is within bounds', () => {
      const wrapper = ticksFactory({ modelValue: 3 })
      expect(wrapper.findAll('.form-control-range-ticks-entry')).toHaveLength(6)
    })
  })
})

describe('FormControlRangeSlider.vue', () => {
  const factory = (props = {}) =>
    mount(FormControlRangeSlider, {
      props: { min: 1, max: 6, step: 1, modelValue: 3, ...props }
    })

  it('draws a single full-width solid track when the value is within bounds', () => {
    const wrapper = factory({ modelValue: 3 })
    expect(wrapper.vm.hasOverflow).toBe(false)
    expect(wrapper.vm.solidWidth).toBe('100%')
    expect(wrapper.find('.form-control-range-slider__track--dashed').exists()).toBe(false)
  })

  it('draws a dashed tail from the max tick to the custom tick when out of bounds', () => {
    const wrapper = factory({ modelValue: 8 })
    // steps [1,2,3,4,5,6,8] -> 7 slots; max tick index 5, custom tick index 6.
    expect(wrapper.vm.hasOverflow).toBe(true)
    expect(parseFloat(wrapper.vm.solidWidth)).toBeCloseTo((5.5 / 7) * 100)
    expect(parseFloat(wrapper.vm.dashStyle.left)).toBeCloseTo((5.5 / 7) * 100)
    expect(parseFloat(wrapper.vm.dashStyle.width)).toBeCloseTo((1 / 7) * 100)
    expect(wrapper.find('.form-control-range-slider__track--dashed').exists()).toBe(true)
  })
})
