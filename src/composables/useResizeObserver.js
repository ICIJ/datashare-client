import { reactive, watchEffect, onBeforeUnmount, toValue } from 'vue'
import ResizeObserver from 'resize-observer-polyfill'

const toElement = ref => toValue(ref)?.$el ?? toValue(ref)

export const useResizeObserver = (resizableRef) => {
  const contentRect = toElement(resizableRef)?.getBoundingClientRect() ?? {}
  const { offsetWidth, offsetHeight } = toElement(resizableRef) ?? { offsetWidth: 0, offsetHeight: 0 }
  const initialValue = { contentRect, offsetWidth, offsetHeight }
  // To avoid flaky behavior, we initilize the state as soon as possible
  // and then we update it when the observer is triggered.
  const state = reactive(initialValue)

  const observer = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      state.contentRect = entry.contentRect
      state.offsetWidth = entry.target.offsetWidth
      state.offsetHeight = entry.target.offsetHeight
    })
  })

  watchEffect(() => {
    if (resizableRef.value) {
      const element = toElement(resizableRef)
      // Initial values of the state
      state.contentRect = element.getBoundingClientRect()
      state.offsetWidth = element.offsetWidth
      state.offsetHeight = element.offsetHeight
      // Bind the element to the resize observer
      observer.observe(element)
    }
  })

  onBeforeUnmount(() => {
    if (resizableRef.value) {
      observer.unobserve(toElement(resizableRef))
    }
  })

  return { state }
}

export default useResizeObserver
