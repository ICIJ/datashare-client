import { range } from 'd3'
import { computed, ref, toValue, watch } from 'vue'

/**
 * Build the discrete steps for a range slider. When the value sits above the
 * max it is shown as a single trailing "custom" step (no intermediate steps in
 * the gap). The custom step is anchored to the highest value seen since this
 * composable was created — a high-water mark — so a value parsed above the max
 * stays on the slider even after the user slides back down. It resets when the
 * component is remounted (e.g. the advanced-search modal reopens or is reset).
 *
 * Inputs may be plain values, refs, or getters.
 */
export function useRangeSteps(min, max, step, value) {
  const ceiling = ref(toValue(value))
  watch(
    () => toValue(value),
    (current) => {
      if (current > ceiling.value) {
        ceiling.value = current
      }
    }
  )

  const steps = computed(() => {
    const lo = toValue(min)
    const hi = toValue(max)
    const by = toValue(step)
    const base = range(lo, hi + by, by)

    if (ceiling.value > hi) {
      base.push(ceiling.value)
    }

    return base
  })

  const hasOverflow = computed(() => ceiling.value > toValue(max))

  return { steps, hasOverflow }
}
