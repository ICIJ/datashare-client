import { ref, onMounted, onUnmounted } from 'vue'

export function useActiveElement(options = {}) {
  const { deep = true, triggerOnRemoval = false } = options
  const document = window.document

  const getDeepActiveElement = () => {
    let element = document?.activeElement
    if (deep) {
      while (element?.shadowRoot) element = element?.shadowRoot?.activeElement
    }
    return element
  }

  const activeElement = ref(null)
  const trigger = () => {
    activeElement.value = getDeepActiveElement()
  }

  const handleBlur = (event) => {
    if (event.relatedTarget !== null) return
    trigger()
  }

  const handleFocus = () => {
    trigger()
  }

  onMounted(() => {
    window.addEventListener('blur', handleBlur, true)
    window.addEventListener('focus', handleFocus, true)
    if (triggerOnRemoval) {
      const observer = new MutationObserver((mutations) => {
        mutations
          .filter(m => m.removedNodes.length)
          .map(n => Array.from(n.removedNodes))
          .flat()
          .forEach((node) => {
            if (node === activeElement.value) trigger()
          })
      })
      observer.observe(document, {
        childList: true,
        subtree: true
      })

      onUnmounted(() => {
        observer.disconnect()
      })
    }
  })

  onUnmounted(() => {
    window.removeEventListener('blur', handleBlur, true)
    window.removeEventListener('focus', handleFocus, true)
  })

  trigger()

  return activeElement
}
