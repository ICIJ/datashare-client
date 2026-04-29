import { computed, ref, toValue, watch } from 'vue'

import { apiInstance as api } from '@/api/apiInstance'
import { useWait } from '@/composables/useWait'

const SIGNATURE_SEPARATOR = '|'

const uniqueSorted = values => [...new Set(values)].sort()

const signatureOf = values => values.join(SIGNATURE_SEPARATOR)

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
  const normalizedTypes = computed(() => uniqueSorted(toValue(contentTypes) ?? []))

  const signature = computed(() => signatureOf(normalizedTypes.value))

  const resetCategories = () => {
    categories.value = {}
  }

  const loadCategories = async (types) => {
    categories.value = await api.getContentTypeCategories(types)
  }

  const fetchCategories = waitFor(async () => {
    const types = normalizedTypes.value
    if (types.length === 0) {
      resetCategories()
      return
    }
    await loadCategories(types)
  })

  watch(signature, fetchCategories, { immediate: true })

  return { categories, isLoading }
}
