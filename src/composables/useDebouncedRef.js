import { customRef } from 'vue'
import { debounce } from 'lodash'

export function useDebouncedRef(value, wait = 200) {
  return customRef((track, trigger) => {
    const debouncedTrigger = debounce(trigger, wait)

    return {
      get() {
        track()
        return value
      },
      set(newValue) {
        value = newValue
        debouncedTrigger()
      }
    }
  })
}
