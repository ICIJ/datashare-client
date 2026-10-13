# contentTypeCategory mapping request de-duplication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop the search page from firing N identical `_mapping/field/contentTypeCategory` requests by making a single shared Pinia store own the cache, derived availability state, and the one watcher that triggers fetches.

**Architecture:** Move all ownership (cache `entries`, `isAvailable`/`isLoading`/`error`, the `fetchAvailability` action, and **exactly one** `watch` on the index signature) from the per-instance composable into the existing suffixed `useMappingCacheStore`. A Pinia setup store runs its setup once per instance, so the single watcher fires one fetch per signature change regardless of how many components read it. `useContentTypeCategoryAvailability()` becomes a thin adapter returning the store's refs, preserving its public contract `{ isAvailable, isLoading, error }`. The store follows the proven `src/store/modules/languages.js` pattern (`useWait()` + `waitFor` inside a setup store) and injects the suffixed search store with `useSearchStore.inject()`.

**Tech Stack:** Vue 3 (Composition API, `<script setup>`), Pinia (setup stores via `defineSuffixedStore`), Vitest + @vue/test-utils.

## Global Constraints

- No single-line `if` statements without braces (project style).
- Do not change the `getMappingsByFields` API endpoint or the `/_mapping/field/...` request shape.
- The public contract of `useContentTypeCategoryAvailability()` stays `{ isAvailable, isLoading, error }` (all reactive refs).
- The exported `useMappingCacheStore` must keep `clear()` (afterEach hooks rely on it).
- The existing 8 tests in `tests/unit/specs/composables/useContentTypeCategoryAvailability.spec.js` must stay green and unchanged.

---

### Task 1: Centralize ownership into the store (single watcher)

This is the core fix. It eliminates the request herd by replacing N per-instance watchers with one store-owned watcher.

**Files:**
- Modify: `src/composables/useContentTypeCategoryAvailability.js` (full rewrite of the store + composable; helpers unchanged)
- Test: `tests/unit/specs/composables/useContentTypeCategoryAvailability.spec.js` (add one test; keep existing 8)

**Interfaces:**
- Consumes: `api.getMappingsByFields(projectIds: string, fields: string): Promise<object|string>` (`src/api/index.js:436`); `useSearchStore` from `@/store/modules`; `useWait()` from `@/composables/useWait`; `defineSuffixedStore` from `@/store/defineSuffixedStore`; `CONTENT_TYPE_CATEGORY_FILTER_NAME` from `@/store/filters/FilterContentTypeCategory`.
- Produces:
  - `useMappingCacheStore` (suffixed store) exposing state/getters `entries`, `isAvailable: Ref<boolean>`, `isLoading: ComputedRef<boolean>`, `error: Ref<Error|null>` and actions `has(name)`, `get(name)`, `set(name, value)`, `clear()`, `fetchAvailability()`.
  - `useContentTypeCategoryAvailability(): { isAvailable: Ref<boolean>, isLoading: Ref<boolean>, error: Ref<Error|null> }`.

- [ ] **Step 1: Write the failing de-duplication test**

Add this test inside the existing `describe(...)` block in `tests/unit/specs/composables/useContentTypeCategoryAvailability.spec.js`, after the last test (before the closing `})` of the describe). It mounts three components that each call the composable — simulating the many `FilterType*` consumers on the search page.

```js
  it('issues a single mapping request when many components mount at once', async () => {
    searchStore.setIndices(['idx-a', 'idx-b'])
    api.getMappingsByFields.mockResolvedValueOnce(
      buildMappingPayload({ 'idx-a': true, 'idx-b': true })
    )

    const results = []
    const TestComponent = {
      setup() {
        const result = useContentTypeCategoryAvailability()
        results.push(result)
        return result
      },
      template: '<div></div>'
    }
    // Three sibling consumers under one app, mirroring the search page where
    // every FilterType* component instantiates the composable in the same tick.
    wrapper = mount(
      { components: { TestComponent }, template: '<div><TestComponent /><TestComponent /><TestComponent /></div>' },
      { global: { plugins } }
    )
    await flushPromises()

    expect(api.getMappingsByFields).toHaveBeenCalledTimes(1)
    expect(results.every(({ isAvailable }) => isAvailable.value === true)).toBe(true)
  })
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn test:unit tests/unit/specs/composables/useContentTypeCategoryAvailability.spec.js -t "single mapping request"`
Expected: FAIL — `getMappingsByFields` is called 3 times (one per per-instance watcher), not 1.

