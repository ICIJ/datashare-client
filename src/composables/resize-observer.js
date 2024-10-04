import { reactive, watchEffect, onBeforeUnmount } from 'vue'
import ResizeObserver from 'resize-observer-polyfill'

export const useResizeObserver = (resizableRef) => {
  const state = reactive({
    contentRect: {},
    offsetWidth: 0,
    offsetHeight: 0
  })

  const observer = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      state.contentRect = entry.contentRect
      state.offsetWidth = entry.target.offsetWidth
      state.offsetHeight = entry.target.offsetHeight
    })
  })

  watchEffect(() => {
    if (resizableRef.value) {
      const element = resizableRef.value?.$el ?? resizableRef.value
      // Initial values of the state
      state.contentRect = element.getBoundingClientRect()
      state.offsetWidth = element.offsetWidth
      state.offsetHeight = element.offsetHeight
      // Bind the elemnt to the resize observer
      observer.observe(element)
    }
  })

  onBeforeUnmount(() => {
    if (resizableRef.value) {
      observer.unobserve(resizableRef.value?.$el ?? resizableRef.value)
    }
  })

  return { state }
}

export default useResizeObserver
