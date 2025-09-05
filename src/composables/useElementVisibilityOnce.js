import { ref } from 'vue'
import { useElementVisibility, whenever } from '@vueuse/core'

export function useElementVisibilityOnce(element) {
  const isVisible = useElementVisibility(element)
  const visible = ref(isVisible.value)

  whenever(isVisible, value => (visible.value = value), { once: true })

  return visible
}
