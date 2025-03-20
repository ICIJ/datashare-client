import { computed, reactive, toRef, watch } from 'vue'
import { first, get } from 'lodash'

export function useQueryObserver(root = window.document, once = false) {
  const rootRef = toRef(root)
  const elements = reactive({})
  const observers = reactive({})

  const hasElements = (selector) => {
    return get(elements, [selector, 'length'], 0) > 0
  }

  const hasObserver = (selector) => {
    return selector in observers
  }

  const updateElements = (selector) => {
    if (rootRef.value) {
      elements[selector] = Array.from(rootRef.value.querySelectorAll(selector))
    }
    return elements[selector] ?? null
  }

  const observerCallback = (selector) => {
    return () => {
      updateElements(selector)
      if (once && hasElements(selector)) {
        observers[selector].disconnect()
      }
    }
  }

  const observe = (selector) => {
    updateElements(selector)
    // Create the observer once, even if the rootRef doesn't exist yet
    if (!hasObserver(selector)) {
      observers[selector] = new MutationObserver(observerCallback(selector))
    }
    // Wait for the root ref to exist and only create the observer once by selector
    if (rootRef.value) {
      observers[selector].disconnect()
      observers[selector].observe(rootRef.value, { childList: true, subtree: true })
    }
    return observers[selector]
  }

  const querySelector = (selector, options = { immediate: true }) => {
    const elements = querySelectorAll(selector, options)
    return computed(() => first(elements.value))
  }

  const querySelectorAll = (selector, options = { immediate: true }) => {
    watch(rootRef, () => observe(selector), options)
    return computed(() => get(elements, selector, []))
  }

  return {
    querySelector,
    querySelectorAll
  }
}
