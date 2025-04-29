import { computed } from 'vue'

import { useColorMode } from './useColorMode'

export function useContrastVariant({ dark = 'dark', light = 'light' } = {}) {
  const { colorMode } = useColorMode()
  const contrastVariant = computed(() => (colorMode.value === 'dark' ? light : dark))
  const variant = computed(() => (colorMode.value === 'dark' ? dark : light))
  return { variant, contrastVariant }
}

export default useContrastVariant
