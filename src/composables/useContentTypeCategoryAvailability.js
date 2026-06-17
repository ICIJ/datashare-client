import { inject, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { apiInstance as api } from '@/api/apiInstance'
import { useWait } from '@/composables/useWait'
import { CONTENT_TYPE_CATEGORY_FILTER_NAME } from '@/store/filters/FilterContentTypeCategory'
import { defineSuffixedStore } from '@/store/defineSuffixedStore'
import { useSearchStore } from '@/store/modules'

const INDEX_SIGNATURE_SEPARATOR = '\0'

// Provide key under which defineSuffixedStore('search', …) exposes the active
// search-store suffix (camelCase('searchSuffix')). The composable reads it in
// component context — where Vue injection resolves the component hierarchy,
// unlike a Pinia store setup, which only sees app-level provides — to bind the
// mapping store to the matching search context. Each context (main search, the
// disposable batch-search form, …) then owns its own availability state.
const SEARCH_SUFFIX_PROVIDE_KEY = 'searchSuffix'

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

// Per-search-context owner of the contentTypeCategory mapping cache and the
// derived availability state. Exposes a fetchAvailability(indices) action; the
// watcher that drives it lives in the composable (component context). Concurrent
// callers are coalesced by the in-flight guard below, so the many FilterType
// components that mount together issue a single request — this is what removes
// the request herd. Suffixed so each search context keeps isolated state and so
// the cache resets between tests when each test installs a fresh Pinia instance.
export const useMappingCacheStore = defineSuffixedStore('contentTypeMappingCache', () => {
  const { waitFor, isLoading } = useWait()

  const entries = reactive({})
  const isAvailable = ref(false)
  const error = ref(null)

  // Coalesce overlapping requests for an identical missing-index set so the many
  // components mounting at once — and rapid signature flips like [A] -> [] -> [A]
  // — reuse one pending request instead of duplicating it.
  let inFlightSignature = null
  let inFlightPromise = null

  const has = name => name in entries
  const get = name => entries[name]
  const set = (name, value) => {
    entries[name] = value
  }
  const clear = () => Object.keys(entries).forEach(key => delete entries[key])

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
    const promise = api.getMappingsByFields(names.join(','), CONTENT_TYPE_CATEGORY_FILTER_NAME)
    inFlightSignature = signature
    inFlightPromise = promise
    promise
      .finally(() => {
        // Only clear when this request is still the current one, so a slow
        // earlier request resolving late does not wipe a newer request's guard.
        if (inFlightPromise === promise) {
          inFlightSignature = null
          inFlightPromise = null
        }
      })
      // The .finally() chain rejects when `promise` rejects; the rejection is
      // handled by the awaiting caller via the returned `promise`, so swallow it
      // here to avoid an unhandled-rejection warning.
      .catch(() => {})
    return promise
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

  const fetchAvailability = waitFor(async (list) => {
    error.value = null

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

  return { entries, has, get, set, clear, isAvailable, isLoading, error, fetchAvailability }
})

/**
 * Reports whether the contentTypeCategory field is mapped on every currently
 * selected index. Owns the watcher (in component context, so Vue injection
 * resolves the active search-store suffix correctly) and delegates fetching and
 * state to the per-context mapping store. Any missing index, network error, or
 * parse error resolves to false so paired-dimension UI can fall back gracefully.
 */
export function useContentTypeCategoryAvailability() {
  const searchSuffix = inject(SEARCH_SUFFIX_PROVIDE_KEY, null)
  const searchStore = useSearchStore.inject()
  // A suffixed store binds to a disposable search context (e.g. the batch-search
  // form). It intentionally outlives that context's $dispose: the watcher tears
  // down with this component, leaving only a small inert cache + refs. This is a
  // bounded per-form-open leak we accept rather than reference-count disposal
  // across the sibling FilterType consumers that share the suffixed store.
  const store = searchSuffix ? useMappingCacheStore.create(searchSuffix) : useMappingCacheStore()
  watch(
    () => indexSignature(searchStore.indices),
    () => store.fetchAvailability(searchStore.indices),
    { immediate: true }
  )
  const { isAvailable, isLoading, error } = storeToRefs(store)
  return { isAvailable, isLoading, error }
}
