import { computed, reactive, ref, watch } from 'vue'

import { apiInstance as api } from '@/api/apiInstance'
import { useWait } from '@/composables/useWait'
import { CONTENT_TYPE_CATEGORY_FILTER_NAME } from '@/store/filters/FilterContentTypeCategory'
import { defineSuffixedStore } from '@/store/defineSuffixedStore'
import { useSearchStore } from '@/store/modules'

const INDEX_SIGNATURE_SEPARATOR = '\0'

// Pinia-scoped so the cache is shared across composable instances within an
// app but reset automatically between tests when each test installs a fresh
// Pinia instance.
export const useMappingCacheStore = defineSuffixedStore('contentTypeMappingCache', () => {
  const entries = reactive({})
  const has = name => name in entries
  const get = name => entries[name]
  const set = (name, value) => {
    entries[name] = value
  }
  const clear = () => Object.keys(entries).forEach(key => delete entries[key])
  return { entries, has, get, set, clear }
})

const parseMappings = (payload) => {
  if (typeof payload === 'string') {
    return JSON.parse(payload)
  }
  return payload
}

const isFieldPresent = (parsed, indexName) => {
  const mapping = parsed?.[indexName]?.mappings?.[CONTENT_TYPE_CATEGORY_FILTER_NAME]
  if (!mapping) {
    return false
  }
  return Object.keys(mapping).length > 0
}

const indexSignature = indices => [...indices].sort().join(INDEX_SIGNATURE_SEPARATOR)

/**
 * Reports whether the contentTypeCategory field is mapped on every
 * currently selected index. Any missing index, network error, or parse
 * error resolves to false so paired-dimension UI can fall back gracefully.
 */
export function useContentTypeCategoryAvailability() {
  const searchStore = useSearchStore.inject()
  const mappingCache = useMappingCacheStore()
  const indices = computed(() => searchStore.indices)
  const isAvailable = ref(false)
  const error = ref(null)
  const { waitFor, isLoading } = useWait()

  const uncachedIndices = list => list.filter(name => !mappingCache.has(name))

  const cacheMappingsFor = (parsed, names) => {
    for (const name of names) {
      mappingCache.set(name, isFieldPresent(parsed, name))
    }
  }

  const refreshCacheFor = async (names) => {
    const payload = await api.getMappingsByFields(names.join(','), CONTENT_TYPE_CATEGORY_FILTER_NAME)
    cacheMappingsFor(parseMappings(payload), names)
  }

  const allIndicesHaveField = list => list.every(name => mappingCache.get(name) === true)

  const recordError = (err) => {
    error.value = err
    isAvailable.value = false
  }

  const fetchAvailability = waitFor(async () => {
    error.value = null
    const list = indices.value

    if (list.length === 0) {
      isAvailable.value = false
      return
    }

    const missing = uncachedIndices(list)
    if (missing.length > 0) {
      try {
        await refreshCacheFor(missing)
      }
      catch (err) {
        recordError(err)
        return
      }
    }

    isAvailable.value = allIndicesHaveField(list)
  })

  watch(() => indexSignature(indices.value), fetchAvailability, { immediate: true })

  return { isAvailable, isLoading, error }
}
