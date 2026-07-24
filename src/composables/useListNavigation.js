import { ref, unref } from 'vue'

/**
 * Keyboard navigation for a list of options: a movable focus index plus
 * enter-to-select. The consumer scrolls the focused element into view.
 *
 * @param {import('vue').Ref<Array>} items reactive list being navigated
 * @param {Object} config
 * @param {Function} config.onEnter called as onEnter(event, focusedItem) on Enter
 */
export function useListNavigation(items, { onEnter } = {}) {
  const focusIndex = ref(-1)

  const moveFocusUp = () => {
    focusIndex.value = Math.max(-1, focusIndex.value - 1)
  }

  const moveFocusDown = () => {
    focusIndex.value = Math.min(unref(items).length - 1, focusIndex.value + 1)
  }

  const resetFocus = () => {
    focusIndex.value = -1
  }

  const selectFocused = (event) => {
    if (focusIndex.value > -1) {
      onEnter?.(event, unref(items)[focusIndex.value])
    }
  }

  return { focusIndex, moveFocusUp, moveFocusDown, resetFocus, selectFocused }
}

export default useListNavigation