- [ ] **Step 3: Rewrite the store + composable to centralize ownership**

Replace the entire contents of `src/composables/useContentTypeCategoryAvailability.js` with the following. The module-level helpers (`parseMappings`, `isFieldPresent`, `indexSignature`) are unchanged; ownership moves into the store and the composable becomes a thin adapter.

```js
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

  const refreshCacheFor = async (names) => {
    const payload = await api.getMappingsByFields(names.join(','), CONTENT_TYPE_CATEGORY_FILTER_NAME)
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
```

- [ ] **Step 4: Run the full spec file to verify all tests pass**

Run: `yarn test:unit tests/unit/specs/composables/useContentTypeCategoryAvailability.spec.js`
Expected: PASS — all 9 tests green (the original 8 plus the new de-dup test). In particular `getMappingsByFields` is called once for the de-dup test.

- [ ] **Step 5: Run the dependent consumer suites to confirm no regression**

Run: `yarn test:unit tests/unit/specs/composables/useSearchFilter.spec.js tests/unit/specs/components/Filter/FilterType/FilterType.spec.js tests/unit/specs/components/Filter/FilterType/FilterTypeFileTypes.spec.js`
Expected: PASS — the composable's public contract `{ isAvailable, isLoading, error }` is unchanged, so consumers are unaffected.

- [ ] **Step 6: Commit**

```bash
git add src/composables/useContentTypeCategoryAvailability.js tests/unit/specs/composables/useContentTypeCategoryAvailability.spec.js
git commit -m "fix(search): dedupe contentTypeCategory mapping requests via shared store

Centralize the cache, availability state, and the single watcher into the
suffixed mapping store so many FilterType components no longer each trigger an
identical _mapping/field/contentTypeCategory request on mount and index change.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: In-flight guard for overlapping same-signature requests

The single watcher removes the multi-instance herd. This task closes the remaining edge: rapid signature flips (e.g. `[A] → [] → [A]`) that re-request the **same** uncached set before the first request resolves. Concurrent callers for an identical missing-index signature should share one promise.

**Files:**
- Modify: `src/composables/useContentTypeCategoryAvailability.js` (add in-flight tracking inside the store)
- Test: `tests/unit/specs/composables/useContentTypeCategoryAvailability.spec.js` (add one test)

**Interfaces:**
- Consumes: the store from Task 1 (`refreshCacheFor`, `indexSignature`).
- Produces: no public API change — purely internal de-duplication of overlapping requests for the same missing-index signature.

- [ ] **Step 1: Add `nextTick` to the test imports**

In `tests/unit/specs/composables/useContentTypeCategoryAvailability.spec.js`, the first import line is currently:

```js
import { mount, flushPromises } from '@vue/test-utils'
```

Add a Vue import directly beneath it (the test file does not yet import from `vue`):

```js
import { nextTick } from 'vue'
```

- [ ] **Step 2: Write the failing in-flight guard test**

Add this test inside the `describe(...)` block, after the de-dup test from Task 1. It holds the first request open, toggles indices away and back to the same set, then resolves — asserting only one request was ever issued.

```js
  it('shares one in-flight request when the same indices are re-requested before it resolves', async () => {
    searchStore.setIndices(['idx-a'])
    let resolveFirst
    api.getMappingsByFields.mockImplementationOnce(
      () => new Promise((resolve) => { resolveFirst = resolve })
    )

    mountComposable() // instantiates the store; the watcher fires fetch(['idx-a']) -> in-flight

    await nextTick()
    // Toggle away and back to the same set while the first request is pending.
    searchStore.setIndices([])
    await nextTick()
    searchStore.setIndices(['idx-a'])
    await nextTick()

    resolveFirst(buildMappingPayload({ 'idx-a': true }))
    await flushPromises()

    expect(api.getMappingsByFields).toHaveBeenCalledTimes(1)
  })
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `yarn test:unit tests/unit/specs/composables/useContentTypeCategoryAvailability.spec.js -t "in-flight request"`
Expected: FAIL — `getMappingsByFields` is called 2 times, because the second `['idx-a']` fetch sees `idx-a` still uncached (first request unresolved) and issues a fresh request.

