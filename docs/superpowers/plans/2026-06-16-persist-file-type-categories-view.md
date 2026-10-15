# Persist File-Type Categories View Toggle — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist the file-type filter's grouped (categories) vs flat (list) view preference so it survives reloads and navigation.

**Architecture:** A new `useContentTypeGroupedView` composable owns the persisted preference (writable computed backed by the `search` settings view), mirroring the existing `useContentTypeCategoryCollapse`. `FilterTypeFileTypes.vue` consumes it instead of holding local `defineModel` state. The default is seeded in the app store's `SETTINGS`. Persistence is global, via the Pinia persist plugin → localStorage.

**Tech Stack:** Vue 3 (`<script setup>`, Composition API), Pinia (app store with persist plugin), Vitest + Vue Test Utils.

---

## File Structure

- **Create:** `src/composables/useContentTypeGroupedView.js` — owns the persisted grouped/flat preference; depends only on `useAppStore`.
- **Modify:** `src/store/modules/app.js` — add the `groupedContentTypeView` default to `SETTINGS.views.search`.
- **Modify:** `src/components/Filter/FilterType/FilterTypeFileTypes.vue` — replace `defineModel('grouped')` with the composable.
- **Create:** `tests/unit/specs/composables/useContentTypeGroupedView.spec.js` — composable unit tests.
- **Modify:** `tests/unit/specs/components/Filter/FilterType/FilterTypeFileTypes.spec.js` — drive grouped state via the persisted setting instead of the removed prop.

---

## Task 1: Composable `useContentTypeGroupedView`

**Files:**
- Create: `src/composables/useContentTypeGroupedView.js`
- Test: `tests/unit/specs/composables/useContentTypeGroupedView.spec.js`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/specs/composables/useContentTypeGroupedView.spec.js`:

```js
import { createApp } from 'vue'

import CoreSetup from '~tests/unit/CoreSetup'
import { useContentTypeGroupedView } from '@/composables/useContentTypeGroupedView'
import { useAppStore } from '@/store/modules'

