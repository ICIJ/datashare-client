import { ref, nextTick } from 'vue'
import { useResizeObserver } from '@vueuse/core'

/**
 * Measure an element's natural size by cloning it offscreen.
 * Works even if the element itself is hidden or has constrained dimensions.
 *
 * @param {Ref<HTMLElement | null>} el - The element to clone and measure.
 * @returns {{ width: Ref<number>, height: Ref<number> }}
 */
export function useCloneSize(el) {
  const width = ref(0)
  const height = ref(0)

  const measure = async ([{ target }]) => {
    await nextTick()

    const clone = target.cloneNode(true)
    clone.style.cssText = `
      position: absolute;
      visibility: hidden;
      pointer-events: none;
      height: auto;
      width: auto;
      contain: layout style paint;
    `
    document.body.appendChild(clone)

    const rect = clone.getBoundingClientRect()
    width.value = rect.width
    height.value = rect.height

    clone.remove()
  }

  useResizeObserver(el, measure)

  return { width, height }
}
