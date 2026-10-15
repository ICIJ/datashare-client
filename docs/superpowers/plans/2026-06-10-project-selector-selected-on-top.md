# Project Selector: Selected Projects On Top — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** In the project selector dropdown, selected projects always render at the top of the option list (below the untouched "All projects" checkbox), with the ordering frozen while the dropdown is open and refreshed each time it re-opens.

**Architecture:** Add an `orderedOptions` computed to `ProjectDropdownSelector.vue` that places "pinned" project names first via a stable sort. The pinned set is a snapshot of the current selection, captured at setup and refreshed whenever the dropdown opens. Opening is detected through a new additive `shown` event re-emitted by `SearchBarInputDropdown.vue`.

**Tech Stack:** Vue 3 `<script setup>`, lodash, bootstrap-vue-next `b-dropdown`, Vitest + @vue/test-utils.

---

## File Structure

- **Modify** `src/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.vue` — add `pinnedNames` ref, `pinSelected()`, `orderedOptions` computed; pass `orderedOptions` to the dropdown; refresh pin on `shown`; point keyboard-focus indexing at `orderedOptions`.
- **Modify** `src/components/Search/SearchBar/SearchBarInputDropdown.vue` — additively re-emit `b-dropdown`'s `shown` event so consumers know when the dropdown opens.
- **Test** `tests/unit/specs/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.spec.js` — add ordering, stability, search, and re-open tests.

---

## Task 1: Selected projects render on top (frozen snapshot)

**Files:**
- Modify: `src/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.vue`
- Test: `tests/unit/specs/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.spec.js`

- [ ] **Step 1: Write the failing tests**

