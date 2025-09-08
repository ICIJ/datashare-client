import { ref, computed } from 'vue'
import { createSingletonPromise } from '@vueuse/shared'

// constants for state values
export const ONCE_IDLE = 'idle'
export const ONCE_RUNNING = 'running'
export const ONCE_DONE = 'done'

/**
 * useOnce(fn)
 * - First successful call is cached forever.
 * - If it rejects, next call retries.
 * - Concurrent calls share the same in-flight promise.
 *
 * Note: `fn` is captured on the first call's arguments. Later calls ignore new args.
 */
export function useOnce(fn) {
  const state = ref(ONCE_IDLE)
  const running = computed(() => state.value === ONCE_RUNNING)
  const done = computed(() => state.value === ONCE_DONE)

  let singleton = null

  function reset() {
    state.value = ONCE_IDLE
    if (singleton) {
      const s = singleton
      singleton = null
      Promise.resolve(s.reset?.()).catch(() => { })
    }
  }

  function run(...args) {
    if (!singleton) {
      singleton = createSingletonPromise(async () => {
        state.value = ONCE_RUNNING
        try {
          const res = await fn(...args)
          state.value = ONCE_DONE
          return res
        }
        catch (e) {
          state.value = ONCE_IDLE
          singleton = null
          throw e
        }
      })
    }
    return singleton()
  }

  return { run, reset, state, running, done }
}
