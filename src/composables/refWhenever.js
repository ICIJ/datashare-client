import { ref, toValue } from 'vue'
import { whenever } from '@vueuse/core'

/**
 * Tracks whether a source ref has met a condition at least once.
 * By default, the condition is Boolean(value) (i.e., truthy).
 *
 * @param source - The source ref to watch
 * @param condition - A predicate to apply on each new value
 * @returns A ref<boolean> that becomes true once the condition is met and never resets
 */
export function refWhenever(source, condition = (v) => Boolean(v)) {
  const triggered = ref(false)
  const apply = () => condition(toValue(source))
  const cb = () => (triggered.value = true)
  // Run "trigger" whenever the effect whenever the predicate is true
  whenever(apply, cb, { immediate: true, once: true })

  return triggered
}
