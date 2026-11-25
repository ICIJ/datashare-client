import { computed } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

import { usePageTracking } from '@/composables/usePageTracking'
import { belowToolboxMargin } from '@/utils/toolboxMargin'

/**
 * Tracks which of a list of page elements shows under the sticky toolbox, and
 * scrolls to the page picked in that toolbox.
 *
 * @param {import('vue').Ref<HTMLElement[]>} sections - The page elements, in page order.
 * @param {import('vue').Ref<number>} toolboxHeight - The sticky toolbox height in pixels.
 * @returns {Object} `{ page, holdPageTracking, resetPageTracking }`
 */
export function useSectionPageTracking(sections, toolboxHeight) {
  const getPageElement = value => sections.value[value - 1]
  const { page, trackPage, holdPageTracking, reset } = usePageTracking({ getPageElement })
  const rootMargin = computed(() => belowToolboxMargin(toolboxHeight.value))

  // The section under the toolbox is the topmost one still showing once the root
  // is shrunk by the toolbox height, the same rule the PDF pages follow.
  function onIntersection(entries) {
    entries.forEach(({ target, isIntersecting }) => {
      const index = sections.value.indexOf(target)
      if (index >= 0) {
        trackPage(index + 1, isIntersecting)
      }
    })
  }

  useIntersectionObserver(sections, onIntersection, { rootMargin })

  return { page, holdPageTracking, resetPageTracking: reset }
}