describe('useContentTypeGroupedView', () => {
  // Mount the composable inside a throwaway app so inject()/Pinia work.
  function withSetup(plugins) {
    let result
    const app = createApp({
      setup() {
        result = useContentTypeGroupedView()
        return {}
      }
    })
    plugins.forEach(plugin => app.use(plugin))
    app.mount(document.createElement('div'))
    return result
  }

  let core

  beforeEach(() => {
    core = CoreSetup.init().useAll()
    // The setting persists to localStorage, which a fresh Pinia rehydrates —
    // reset it so each test starts from the flat-view baseline regardless of
    // execution order.
    useAppStore().setSettings('search', 'groupedContentTypeView', false)
  })

  it('defaults to the flat view (false)', () => {
    useAppStore().setSettings('search', 'groupedContentTypeView', undefined)
    const grouped = withSetup(core.plugins)
    expect(grouped.value).toBe(false)
  })

  it('persists the value to the search settings when set to true', () => {
    const grouped = withSetup(core.plugins)
    grouped.value = true
    expect(useAppStore().getSettings('search', 'groupedContentTypeView')).toBe(true)
  })

  it('reflects pre-existing persisted state', () => {
    useAppStore().setSettings('search', 'groupedContentTypeView', true)
    const grouped = withSetup(core.plugins)
    expect(grouped.value).toBe(true)
  })

  it('persists false when toggled back off', () => {
    const grouped = withSetup(core.plugins)
    grouped.value = true
    grouped.value = false
    expect(useAppStore().getSettings('search', 'groupedContentTypeView')).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:unit tests/unit/specs/composables/useContentTypeGroupedView.spec.js`
Expected: FAIL — cannot resolve `@/composables/useContentTypeGroupedView`.

- [ ] **Step 3: Write minimal implementation**

Create `src/composables/useContentTypeGroupedView.js`:

```js
import { computed } from 'vue'

import { useAppStore } from '@/store/modules'

const SETTINGS_VIEW = 'search'
const SETTINGS_NAME = 'groupedContentTypeView'

/**
 * Persisted grouped (categories) vs flat (list) view preference for the
 * file-types filter. Flat is the default. Stored globally under the `search`
 * settings view, mirroring useContentTypeCategoryCollapse.
 *
 * @returns {import('vue').WritableComputedRef<boolean>}
 */
export function useContentTypeGroupedView() {
  const appStore = useAppStore()

  return computed({
    get: () => appStore.getSettings(SETTINGS_VIEW, SETTINGS_NAME) ?? false,
    set: value => appStore.setSettings(SETTINGS_VIEW, SETTINGS_NAME, value)
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test:unit tests/unit/specs/composables/useContentTypeGroupedView.spec.js`
Expected: PASS (4 passing).

- [ ] **Step 5: Commit**

```bash
git add src/composables/useContentTypeGroupedView.js tests/unit/specs/composables/useContentTypeGroupedView.spec.js
git commit -m "feat(useContentTypeGroupedView): persist grouped file-types view preference"
```

---

## Task 2: Seed the default setting in the app store

**Files:**
- Modify: `src/store/modules/app.js:31-38` (the `search` block inside `SETTINGS.views`)

- [ ] **Step 1: Add the default**

In `src/store/modules/app.js`, add `groupedContentTypeView: false` to the `search` view, after `expandedContentTypeCategories`:

```js
        search: {
          layout: LAYOUTS.LIST,
          orderBy: ['_score', 'desc'],
          perPage: '25',
          properties: ['title', 'thumbnail', 'highlights', 'project'],
          searchOperator: SEARCH_OPERATORS.OR,
          expandedContentTypeCategories: [],
          groupedContentTypeView: false
        },
```

Note: no `SETTINGS_VERSION` bump — the composable's `?? false` fallback covers already-persisted state that lacks the key, so existing users keep defaulting to the flat view.

- [ ] **Step 2: Run the app-store tests to verify nothing broke**

Run: `yarn test:unit tests/unit/specs/store/modules/app.spec.js`
Expected: PASS (existing suite unaffected). If no such spec exists, skip to Step 3.

- [ ] **Step 3: Commit**

```bash
git add src/store/modules/app.js
git commit -m "feat(app store): add groupedContentTypeView search setting default"
```

---

## Task 3: Wire the composable into `FilterTypeFileTypes.vue`

**Files:**
- Modify: `src/components/Filter/FilterType/FilterTypeFileTypes.vue` (import block, line 30)

- [ ] **Step 1: Add the import**

In `src/components/Filter/FilterType/FilterTypeFileTypes.vue`, add the import alongside the other composable imports (after the `useContentTypeCategoryCollapse` import on line 17):

```js
import { useContentTypeGroupedView } from '@/composables/useContentTypeGroupedView'
```

- [ ] **Step 2: Replace the local model with the composable**

Replace line 30:

```js
const grouped = defineModel('grouped', { type: Boolean, default: false })
```

with:

```js
const grouped = useContentTypeGroupedView()
```

Leave the `collapse` model (line 29) and everything else unchanged. The template needs no edits — `v-model:grouped="grouped"` (line 192) and `v-if="grouped"` (line 152) both work against the writable computed.

- [ ] **Step 3: Run the existing component tests to see the expected break**

Run: `yarn test:unit tests/unit/specs/components/Filter/FilterType/FilterTypeFileTypes.spec.js`
Expected: FAIL — tests that pass `grouped` as a prop or assert the default-false behavior no longer control the view, because `grouped` is no longer a prop. This is fixed in Task 4.

- [ ] **Step 4: Commit**

```bash
git add src/components/Filter/FilterType/FilterTypeFileTypes.vue
git commit -m "feat(FilterTypeFileTypes): persist categories view via useContentTypeGroupedView"
```

---

## Task 4: Update `FilterTypeFileTypes.spec.js` to drive the persisted setting

**Files:**
- Modify: `tests/unit/specs/components/Filter/FilterType/FilterTypeFileTypes.spec.js`

- [ ] **Step 1: Reset the setting in the suite's `beforeEach`**

Find each `beforeEach` that calls `CoreSetup.init().useAll()` (the existing collapse reset at line ~1262 shows the pattern). In the top-level `beforeEach` for the suite, after the core is initialised and `useAppStore` is available, add:

```js
useAppStore().setSettings('search', 'groupedContentTypeView', false)
```

Ensure `useAppStore` is imported at the top of the file (it already is — it's used for the `expandedContentTypeCategories` reset). If it is not imported in a given `describe` scope, add:

```js
import { useAppStore } from '@/store/modules'
```

- [ ] **Step 2: Replace `grouped` prop usage with the persisted setting**

For every mount that passes `grouped: true` (e.g. lines ~100-103 and the `remountWithAvailability` helper at ~1346-1361), remove the `grouped` prop and instead set the preference before mounting:

```js
useAppStore().setSettings('search', 'groupedContentTypeView', true)
```

For `remountWithAvailability({ ..., grouped = true })`, set the setting from the helper argument before mounting and drop `grouped` from the mounted `props`:

```js
const remountWithAvailability = ({ isAvailable, isLoading, collapse = false, grouped = true }) => {
  useAppStore().setSettings('search', 'groupedContentTypeView', grouped)
  // ...mount with props: { filter, collapse } (no grouped prop)
}
```

- [ ] **Step 3: Fix the default and toggle assertions**

- The "should have grouped set to false by default" test (line ~123): keep the assertion `expect(wrapper.findComponent(ButtonToggleContentTypesView).props('grouped')).toBe(false)`. With the setting reset to `false` in `beforeEach`, this passes unchanged (mount with `props: { filter, collapse: false }`).
- The "toggle grouped to false when the button is clicked" test (line ~133): before mount, set `useAppStore().setSettings('search', 'groupedContentTypeView', true)` so the button starts grouped, then assert it reads `false` after the click.
- The "toggle grouped back to true on second click" test (line ~138): after a second click assert `true`. No prop needed; the click drives the persisted computed.

- [ ] **Step 4: Run the component tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/components/Filter/FilterType/FilterTypeFileTypes.spec.js`
Expected: PASS (entire suite green).

- [ ] **Step 5: Run the full filter + composable test scope to catch regressions**

Run: `yarn test:unit tests/unit/specs/composables/useContentTypeGroupedView.spec.js tests/unit/specs/composables/useContentTypeCategoryCollapse.spec.js tests/unit/specs/components/Filter/FilterType/FilterTypeFileTypes.spec.js`
Expected: PASS (all three suites green).

- [ ] **Step 6: Commit**

```bash
git add tests/unit/specs/components/Filter/FilterType/FilterTypeFileTypes.spec.js
git commit -m "test(FilterTypeFileTypes): drive categories view via persisted setting"
```

---

## Manual verification (after all tasks)

- [ ] Run the app, open the file-type filter, toggle to the categories (grouped) view.
- [ ] Reload the page → the filter still shows the categories view.
- [ ] Toggle back to the flat list, reload → the filter shows the flat list.
- [ ] Open a legacy-index project with grouped persisted → the explanatory overlay still appears (unchanged behavior).
