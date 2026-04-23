import { ref, toValue, watch } from 'vue'

import { apiInstance as api } from '@/api/apiInstance'
import { useWait } from '@/composables/useWait'

/**
 * Groups a list of content types into their high-level categories
 * (Documents, Images, Spreadsheets, …) via the backend.
 *
 * @param contentTypes - Ref, getter, or plain array of content-type strings
 * @returns { categories: Ref<Record<string, string[]>>, isLoading: Ref<boolean> }
 */
export function useContentTypeCategories(contentTypes) {
  const categories = ref({})
  const { waitFor, isLoading } = useWait()

  const fetchCategories = waitFor(async (types) => {
    if (!types?.length) {
      categories.value = {}
      return
    }
    categories.value = await api.getContentTypesGrouppedByCategories(types)
  })

  watch(() => toValue(contentTypes), fetchCategories, { immediate: true, deep: true })

  return { categories, isLoading }
}
