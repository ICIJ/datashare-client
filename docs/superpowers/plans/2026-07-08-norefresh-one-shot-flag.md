# noRefresh One-Shot Flag Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `noRefresh` search URL flag a true one-shot token so that changing page, sort, or per-page after closing a document reliably refreshes results.

**Architecture:** Keep `noRefresh` as a URL query parameter (the document-close navigation carries it and the existing refresh guards keep working). Add a dedicated consumer, `onConsumeNoRefresh`, in `useSearchFilter.js` that strips the flag from the URL via `router.replace` after the refresh guards have observed it. Register the consumer last in `Search.vue` so it runs after the guards.

**Tech Stack:** Vue 3 (`<script setup>`), Vue Router 4, Vitest, `@vue/test-utils`, Pinia.

## Global Constraints

- No single-line `if` statements without braces (project style).
- Commit via the `/commit` skill following project convention.
- Only touch `src/composables/useSearchFilter.js`, `src/views/Search/Search.vue`, and their specs. Do not modify `useSearchNav`, `useUrlParam`, or the back-to-search links.

---

### Task 1: Add `onConsumeNoRefresh` consumer to `useSearchFilter`

**Files:**
- Modify: `src/composables/useSearchFilter.js` (add function near the existing guards around lines 452-483; export it in the return object around lines 534-535)
- Test: `tests/unit/specs/composables/useSearchFilter.spec.js`

**Interfaces:**
- Consumes: existing `onAfterRouteUpdate(callback, options)` from `@/composables/onAfterRouteUpdate`, and `router` (already created via `useRouter()` at line 28).
- Produces: `onConsumeNoRefresh(options?)` — registers an after-route-update handler that, when `to.name === 'search'` and `to.query.noRefresh` is truthy, calls `router.replace({ name: 'search', query })` with `noRefresh` removed from the query. Returns whatever `onAfterRouteUpdate` returns.

- [ ] **Step 1: Write the failing tests**

Add a new `describe` block to `tests/unit/specs/composables/useSearchFilter.spec.js`. Put it as a sibling of the existing `describe('refreshSearchFromRoute', ...)` block, inside the top-level `describe('useSearchFilter', ...)` (before its closing `})` at line 149). Reuse the file's existing `withSetup` helper.

Add `flushPromises` to the test-utils import at the top of the file. The current import is:

```js
import { mount } from '@vue/test-utils'
```

Change it to:

```js
import { mount, flushPromises } from '@vue/test-utils'
```

Then add the block:

```js
  describe('onConsumeNoRefresh', () => {
    it('strips noRefresh from the search route while preserving other params', async () => {
      const core = CoreSetup.init().useAll().useRouterWithoutGuards()
      withSetup(() => {
        const { onConsumeNoRefresh } = useSearchFilter()
        onConsumeNoRefresh()
      }, core.plugins)

      await core.router.push({ name: 'search', query: { q: 'foo', noRefresh: 1 } })
      await flushPromises()
      await flushPromises()

      const { query } = core.router.currentRoute.value
      expect(query.noRefresh).toBeUndefined()
      expect(query.q).toBe('foo')
    })

    it('leaves the query untouched when noRefresh is absent', async () => {
      const core = CoreSetup.init().useAll().useRouterWithoutGuards()
      withSetup(() => {
        const { onConsumeNoRefresh } = useSearchFilter()
        onConsumeNoRefresh()
      }, core.plugins)

      await core.router.push({ name: 'search', query: { q: 'foo' } })
      await flushPromises()
      await flushPromises()

      const { query } = core.router.currentRoute.value
      expect(query.q).toBe('foo')
      expect(query.noRefresh).toBeUndefined()
    })

    it('does not strip noRefresh outside the search route', async () => {
      const core = CoreSetup.init().useAll().useRouterWithoutGuards()
      withSetup(() => {
        const { onConsumeNoRefresh } = useSearchFilter()
        onConsumeNoRefresh()
      }, core.plugins)

      await core.router.push({ name: 'document-standalone', query: { noRefresh: 1 } })
      await flushPromises()
      await flushPromises()

      expect(core.router.currentRoute.value.query.noRefresh).toBe('1')
    })
  })
```

