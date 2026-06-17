import { computed, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { apiInstance as api } from '@/api/apiInstance'
import { useWait } from '@/composables/useWait'
import { CONTENT_TYPE_CATEGORY_FILTER_NAME } from '@/store/filters/FilterContentTypeCategory'
import { defineSuffixedStore } from '@/store/defineSuffixedStore'
import { useSearchStore } from '@/store/modules'

const INDEX_SIGNATURE_SEPARATOR = '\0'

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

// Single owner of the contentTypeCategory mapping cache AND the derived
// availability state. A Pinia setup store runs its setup once per instance, so
// the lone watcher below fires one fetch per index-signature change no matter
// how many components read the store — this is what removes the request herd.
// Suffixed so the cache resets between tests when each test installs a fresh
// Pinia instance.
export const useMappingCacheStore = defineSuffixedStore('contentTypeMappingCache', () => {
  const searchStore = useSearchStore.inject()
  const { waitFor, isLoading } = useWait()

  const entries = reactive({})
  const isAvailable = ref(false)
  const error = ref(null)

  // Coalesce overlapping requests for an identical missing-index set so a
  // rapid signature flip (e.g. [A] -> [] -> [A]) reuses the pending promise
  // instead of issuing a duplicate request.
  let inFlightSignature = null
  let inFlightPromise = null

  const has = name => name in entries
  const get = name => entries[name]
  const set = (name, value) => {
    entries[name] = value
  }
  const clear = () => Object.keys(entries).forEach(key => delete entries[key])

  const indices = computed(() => searchStore.indices)

  const uncachedIndices = list => list.filter(name => !has(name))

  const cacheMappingsFor = (parsed, names) => {
    for (const name of names) {
      set(name, isFieldPresent(parsed, name))
    }
  }

  const requestMappingsFor = (names) => {
    const signature = indexSignature(names)
    if (inFlightSignature === signature && inFlightPromise) {
      return inFlightPromise
    }
    inFlightSignature = signature
    inFlightPromise = api
      .getMappingsByFields(names.join(','), CONTENT_TYPE_CATEGORY_FILTER_NAME)
      .finally(() => {
        inFlightSignature = null
        inFlightPromise = null
      })
    return inFlightPromise
  }

  const refreshCacheFor = async (names) => {
    const payload = await requestMappingsFor(names)
    cacheMappingsFor(parseMappings(payload), names)
  }

  const allIndicesHaveField = list => list.every(name => get(name) === true)

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

  return { entries, has, get, set, clear, isAvailable, isLoading, error, fetchAvailability }
})

/**
 * Reports whether the contentTypeCategory field is mapped on every currently
 * selected index. Thin adapter over the shared store: returns the store's
 * reactive refs so every consumer observes the same single fetch lifecycle.
 * Any missing index, network error, or parse error resolves to false so
 * paired-dimension UI can fall back gracefully.
 */
export function useContentTypeCategoryAvailability() {
  const store = useMappingCacheStore()
  const { isAvailable, isLoading, error } = storeToRefs(store)
  return { isAvailable, isLoading, error }
}
