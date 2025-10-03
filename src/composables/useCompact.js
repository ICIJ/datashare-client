import { computed, toRef } from 'vue'
import { useParentElement } from '@vueuse/core'

import { useResizeObserver } from '@/composables/useResizeObserver'
import { useBreakpoints } from '@/composables/useBreakpoints'
import { SIZE } from '@/enums/sizes'

export const useCompact = function (element = null, options = { threshold: 0, breakpoint: SIZE.MD }) {
  const elementRef = toRef(element ?? useParentElement())
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
