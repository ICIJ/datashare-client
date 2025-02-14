import { computed, toRef } from 'vue'

import { useResizeObserver } from '@/composables/resize-observer'
import { useBreakpoints } from '@/composables/breakpoints'
import { SIZE } from '@/enums/sizes'

export const useCompact = function (element, options = { threshold: 0, breakpoint: SIZE.MD }) {
  const elementRef = toRef(element)
  const optionsRef = toRef(options)

  const { breakpointDown } = useBreakpoints()
  const { state: elementState } = useResizeObserver(elementRef)

  const compact = computed(() => {
    if (optionsRef.value.threshold && elementRef.value) {
      return elementState.offsetWidth <= optionsRef.value.threshold
    }

    return breakpointDown.value[optionsRef.value.breakpoint]
  })

  return { compact }
}
