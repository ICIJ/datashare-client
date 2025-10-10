import { computed } from 'vue'
import { useColorMode } from '@icij/murmur-next'

export function useContrastVariant({ dark = 'dark', light = 'light' } = {}) {
  const { colorMode } = useColorMode()
  const contrastVariant = computed(() => (colorMode.value === 'dark' ? light : dark))
  const contrastVariantCss = computed(() => `var(--bs-${contrastVariant.value})`)
  const variant = computed(() => (colorMode.value === 'dark' ? dark : light))
  const variantCss = computed(() => `var(--bs-${variant.value})`)
  return { variant, contrastVariant, variantCss, contrastVariantCss }
}

export default useContrastVariant
