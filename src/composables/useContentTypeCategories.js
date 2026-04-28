import { computed, ref, toValue, watch } from 'vue'

import { apiInstance as api } from '@/api/apiInstance'
import { useWait } from '@/composables/useWait'

/**
 * Groups a list of content types into their high-level categories
 * (AUDIO, VIDEO, DOCUMENT, …) via the backend.
 *
 * The watcher keys off a stable sorted-and-deduped signature so identical
 * sets passed as new array instances do not trigger a refetch.
 *
 * @param contentTypes - Ref, getter, or plain array of content-type strings
 * @returns { categories: Ref<Record<string, string[]>>, isLoading: Ref<boolean> }
 */
export function useContentTypeCategories(contentTypes) {
  const categories = ref({})
  const { waitFor, isLoading } = useWait()

  // Normalize to a sorted unique list so array identity changes alone
  // do not cause a refetch — only the set of content types matters.
  const normalizedTypes = computed(() => {
    const raw = toValue(contentTypes) ?? []
    return [...new Set(raw)].sort()
  })

  const signature = computed(() => normalizedTypes.value.join('|'))

  const fetchCategories = waitFor(async () => {
    const types = normalizedTypes.value
    if (!types.length) {
      categories.value = {}
      return
    }
    categories.value = await api.getContentTypeCategories(types)
  })

  watch(signature, fetchCategories, { immediate: true })

  return { categories, isLoading }
}
