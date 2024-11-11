import { computed, reactive, toRef } from 'vue'
import { first, get } from 'lodash'

export function useQueryObserver(root = window.document) {
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
      if (hasElements(selector)) {
        observers[selector].disconnect()
      }
    }
  }

  const observe = (selector) => {
    updateElements(selector)
    // Wait for the root ref to exist and only create the observer once by selector
    if (rootRef.value && !hasObserver(selector)) {
      observers[selector] = new MutationObserver(observerCallback(selector))
      observers[selector].observe(rootRef.value, { childList: true, subtree: true })
    }
    return observers[selector]
  }

  const querySelector = (selector) => {
    const elements = querySelectorAll(selector)
    return computed(() => first(elements.value))
  }

  const querySelectorAll = (selector) => {
    observe(selector)
    return computed(() => get(elements, selector, []))
  }

  return {
    querySelector,
    querySelectorAll
  }
}