- [ ] **Step 4: Add the in-flight guard to the store**

In `src/composables/useContentTypeCategoryAvailability.js`, add two in-flight tracking variables and a `requestMappingsFor` helper, then route `refreshCacheFor` through it.

Add these two declarations immediately after the `const error = ref(null)` line:

```js
  // Coalesce overlapping requests for an identical missing-index set so a
  // rapid signature flip (e.g. [A] -> [] -> [A]) reuses the pending promise
  // instead of issuing a duplicate request.
  let inFlightSignature = null
  let inFlightPromise = null
```

Replace the existing `refreshCacheFor` definition:

```js
  const refreshCacheFor = async (names) => {
    const payload = await api.getMappingsByFields(names.join(','), CONTENT_TYPE_CATEGORY_FILTER_NAME)
    cacheMappingsFor(parseMappings(payload), names)
  }
```

with this `requestMappingsFor` + `refreshCacheFor` pair:

```js
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
```

- [ ] **Step 5: Run the full spec file to verify all tests pass**

Run: `yarn test:unit tests/unit/specs/composables/useContentTypeCategoryAvailability.spec.js`
Expected: PASS — all 10 tests green. The in-flight test now records a single request because the second `['idx-a']` fetch reuses the pending promise.

- [ ] **Step 6: Commit**

```bash
git add src/composables/useContentTypeCategoryAvailability.js tests/unit/specs/composables/useContentTypeCategoryAvailability.spec.js
git commit -m "fix(search): coalesce overlapping contentTypeCategory mapping requests

Track the in-flight missing-index signature so a rapid index toggle back to the
same uncached set reuses the pending request instead of issuing a duplicate.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- Root cause (N per-instance watchers) → Task 1 single store-owned watcher. ✓
- Centralize cache + `isAvailable`/`error`/`isLoading` + `fetchAvailability` + one watcher → Task 1. ✓
- `languages.js` pattern (`useWait()` + `waitFor` in setup store) → Task 1 store. ✓
- searchStore injection via `useSearchStore.inject()` in store setup → Task 1; validated by the de-dup test (Task 1 Step 4) which exercises the watcher end-to-end. ✓
- Thin-adapter composable preserving `{ isAvailable, isLoading, error }` → Task 1 + consumer suites in Step 5. ✓
- Cache preserved (`entries/has/get/set/clear`, per-index, fetch only uncached) → Task 1; existing cache tests stay green. ✓
- Error handling semantics unchanged → Task 1 keeps `recordError` and try/catch; existing network/parse tests stay green. ✓
- In-flight guard → Task 2. ✓
- Testing: existing 8 unchanged + de-dup test + in-flight test → Tasks 1 & 2. ✓
- Out of scope (no API/endpoint change, no unrelated `useSearchFilter` refactor, no paired-dimension change) → honored; only the composable file changes. ✓

**Placeholder scan:** No TBD/TODO/"handle edge cases"/vague steps. Every code step shows complete code; every run step shows the command and expected result. ✓

**Type consistency:** `useMappingCacheStore` keeps `entries/has/get/set/clear` and adds `isAvailable/isLoading/error/fetchAvailability` — referenced identically in both tasks. `indexSignature`, `refreshCacheFor`, `requestMappingsFor`, `inFlightSignature`, `inFlightPromise` are named consistently across Task 2. Composable return shape `{ isAvailable, isLoading, error }` matches the consumer destructure at `useSearchFilter.js:37-40`. ✓
