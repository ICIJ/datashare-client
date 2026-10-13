# Advanced Search Modal Finalize — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the already-built Advanced Search modal reachable in the running app by re-enabling its toggle button, and lock the integration with a component test.

**Architecture:** The modal, its Lucene generate/parse logic, and the `@search → searchStore.query` handler are already in `SearchToolbar.vue`; only the toggle button that flips `showAdvancedSearch` is commented out. Uncomment it, then add the first `SearchToolbar` component test to prove the open-and-search wiring end to end. No ES needed — the search store's `query` action is spied so `refresh()` never runs.

**Tech Stack:** Vue 3 `<script setup>`, Vitest, `@vue/test-utils` (`shallowMount`), Pinia (`useSearchStore`), the project's `CoreSetup` test harness.

---

## File Structure

- **Modify:** `src/components/Search/SearchToolbar/SearchToolbar.vue` — uncomment the `ButtonToggleAdvancedSearch` import and its template block. Single responsibility unchanged (the search toolbar's controls).
- **Create:** `tests/unit/specs/components/Search/SearchToolbar/SearchToolbar.spec.js` — first test for this component; covers the toggle→modal→search wiring. ES-free.

No other files change. `luceneQuery.js`, `useAdvancedSearchForm.js`, and the modal internals are complete and out of scope.

---

## Notes for the implementer (read once)

- Commit only source + test changes.
- Commit messages in this repo use Conventional Commits with a scope, e.g. `feat(SearchToolbar): ...`. **No body, no co-author trailer** for source commits (repo convention).
- Test harness boot is always: `const { plugins, config } = CoreSetup.init().useAll().useRouterWithoutGuards()`.
- The toggle button (`ButtonToggleAdvancedSearch`) uses `defineModel('active')`, so it emits `update:active`. The modal (`SearchAdvancedModal`) uses `defineModel({ type: Boolean })` (emits `update:modelValue`) plus a `search` event.
- `searchStore.query(queryString)` internally calls `refresh()`, which hits Elasticsearch. The test **must** spy on `query` with a mock so no network/ES call happens.
- Run a single spec file with: `yarn test:unit tests/unit/specs/components/Search/SearchToolbar/SearchToolbar.spec.js`

---

### Task 1: Component test for the toggle→modal→search wiring

**Files:**
- Create: `tests/unit/specs/components/Search/SearchToolbar/SearchToolbar.spec.js`
- Modify: `src/components/Search/SearchToolbar/SearchToolbar.vue` (lines 4 and 85–88)

- [ ] **Step 1: Write the failing test**

Create `tests/unit/specs/components/Search/SearchToolbar/SearchToolbar.spec.js`:

```js
import { nextTick } from 'vue'
import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SearchToolbar from '@/components/Search/SearchToolbar/SearchToolbar'
import { useSearchStore } from '@/store/modules'

describe('SearchToolbar.vue', () => {
  const { plugins } = CoreSetup.init().useAll().useRouterWithoutGuards()

  let searchStore

  const factory = (props = {}) => {
    return shallowMount(SearchToolbar, {
      props,
      global: { plugins, renderStubDefaultSlot: true }
    })
  }

  beforeEach(() => {
    searchStore = useSearchStore()
    searchStore.reset()
    // query() would call refresh() and hit Elasticsearch; stub it.
    vi.spyOn(searchStore, 'query').mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the advanced-search toggle button', () => {
    const wrapper = factory()
    expect(wrapper.findComponent({ name: 'ButtonToggleAdvancedSearch' }).exists()).toBe(true)
  })

  it('opens the advanced-search modal when the toggle is activated', async () => {
    const wrapper = factory()
    const modal = wrapper.findComponent({ name: 'SearchAdvancedModal' })
    expect(modal.props('modelValue')).toBe(false)

    wrapper.findComponent({ name: 'ButtonToggleAdvancedSearch' }).vm.$emit('update:active', true)
    await nextTick()

    expect(modal.props('modelValue')).toBe(true)
  })

  it('passes the active query to the modal as initialQuery', async () => {
    searchStore.setQuery('+Paris')
    const wrapper = factory()
    await nextTick()
    expect(wrapper.findComponent({ name: 'SearchAdvancedModal' }).props('initialQuery')).toBe('+Paris')
  })

  it('runs a store query when the modal emits a search', () => {
    const wrapper = factory()
    wrapper.findComponent({ name: 'SearchAdvancedModal' }).vm.$emit('search', '+Paris +London')
    expect(searchStore.query).toHaveBeenCalledWith('+Paris +London')
  })

  it('does not run a query when the modal emits an empty search', () => {
    const wrapper = factory()
    wrapper.findComponent({ name: 'SearchAdvancedModal' }).vm.$emit('search', '')
    expect(searchStore.query).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn test:unit tests/unit/specs/components/Search/SearchToolbar/SearchToolbar.spec.js`

Expected: the first two specs FAIL — `renders the advanced-search toggle button` and `opens the advanced-search modal when the toggle is activated` — because `ButtonToggleAdvancedSearch` is commented out, so `findComponent({ name: 'ButtonToggleAdvancedSearch' })` returns a non-existent wrapper (`.exists()` is `false`; `.vm` access throws). The `initialQuery` and `search`/empty-search specs may already PASS (that wiring exists).

- [ ] **Step 3: Re-enable the toggle button — uncomment the import**

In `src/components/Search/SearchToolbar/SearchToolbar.vue`, change line 4 from:

```js
// import ButtonToggleAdvancedSearch from '@/components/Button/ButtonToggleAdvancedSearch'
```

to:

```js
import ButtonToggleAdvancedSearch from '@/components/Button/ButtonToggleAdvancedSearch'
```

- [ ] **Step 4: Re-enable the toggle button — uncomment the template block**

In the same file, replace the commented block (currently lines 85–88):

```html
      <!--  <button-toggle-advanced-search
        v-model:active="showAdvancedSearch"
        class="search-toolbar__toggle-advanced-search"
      />-->
```

with the live element:

```html
      <button-toggle-advanced-search
        v-model:active="showAdvancedSearch"
        class="search-toolbar__toggle-advanced-search"
      />
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `yarn test:unit tests/unit/specs/components/Search/SearchToolbar/SearchToolbar.spec.js`

Expected: all five specs PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/Search/SearchToolbar/SearchToolbar.vue tests/unit/specs/components/Search/SearchToolbar/SearchToolbar.spec.js
git commit -m "feat(SearchToolbar): enable the advanced search toggle button"
```

---

### Task 2: Regression check + manual verification

**Files:** none changed — this task only runs checks.

- [ ] **Step 1: Run the advanced-search unit suites (ES-free)**

Run:

```bash
yarn test:unit \
  tests/unit/specs/utils/luceneQuery.spec.js \
  tests/unit/specs/components/Search/SearchAdvancedModal/SearchAdvancedModal.spec.js \
  tests/unit/specs/composables/useAdvancedSearchForm.spec.js \
  tests/unit/specs/components/Search/SearchToolbar/SearchToolbar.spec.js
```

Expected: all suites PASS. No regression from the toggle change.

- [ ] **Step 2: Lint the touched files**

Run: `yarn lint` (or the project's configured lint script for staged files).
Expected: no new errors in `SearchToolbar.vue` or the new spec.

- [ ] **Step 3: Manual verification in the running app**

Start the dev server (the project's usual command, e.g. `yarn dev`) and, on the search view:

1. Confirm the eyeglasses **Advanced search** button appears in the toolbar between the search bar and the settings toggle.
2. Click it → the modal opens.
3. Fill "All these words" with `Paris London`, submit → modal closes, results refresh, and the search bar shows the generated query (e.g. `+Paris +London`).
4. Re-open the modal → the form pre-populates from that query (`All these words` shows `Paris London`).
5. Resize narrow (below the compact breakpoint) → confirm the toggle collapses to its square/icon-only form without breaking toolbar layout.

Expected: every step behaves as described. If step 5 surfaces a layout issue, fix it within `SearchToolbar`'s existing `--compact` handling — that fix gets its own commit (`fix(SearchToolbar): ...`).

- [ ] **Step 4: No commit**

This task changes no files unless step 5 surfaces a layout fix; commit that separately if it occurs.

---

## Self-Review

**Spec coverage:**
- Spec "Scope" (uncomment import + template block) → Task 1 Steps 3–4. ✅
- Spec "Data flow closes the loop" (toggle opens modal; search event → `searchStore.query`; `initialQuery` from `q`) → Task 1 specs 2, 3, 4. ✅
- Spec "Verification" item 1 (new SearchToolbar component test, all four bullets) → Task 1 Step 1 (renders, opens, runs query on search, no query on empty). ✅
- Spec "Verification" item 2 (manual app check incl. pre-populate) → Task 2 Step 3. ✅
- Spec "Verification" item 3 (regression suites, ES-free) → Task 2 Step 1. ✅
- Spec "Risks" (compact-layout fallback) → Task 2 Step 3 item 5 + note. ✅

**Placeholder scan:** No TBD/TODO; every code step shows full code and exact commands. ✅

**Type/name consistency:** Component names used in `findComponent` (`ButtonToggleAdvancedSearch`, `SearchAdvancedModal`) match the SFC names; events (`update:active`, `search`) match the components' `defineModel`/`defineEmits`; store method `query` / `setQuery` / `reset` match `src/store/modules/search.js`. ✅