Add these tests inside the existing `describe('ProjectDropdownSelector.vue', ...)` block in `ProjectDropdownSelector.spec.js`. They reuse the existing `projects` array (`local-datashare`/Default, `foo`/Foo, `bar`/Bar) and `plugins`. Add the import for the search child at the top of the file (used by Task 1's search test):

```js
import ProjectDropdownSelectorSearch from '@/components/Project/ProjectDropdownSelector/ProjectDropdownSelectorSearch'
```

```js
it('should render the selected project first in single-select mode', () => {
  const props = { modelValue: { name: 'bar' }, projects, teleportDisabled: true }
  const wrapper = mount(ProjectDropdownSelector, { props, global: { plugins } })
  const items = wrapper.findAll('.dropdown-item')
  expect(items.at(0).text().trim()).toBe('Bar')
})

it('should render selected projects first, in original order, in multi-select mode', () => {
  const props = { modelValue: [{ name: 'bar' }, { name: 'foo' }], projects, teleportDisabled: true }
  const wrapper = mount(ProjectDropdownSelector, { props, global: { plugins } })
  const items = wrapper.findAll('.dropdown-item')
  // foo (index 1) precedes bar (index 2) in the original `projects` order
  expect(items.at(0).text().trim()).toBe('Foo')
  expect(items.at(1).text().trim()).toBe('Bar')
  expect(items.at(2).text().trim()).toBe('Default')
})

it('should keep the selected project on top while a query filters the list', async () => {
  const props = { modelValue: [{ name: 'bar' }], projects, teleportDisabled: true }
  const wrapper = mount(ProjectDropdownSelector, { props, global: { plugins } })
  // "a" matches both "bar"/"Bar" and "local-datashare"/"Default", not "foo"/"Foo"
  wrapper.findComponent(ProjectDropdownSelectorSearch).vm.$emit('update:model-value', 'a')
  await wrapper.vm.$nextTick()
  const items = wrapper.findAll('.dropdown-item')
  expect(items).toHaveLength(2)
  expect(items.at(0).text().trim()).toBe('Bar')
  expect(items.at(1).text().trim()).toBe('Default')
})

it('should not reorder while open when the selection changes', async () => {
  const props = { modelValue: [{ name: 'bar' }], projects, teleportDisabled: true }
  const wrapper = mount(ProjectDropdownSelector, { props, global: { plugins } })
  // Selection changes while open (no re-open) — the pinned snapshot stays frozen
  await wrapper.setProps({ modelValue: [{ name: 'bar' }, { name: 'foo' }] })
  const items = wrapper.findAll('.dropdown-item')
  // bar is still pinned first; foo became active but keeps its original slot
  expect(items.at(0).text().trim()).toBe('Bar')
  expect(items.at(1).text().trim()).toBe('Default')
  expect(items.at(2).text().trim()).toBe('Foo')
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn test:unit tests/unit/specs/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.spec.js -t "render the selected project first"`
Expected: FAIL — current list renders in raw `projects` order, so item 0 is "Default", not "Bar".

- [ ] **Step 3: Add the pinned snapshot and ordered options**

In `src/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.vue`, in the `<script setup>` State section, add a `pinnedNames` ref next to the existing `query`/`focusIndex` refs:

```js
const query = ref(null)
const focusIndex = ref(-1)
const pinnedNames = ref([])
```

After the `selectAll` computed (just before the `/** Watch */` section), add the snapshot helper and the ordered list, then initialize the snapshot once:

```js
const orderedOptions = computed(() => {
  const isPinned = ({ name } = {}) => pinnedNames.value.includes(name)
  // Array.prototype.sort is stable, so within each group the original order is kept
  return [...options.value].sort((a, b) => Number(isPinned(b)) - Number(isPinned(a)))
})

function pinSelected() {
  pinnedNames.value = selectedProjects.value.map(({ name }) => name)
}

// Snapshot the initial selection so the first open already shows it on top
pinSelected()
```

- [ ] **Step 4: Point the template and keyboard focus at `orderedOptions`**

In the template, change the dropdown's options binding:

```html
    :options="orderedOptions"
```

(replacing `:options="options"` on line ~13). Leave `hasMatches` using `options` — it only counts matches and the count is identical.

In `selectFocusValue`, index into `orderedOptions` so the highlighted row matches the selected value (the rendered list is now `orderedOptions`):

```js
function selectFocusValue($event) {
  if (focusIndex.value > -1) {
    inputDropdown.value.toggleUniqueValue($event, orderedOptions.value[focusIndex.value])
    inputDropdown.value.hide()
  }
}
```

In `moveFocusDown`, clamp against `orderedOptions`:

```js
function moveFocusDown() {
  focusIndex.value = Math.min(orderedOptions.value.length - 1, focusIndex.value + 1)
  moveFocusIntoView()
}
```

In the `watch(query, ...)` callback, use `orderedOptions` for consistency:

```js
watch(query, () => {
  focusIndex.value = query.value && orderedOptions.value.length ? 0 : -1
})
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.spec.js`
Expected: PASS — all existing tests plus the four new ones.

- [ ] **Step 6: Commit**

```bash
git add src/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.vue tests/unit/specs/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.spec.js
git commit -m "feat(ProjectDropdownSelector): show selected projects on top"
```

---

## Task 2: Refresh the pin when the dropdown re-opens

**Files:**
- Modify: `src/components/Search/SearchBar/SearchBarInputDropdown.vue`
- Modify: `src/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.vue`
- Test: `tests/unit/specs/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.spec.js`

- [ ] **Step 1: Write the failing test**

Add this test to `ProjectDropdownSelector.spec.js`. It also needs the `SearchBarInputDropdown` import at the top of the file:

```js
import SearchBarInputDropdown from '@/components/Search/SearchBar/SearchBarInputDropdown'
```

```js
it('should re-pin the current selection each time the dropdown opens', async () => {
  const props = { modelValue: [{ name: 'bar' }], projects, teleportDisabled: true }
  const wrapper = mount(ProjectDropdownSelector, { props, global: { plugins } })
  // Selection changes to foo while open; snapshot is still [bar]
  await wrapper.setProps({ modelValue: [{ name: 'foo' }] })
  expect(wrapper.findAll('.dropdown-item').at(0).text().trim()).toBe('Bar')
  // Re-open: the snapshot refreshes to the live selection
  wrapper.findComponent(SearchBarInputDropdown).vm.$emit('shown')
  await wrapper.vm.$nextTick()
  expect(wrapper.findAll('.dropdown-item').at(0).text().trim()).toBe('Foo')
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn test:unit tests/unit/specs/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.spec.js -t "re-pin the current selection"`
Expected: FAIL — nothing handles `shown`, so item 0 stays "Bar" after the event.

- [ ] **Step 3: Re-emit `shown` from `SearchBarInputDropdown`**

In `src/components/Search/SearchBar/SearchBarInputDropdown.vue`, add `'shown'` to the `emits` array:

```js
  emits: ['hide', 'changed', 'selected', 'shown', 'update:modelValue'],
```

In its template, on the `<b-dropdown ...>` opening tag, add an additive event passthrough (place it next to the existing `ref="dropdown"` attribute). This does not touch the existing `shown()` method or the `initialValue`/`valueChanged` logic:

```html
    @shown="$emit('shown', $event)"
```

- [ ] **Step 4: Handle `shown` in `ProjectDropdownSelector`**

In `src/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.vue`, on the `<search-bar-input-dropdown ...>` opening tag, add a handler that refreshes the snapshot (place it next to the existing `@selected="reset"`):

```html
    @shown="pinSelected"
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `yarn test:unit tests/unit/specs/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.spec.js -t "re-pin the current selection"`
Expected: PASS — after the `shown` event, item 0 is "Foo".

- [ ] **Step 6: Run the full spec to check nothing regressed**

Run: `yarn test:unit tests/unit/specs/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.spec.js`
Expected: PASS — all tests.

- [ ] **Step 7: Commit**

```bash
git add src/components/Search/SearchBar/SearchBarInputDropdown.vue src/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.vue tests/unit/specs/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.spec.js
git commit -m "feat(ProjectDropdownSelector): refresh selected-on-top order on open"
```

---

## Task 3: Verify the SearchBar still passes

**Files:**
- Test: existing `SearchBarInputDropdown` / `SearchBar` specs (no code changes)

- [ ] **Step 1: Run the SearchBar input dropdown specs**

Run: `yarn test:unit tests/unit/specs/components/Search/SearchBar`
Expected: PASS — the additive `shown` emit must not affect existing `SearchBar` behavior. If any spec fails, the change to `SearchBarInputDropdown.vue` altered existing behavior; revisit Task 2 Step 3 (only the `emits` entry and the `@shown="$emit('shown', $event)"` passthrough should have changed).

---

## Self-Review Notes

- **Spec coverage:** Selected-on-top in both modes (Task 1 tests 1–2), stable while open (Task 1 test 4), selected-on-top while searching (Task 1 test 3), refresh on re-open (Task 2), "All projects" untouched and `valueChanged` behavior untouched (Task 2 additive change + Task 3 regression check).
- **Type/name consistency:** `pinnedNames` (ref), `pinSelected()`, `orderedOptions` (computed) used identically across template and script and both tasks. The new event is named `shown` in both `SearchBarInputDropdown` (emit) and `ProjectDropdownSelector` (`@shown`).
- **No placeholders:** every code step shows the exact code; every run step shows the exact command and expected result.
