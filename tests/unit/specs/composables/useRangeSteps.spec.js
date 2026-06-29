import { ref } from 'vue'

import { useRangeSteps } from '@/composables/useRangeSteps'

describe('useRangeSteps', () => {
  it('returns the plain range when the value is within bounds', () => {
    const { steps, hasOverflow } = useRangeSteps(1, 6, 1, 3)
    expect(steps.value).toEqual([1, 2, 3, 4, 5, 6])
    expect(hasOverflow.value).toBe(false)
  })

  it('returns the plain range when the value equals the max', () => {
    const { steps, hasOverflow } = useRangeSteps(1, 6, 1, 6)
    expect(steps.value).toEqual([1, 2, 3, 4, 5, 6])
    expect(hasOverflow.value).toBe(false)
  })

  it('appends one custom step when the value exceeds the max', () => {
    const { steps, hasOverflow } = useRangeSteps(1, 6, 1, 8)
    expect(steps.value).toEqual([1, 2, 3, 4, 5, 6, 8])
    expect(hasOverflow.value).toBe(true)
  })

  it('never inserts intermediate steps in the overflow gap', () => {
    const { steps } = useRangeSteps(1, 6, 1, 9)
    expect(steps.value).toEqual([1, 2, 3, 4, 5, 6, 9])
  })

  it('accepts reactive inputs and recomputes when the value changes', () => {
    const value = ref(3)
    const { steps, hasOverflow } = useRangeSteps(1, 6, 1, value)
    expect(hasOverflow.value).toBe(false)
    value.value = 8
    expect(steps.value).toEqual([1, 2, 3, 4, 5, 6, 8])
    expect(hasOverflow.value).toBe(true)
  })

  it('keeps the custom step after the value drops back below the max', () => {
    const value = ref(3)
    const { steps, hasOverflow } = useRangeSteps(1, 6, 1, value)

    value.value = 8
    expect(steps.value).toEqual([1, 2, 3, 4, 5, 6, 8])
    expect(hasOverflow.value).toBe(true)

    value.value = 3
    // The slot is anchored to the high-water mark, so it persists.
    expect(steps.value).toEqual([1, 2, 3, 4, 5, 6, 8])
    expect(hasOverflow.value).toBe(true)
  })
})
