import { computed, ref, watch } from 'vue'

import { apiInstance as api } from '@/api/apiInstance'
import { useWait } from '@/composables/useWait'
import { useSearchStore } from '@/store/modules'

const FIELD = 'contentTypeCategory'

/**
 * Reports whether the contentTypeCategory field is mapped on every
 * currently selected index.
 *
 * The result is conservative: any missing index, network error, or parse
 * error resolves to false so paired-dimension UI can fall back gracefully.
 *
 * Per-index results are cached so toggling projects on and off within a
 * session does not trigger redundant mapping requests.
 *
 * @returns {{
 *   isAvailable: import('vue').Ref<boolean>,
 *   isLoading: import('vue').Ref<boolean>,
 *   error: import('vue').Ref<Error|null>
 * }}
 */
export function useContentTypeCategoryAvailability() {
  const searchStore = useSearchStore.inject()
  const indices = computed(() => searchStore.indices)
  const isAvailable = ref(false)
  const error = ref(null)
  const cache = new Map()
  const { waitFor, isLoading } = useWait()

  function parseMappings(payload) {
    return typeof payload === 'string' ? JSON.parse(payload) : payload
  }

  function isFieldPresent(parsed, indexName) {
    const mapping = parsed?.[indexName]?.mappings?.[FIELD]
    return !!mapping && Object.keys(mapping).length > 0
  }

  const fetchAvailability = waitFor(async () => {
    error.value = null
    const list = indices.value

    if (!list.length) {
      isAvailable.value = false
      return
    }

    const uncached = list.filter(name => !cache.has(name))

    if (uncached.length > 0) {
      try {
        const payload = await api.getMappingsByFields(uncached.join(','), FIELD)
        const parsed = parseMappings(payload)
        for (const name of uncached) {
          cache.set(name, isFieldPresent(parsed, name))
        }
      }
      catch (err) {
        error.value = err
        isAvailable.value = false
        return
      }
    }

    isAvailable.value = list.every(name => cache.get(name) === true)
  })

  watch(() => indices.value.join(','), fetchAvailability, { immediate: true })

  return { isAvailable, isLoading, error }
}