Note: if `document-standalone` is not a route name in the test router, replace it in the third test with any non-search route name that exists (inspect `core.router.getRoutes().map(r => r.name)` if unsure). The assertion only needs a route where `to.name !== 'search'`.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn test:unit tests/unit/specs/composables/useSearchFilter.spec.js -t "onConsumeNoRefresh"`
Expected: FAIL — `onConsumeNoRefresh is not a function` (destructured value is `undefined`).

- [ ] **Step 3: Implement `onConsumeNoRefresh`**

In `src/composables/useSearchFilter.js`, add the function right after `onAfterRouteQueryFromUpdate` (which ends at line 483, before the `return {` at line 485):

```js
  function onConsumeNoRefresh(options) {
    // `noRefresh` is a one-shot flag set when returning to search from a
    // document, telling the refresh guards to skip a reload. Once those guards
    // have observed it for this navigation, strip it from the URL so it never
    // persists into the next navigation (page/sort/perPage changes copy the
    // current route query forward via batchQueryParamUpdate, which would
    // otherwise keep re-applying the flag and suppress the refresh).
    //
    // This consumer MUST be registered after the refresh guards so its
    // queued microtask runs last and the guards read `noRefresh` first.
    return onAfterRouteUpdate((to) => {
      if (to.name === 'search' && to.query?.noRefresh) {
        const { noRefresh, ...query } = to.query
        router.replace({ name: 'search', query })
      }
    }, options)
  }
```

Then add it to the returned object. Change lines 534-535 from:

```js
    onAfterRouteQueryUpdate,
    onAfterRouteQueryFromUpdate,
```

to:

```js
    onAfterRouteQueryUpdate,
    onAfterRouteQueryFromUpdate,
    onConsumeNoRefresh,
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/composables/useSearchFilter.spec.js -t "onConsumeNoRefresh"`
Expected: PASS (3 passing).

- [ ] **Step 5: Run the full composable spec to check for regressions**

Run: `yarn test:unit tests/unit/specs/composables/useSearchFilter.spec.js`
Expected: PASS (all existing tests still green).

- [ ] **Step 6: Commit** (via the `/commit` skill)

Stage only `src/composables/useSearchFilter.js` and `tests/unit/specs/composables/useSearchFilter.spec.js`. Suggested message:

```
feat(search): add onConsumeNoRefresh to strip one-shot noRefresh flag
```

---

### Task 2: Register the consumer in `Search.vue`

**Files:**
- Modify: `src/views/Search/Search.vue` (destructure `onConsumeNoRefresh` from `useSearchFilter` around lines 42-45; register it after line 124)
- Test: `tests/unit/specs/views/Search/Search.spec.js`

**Interfaces:**
- Consumes: `onConsumeNoRefresh` from Task 1.
- Produces: no new exports. Behaviour: after this task, navigating to the search route with `noRefresh=1` self-heals the URL (flag removed) once the component is mounted.

- [ ] **Step 1: Write the failing test**

Add this test to `tests/unit/specs/views/Search/Search.spec.js`, inside the existing `describe('Search.vue', ...)` block. It relies on the `core` and `wrapper` created in the existing `beforeEach` (which already `shallowMount`s `Search`). Add `flushPromises` to the import:

Current first line:

```js
import { shallowMount } from '@vue/test-utils'
```

Change to:

```js
import { shallowMount, flushPromises } from '@vue/test-utils'
```

Then add the test:

```js
  it('strips the noRefresh flag from the URL after returning to search', async () => {
    await core.router.push({ name: 'search', query: { q: 'foo', noRefresh: 1 } })
    await flushPromises()
    await flushPromises()

    const { query } = core.router.currentRoute.value
    expect(query.noRefresh).toBeUndefined()
    expect(query.q).toBe('foo')
  })
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn test:unit tests/unit/specs/views/Search/Search.spec.js -t "strips the noRefresh flag"`
Expected: FAIL — `query.noRefresh` is still `'1'` because the consumer is not registered in `Search.vue` yet.

- [ ] **Step 3: Destructure `onConsumeNoRefresh` in `Search.vue`**

In `src/views/Search/Search.vue`, find the `useSearchFilter` destructuring that includes `onAfterRouteQueryUpdate` / `onAfterRouteQueryFromUpdate` (around lines 42-45). Add `onConsumeNoRefresh` to it. For example, if it reads:

```js
  onAfterRouteQueryUpdate,
  onAfterRouteQueryFromUpdate
} = useSearchFilter()
```

change it to:

```js
  onAfterRouteQueryUpdate,
  onAfterRouteQueryFromUpdate,
  onConsumeNoRefresh
} = useSearchFilter()
```

- [ ] **Step 4: Register the consumer after the refresh guards**

In `src/views/Search/Search.vue`, immediately after line 124:

```js
onAfterRouteQueryFromUpdate(refreshSearchFromRoute, { immediate: route.name === 'search' })
```

add:

```js
// Consume the one-shot `noRefresh` flag. MUST be registered after the two
// refresh guards above so it runs last and they observe the flag before it is
// stripped from the URL.
onConsumeNoRefresh({ immediate: route.name === 'search' })
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `yarn test:unit tests/unit/specs/views/Search/Search.spec.js -t "strips the noRefresh flag"`
Expected: PASS.

- [ ] **Step 6: Run the full Search spec to check for regressions**

Run: `yarn test:unit tests/unit/specs/views/Search/Search.spec.js`
Expected: PASS (all existing tests still green).

- [ ] **Step 7: Commit** (via the `/commit` skill)

Stage only `src/views/Search/Search.vue` and `tests/unit/specs/views/Search/Search.spec.js`. Suggested message:

```
fix(search): clear noRefresh flag so page/sort/size changes refresh results ICIJ/datashare#XXXX
```

(Replace `XXXX` with the tracking issue number if one exists; otherwise drop the suffix.)

---

## Manual Verification

After both tasks, verify in the running app (list layout):

1. Run a search with results spanning multiple pages.
2. Open a document, then close it — URL returns to search, no reload, and no `noRefresh` remains in the address bar.
3. Change the page — results refresh.
4. Repeat with sort and per-page — results refresh each time.
5. Load a URL containing `noRefresh=1` directly (paste/reload) — results are not blank; the initial search runs and the flag is stripped.

## Self-Review Notes

- **Spec coverage:** consumer function (Task 1) + registration/ordering (Task 2) + reload/share case (covered by `immediate` registration and manual step 5) + no-refresh-on-close preserved (existing guards unchanged). All spec sections mapped.
- **Type consistency:** `onConsumeNoRefresh` name and signature identical across the composable definition, its export, the `Search.vue` destructure, and both specs.
- **No placeholders:** all steps contain concrete code and exact commands.
