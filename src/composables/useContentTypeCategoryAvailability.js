import { computed, inject, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { createSingletonPromise } from '@vueuse/shared'

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

// Per-search-context owner of the contentTypeCategory mapping cache and the
// derived availability state. Exposes a fetchAvailability(indices) action; the
// watcher that drives it lives in the composable (component context). Concurrent
// callers for the same missing-index set are coalesced into one request, so the
// many FilterType components that mount together issue a single request — this
// is what removes the request herd. Suffixed so each search context keeps
// isolated state and so the cache resets between tests when each test installs a
// fresh Pinia instance.
export const useMappingCacheStore = defineSuffixedStore('contentTypeMappingCache', () => {
  const { waitFor, isLoading } = useWait()

  const entries = ref({})
  const isAvailable = ref(false)
  const error = ref(null)

  // Coalesce overlapping requests for an identical missing-index set, keyed by
  // signature, reusing one pending request (createSingletonPromise) for the many
  // components mounting at once and rapid signature flips like [A] -> [] -> [A].
  // The slot is freed on settle so a later identical selection re-fetches fresh.
  const inflightBySignature = new Map()

  // Monotonic token: each fetchAvailability run captures one and commits its
  // result only if it is still the latest, so a superseded slow response cannot
  // overwrite a newer run's state (e.g. [A] in flight, deselect to [], then [A]
  // resolves must not flip availability back on for an empty selection).
  let latestRun = 0

  const uncachedIndices = list => list.filter(name => !(name in entries.value))

  const cacheMappingsFor = (parsed, names) => {
    for (const name of names) {
      entries.value[name] = isFieldPresent(parsed, name)
    }
  }

  // Resets the cache AND the derived/in-flight state, so callers that invalidate
  // the cache don't leave a stale isAvailable, a stale error, or a pending
  // request that later repopulates just-cleared entries.
  const clear = () => {
    entries.value = {}
    isAvailable.value = false
    error.value = null
    inflightBySignature.clear()
  }

  const requestMappingsFor = (names) => {
    const signature = indexSignature(names)
    if (!inflightBySignature.has(signature)) {
      const singleton = createSingletonPromise(
        () => api.getMappingsByFields(names.join(','), CONTENT_TYPE_CATEGORY_FILTER_NAME)
      )
      inflightBySignature.set(signature, singleton)
      // Free the slot once settled (resolve or reject); swallow the rejection
      // here because the awaiting caller handles it via the returned promise.
      singleton()
        .finally(() => inflightBySignature.delete(signature))
        .catch(() => {})
    }
    return inflightBySignature.get(signature)()
  }

  const refreshCacheFor = async (names) => {
    const payload = await requestMappingsFor(names)
    cacheMappingsFor(parseMappings(payload), names)
  }

  const allIndicesHaveField = list => list.every(name => entries.value[name] === true)

  const fetchAvailability = waitFor(async (list) => {
    const run = ++latestRun
    const isLatest = () => run === latestRun
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
        if (isLatest()) {
          error.value = err
          isAvailable.value = false
        }
        return
      }
    }

    if (isLatest()) {
      isAvailable.value = allIndicesHaveField(list)
    }
  })

  return { clear, isAvailable, isLoading, error, fetchAvailability }
})

/**
 * Reports whether the contentTypeCategory field is mapped on every currently
 * selected index. Owns the watcher (in component context, so Vue injection
 * resolves the active search-store suffix correctly — a Pinia store setup only
 * sees app-level provides) and delegates fetching and state to the per-context
 * mapping store. Any missing index, network error, or parse error resolves to
 * false so paired-dimension UI can fall back gracefully.
 */
export function useContentTypeCategoryAvailability() {
  const searchStore = useSearchStore.inject()
  // Bind the mapping store to the active search context by suffix. We read the
  // suffix via useSearchStore.provideKey (no hardcoded key) and retrieve the
  // store with `.use` so this component does not re-provide the suffix into its
  // own subtree. A suffixed store binds to a disposable search context (e.g. the
  // batch-search form) and intentionally outlives that context's $dispose: the
  // watcher tears down with this component, leaving only a small inert cache +
  // refs — a bounded per-form-open leak we accept rather than reference-count
  // disposal across the sibling FilterType consumers that share the store.
  const searchSuffix = inject(useSearchStore.provideKey, null)
  const store = useMappingCacheStore.use(searchSuffix)
  // Memoize the sorted indices and their signature so the watcher key and the
  // fetch argument share a single sort/join per change instead of recomputing
  // on every reactive tick.
  const sortedIndices = computed(() => [...searchStore.indices].sort())
  const signature = computed(() => sortedIndices.value.join(INDEX_SIGNATURE_SEPARATOR))
  watch(signature, () => store.fetchAvailability(sortedIndices.value), { immediate: true })
  const { isAvailable, isLoading, error } = storeToRefs(store)
  return { isAvailable, isLoading, error }
}
