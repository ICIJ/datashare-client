# contentTypeCategory mapping request de-duplication — design

**Date:** 2026-06-17
**Status:** Approved (pending spec review)

## Problem

Loading the search page fires many identical requests to
`GET /api/index/search/:index/_mapping/field/contentTypeCategory` for the same
index. Duplicates also appear when the selected indices change.

### Root cause

Every component that calls `useSearchFilter()` transitively calls
`useContentTypeCategoryAvailability()` (`src/composables/useSearchFilter.js:40`).
On the search page many components mount in the same tick — `Search.vue`,
`SearchFilters.vue`, and every `FilterType*` component (FileTypes, Path,
Project, DateRange, Starred, RecommendedBy, …).

Each instance of `useContentTypeCategoryAvailability()` registers its **own**
watcher:

```js
watch(() => indexSignature(indices.value), fetchAvailability, { immediate: true })
```

So N instances fire `fetchAvailability` in the same tick. The Pinia
`useMappingCacheStore` only stores **resolved** results — it has no concept of
an **in-flight** request. Every instance sees `missing.length > 0` and issues
its own identical request. The cache dedups *already-resolved* indices, which is
why the burst recurs for any **uncached** index — both on cold load and when a
newly-selected index appears.

## Approach

Chosen: **centralize availability into a single shared Pinia store** (the
existing suffixed store), following the proven `src/store/modules/languages.js`
pattern (`useWait()` + `waitFor` inside a setup store).

Rejected alternatives:

- **In-flight promise dedup in the cache store** — surgical, but leaves N
  per-instance watchers waking up on every change; treats the symptom at the
  request layer rather than removing the herd.
- **Debounce / microtask coalescing** — timing-fragile band-aid; does not dedup
  across genuinely different timings.

Centralizing removes the herd *by construction*: one store, one watcher, one
fetch per signature change regardless of how many components read it.

## Architecture

The suffixed store becomes the single owner of:

- the per-index cache (`entries`, today's `useMappingCacheStore`),
- the derived state `isAvailable` / `error` / `isLoading`,
- the `fetchAvailability` action,
- **exactly one** `watch` on the index signature, registered in the store setup.

A Pinia setup store runs its setup once per (suffixed) instance, so the single
watcher fires one fetch per signature change no matter how many components read
the store.

`useContentTypeCategoryAvailability()` is kept as a **thin adapter** that returns
the store's reactive refs, preserving its public contract
`{ isAvailable, isLoading, error }` so `useSearchFilter.js:40` and every
`FilterType*` consumer keep working unchanged.

### Key mechanics

- **searchStore injection:** the store injects the suffixed search store via
  `useSearchStore.inject()` inside its setup. This relies on the same
  component-injection-context guarantee that `languages.js` already depends on
  for `useWait()` (which calls `getCurrentInstance()` / `useId()` in store
  setup). The store binds to whichever search-store suffix is active at first
  instantiation — correct, because all search-page consumers share one suffix
  provided at the view root. **This is the one assumption to validate first
  during implementation** (the de-dup test below will exercise it).
- **Loading state:** use `useWait()` + `waitFor` exactly as `languages.js:17,25`,
  replacing the per-instance `useWait` previously held by the composable.
- **Cache preserved:** keep `entries / has / get / set / clear` and per-index
  caching semantics. Only uncached indices are fetched.
- **In-flight guard:** track the in-flight missing-index signature so a fetch
  already running for the same missing set is shared rather than re-issued —
  the keyed equivalent of `useOnce`'s singleton promise. Guards rapid signature
  flips (A→B→A) that the single watcher alone would not coalesce.

## Data flow

```
searchStore.indices change
        │
        ▼
[store] single watch(indexSignature, { immediate:true })
        │
        ▼
fetchAvailability (wrapped in waitFor → isLoading)
        │
        ├─ indices empty ......................... isAvailable=false, return (no request)
        ├─ compute missing = uncached indices
        ├─ missing.length === 0 .................. skip request, recompute isAvailable from cache
        └─ missing.length > 0
              ├─ same signature already in-flight → await existing promise (no new request)
              └─ else → ONE api.getMappingsByFields(missing.join(','), 'contentTypeCategory')
                          │
                          ├─ success → parse, cache per-index booleans
                          └─ failure (network OR parse) → error.value = err, isAvailable=false, return
        │
        ▼
isAvailable = every selected index cached as true
```

## Error handling

Unchanged in semantics. Any network or parse error sets `error`, sets
`isAvailable=false`, and lets the paired-dimension UI degrade gracefully
(`getFilterPairedDimensions` falls back to single-dimension behaviour). The
composable surfaces the same `{ isAvailable, isLoading, error }`.

## Testing

The existing `tests/unit/specs/composables/useContentTypeCategoryAvailability.spec.js`
(8 cases) is the regression contract and must stay **green and unchanged**. It
covers: availability true / false, string-payload parse, network error, parse
error, re-fetch on index change, per-index cache reuse, and empty indices.

New tests (TDD — write first, watch them fail):

1. **De-duplication (the point of this work):** mount *multiple* components that
   each call `useContentTypeCategoryAvailability()` (simulating the search page),
   set indices, `flushPromises`, and assert `api.getMappingsByFields` was called
   **once**. Pre-fix this is N.
2. **In-flight guard:** trigger overlapping signature changes for the same
   missing-index set and assert a single request is issued.

## Out of scope

- No change to the `getMappingsByFields` API endpoint or the
  `/_mapping/field/...` request shape.
- No unrelated refactor of `useSearchFilter` beyond the thin-adapter wiring.
- No change to paired-dimension fallback logic.
