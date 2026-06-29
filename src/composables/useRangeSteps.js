import { range } from 'd3'
import { computed, toValue } from 'vue'

/**
 * Build the discrete steps for a range slider. When the current value sits
 * above the max, it is appended as a single trailing "custom" step so an
 * out-of-range value stays representable on the slider without adding any
 * intermediate steps in the gap.
 *
 * Inputs may be plain values, refs, or getters.
 */
export function useRangeSteps(min, max, step, value) {
  const steps = computed(() => {
    const lo = toValue(min)
    const hi = toValue(max)
    const by = toValue(step)
    const current = toValue(value)
    const base = range(lo, hi + by, by)

    if (current > hi) {
      base.push(current)
    }

    return base
  })

  const hasOverflow = computed(() => toValue(value) > toValue(max))

  return { steps, hasOverflow }
}
