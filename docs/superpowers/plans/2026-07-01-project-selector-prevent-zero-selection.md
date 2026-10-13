# Project Selector: Prevent Zero Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Disable the checkbox of the last remaining selected project in the project dropdown so it can never be unchecked to zero.

**Architecture:** The "keep at least one" guard already lives in `useDropdownSelection.js`. Expose a derived helper (`isRequiredSelection`) from that composable as the single source of truth, surface it through the `DropdownSelector` `item` slot, and forward it down `ProjectDropdownSelector` → `ProjectDropdownSelectorEntry` → the checkbox's existing `disabled` prop.

**Tech Stack:** Vue 3 (`<script setup>`), BootstrapVueNext (`b-form-checkbox`), Vitest + Vue Test Utils, lodash.

## Global Constraints

- No single-line `if` statements without braces.
- Follow existing `<script setup>` component style; do not restructure unrelated code.
- The composable guard rule stays authoritative — do not duplicate the "keep at least one" rule in the view layer.

---

### Task 1: Expose `isRequiredSelection` from `useDropdownSelection`

**Files:**
- Modify: `src/composables/useDropdownSelection.js`
- Test: `tests/unit/specs/composables/useDropdownSelection.spec.js`

**Interfaces:**
- Consumes: existing `multiple` (ref), `isSelected(option)`, `selectedValues` (computed array) inside the composable.
- Produces: `isRequiredSelection(option) => Boolean` — `true` when `option` is the sole selected value in multiple mode (i.e. unselecting it is not allowed), `false` otherwise. Added to the object returned by `useDropdownSelection`.

- [ ] **Step 1: Write the failing test**

Add these tests inside the existing `describe('useDropdownSelection', ...)` block in `tests/unit/specs/composables/useDropdownSelection.spec.js`:

```js
it('isRequiredSelection is true for the only selected option in multiple mode', () => {
  const { api } = setup([{ name: 'a' }], true)
  expect(api.isRequiredSelection({ name: 'a' })).toBe(true)
})

it('isRequiredSelection is false when more than one option is selected', () => {
  const { api } = setup([{ name: 'a' }, { name: 'b' }], true)
  expect(api.isRequiredSelection({ name: 'a' })).toBe(false)
  expect(api.isRequiredSelection({ name: 'b' })).toBe(false)
})

it('isRequiredSelection is false for an unselected option', () => {
  const { api } = setup([{ name: 'a' }], true)
  expect(api.isRequiredSelection({ name: 'b' })).toBe(false)
})

it('isRequiredSelection is false in single-select mode', () => {
  const { api } = setup({ name: 'a' }, false)
  expect(api.isRequiredSelection({ name: 'a' })).toBe(false)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn vitest run tests/unit/specs/composables/useDropdownSelection.spec.js`
Expected: FAIL — `api.isRequiredSelection is not a function`.

- [ ] **Step 3: Write minimal implementation**

In `src/composables/useDropdownSelection.js`, add the helper after `isSelected` (around line 41) and export it in the returned object.

Add the function:

```js
  // A selected option in multiple mode can't be unselected if it's the last one.
  const isRequiredSelection = (option) => {
    return multiple.value && isSelected(option) && selectedValues.value.length <= 1
  }
```

Then add `isRequiredSelection` to the returned object (the `return { ... }` at the end):

```js
  return {
    keyOf,
    selectedValues,
    selectedKeys,
    isSelected,
    isRequiredSelection,
    selectValue,
    unselectValue,
    toggleValue,
    toggleUniqueValue,
    selectAll,
    unselectAll
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn vitest run tests/unit/specs/composables/useDropdownSelection.spec.js`
Expected: PASS (all tests, including the 4 new ones).

- [ ] **Step 5: Commit**

```bash
git add src/composables/useDropdownSelection.js tests/unit/specs/composables/useDropdownSelection.spec.js
git commit -m "feat: add isRequiredSelection guard helper to useDropdownSelection"
```

---

### Task 2: Disable the last selected project's checkbox

**Files:**
- Modify: `src/components/DropdownSelector/DropdownSelector.vue`
- Modify: `src/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.vue`
- Modify: `src/components/Project/ProjectDropdownSelector/ProjectDropdownSelectorEntry.vue`
- Test: `tests/unit/specs/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.spec.js`

**Interfaces:**
- Consumes: `isRequiredSelection(option)` from Task 1 (destructured from `useDropdownSelection`).
- Produces:
  - `DropdownSelector` `item` slot gains a `selectionRequired: Boolean` binding.
  - `ProjectDropdownSelectorEntry` gains a `selectionRequired: Boolean` prop, forwarded to `ProjectDropdownSelectorCheckbox`'s existing `disabled` prop.
- `ProjectDropdownSelectorCheckbox.vue` is unchanged (its `disabled` prop already wires into `b-form-checkbox`).

- [ ] **Step 1: Write the failing test**

Add these tests to `tests/unit/specs/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.spec.js`, inside the existing `describe` block:

```js
it('disables the checkbox of the only selected project', () => {
  const props = { modelValue: [{ name: 'foo' }], projects, teleportDisabled: true }
  const wrapper = mount(ProjectDropdownSelector, { props, global: { plugins } })
  const activeInput = wrapper.find('.dropdown-item.active input[type=checkbox]')
  expect(activeInput.attributes('disabled')).toBeDefined()
})

it('does not disable checkboxes when two projects are selected', () => {
  const props = { modelValue: [{ name: 'foo' }, { name: 'bar' }], projects, teleportDisabled: true }
  const wrapper = mount(ProjectDropdownSelector, { props, global: { plugins } })
  const activeInputs = wrapper.findAll('.dropdown-item.active input[type=checkbox]')
  expect(activeInputs).toHaveLength(2)
  activeInputs.forEach((input) => {
    expect(input.attributes('disabled')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn vitest run tests/unit/specs/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.spec.js`
Expected: FAIL on the first new test — the checkbox has no `disabled` attribute yet.

- [ ] **Step 3: Expose `selectionRequired` from `DropdownSelector`**

In `src/components/DropdownSelector/DropdownSelector.vue`:

Add `isRequiredSelection` to the destructured composable return (around lines 152-153):

```js
const {
  keyOf,
  selectedValues,
  selectedKeys,
  isSelected,
  isRequiredSelection,
  toggleValue,
  toggleUniqueValue,
  selectAll,
  unselectAll
} = useDropdownSelection(modelValue, toRef(props, 'options'), { multiple, optionKey: props.optionKey })
```

Add the `selectionRequired` binding to the `item` slot `v-bind` (around lines 340-348):

```html
      <slot
        name="item"
        v-bind="{
          option,
          index,
          selected: isSelected(option),
          selectionRequired: isRequiredSelection(option),
          focused: focusIndex === index,
          toggle: (event) => toggleValue(event, option),
          toggleUnique: (event) => toggleUniqueValue(event, option)
        }"
      />
```

- [ ] **Step 4: Forward `selectionRequired` through `ProjectDropdownSelector`**

In `src/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.vue`, update the `#item` slot template (around lines 124-133) to read the new binding and pass it to the entry:

```html
    <template #item="{ option: project, selected, selectionRequired, focused, toggle, toggleUnique }">
      <project-dropdown-selector-entry
        :project="project"
        :focus="focused"
        :selected="selected"
        :selection-required="selectionRequired"
        :no-checkbox="!multiple"
        @toggle-value="toggle($event)"
        @toggle-unique-value="toggleUnique($event)"
      />
    </template>
```

- [ ] **Step 5: Add the prop to `ProjectDropdownSelectorEntry` and wire the checkbox**

In `src/components/Project/ProjectDropdownSelector/ProjectDropdownSelectorEntry.vue`:

Add the prop to `defineProps` (after `selected`, around lines 15-20):

```js
  selected: {
    type: Boolean
  },
  selectionRequired: {
    type: Boolean
  },
  noCheckbox: {
    type: Boolean
  }
```

Forward it to the checkbox in the template (around lines 45-48):

```html
    <project-dropdown-selector-checkbox
      v-if="!noCheckbox"
      :model-value="selected"
      :disabled="selectionRequired"
    />
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `yarn vitest run tests/unit/specs/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.spec.js`
Expected: PASS (all tests, including the 2 new ones).

- [ ] **Step 7: Run the broader dropdown suite to check for regressions**

Run: `yarn vitest run tests/unit/specs/components/DropdownSelector tests/unit/specs/components/Project/ProjectDropdownSelector tests/unit/specs/composables/useDropdownSelection.spec.js`
Expected: PASS (no regressions).

- [ ] **Step 8: Commit**

```bash
git add src/components/DropdownSelector/DropdownSelector.vue src/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.vue src/components/Project/ProjectDropdownSelector/ProjectDropdownSelectorEntry.vue tests/unit/specs/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.spec.js
git commit -m "fix(project-selector): disable last selected project checkbox to prevent zero selection"
```

---

## Self-Review

**Spec coverage:**
- "Disable the checkbox of the last remaining selected project" → Task 2 (checkbox `disabled` via `selectionRequired`).
- "Rule lives in the composable (single source of truth)" → Task 1 (`isRequiredSelection`).
- "All other checkboxes stay interactive / re-enable when 2+ selected" → Task 2 second test asserts no disable with two selected.
- "Single-select mode unaffected" → Task 1 test asserts `isRequiredSelection` false in single mode; entry renders no checkbox when `noCheckbox`.
- Tests named in the spec (`useDropdownSelection.spec.js`, `ProjectDropdownSelector.spec.js`) → both covered.

**Placeholder scan:** No TBD/TODO; every code step shows complete code.

**Type consistency:** `isRequiredSelection(option) => Boolean` defined in Task 1, consumed in Task 2's `DropdownSelector` destructure and slot binding `selectionRequired`, propagated as the `selectionRequired` prop through `ProjectDropdownSelector` and `ProjectDropdownSelectorEntry`, and mapped to the checkbox's existing `disabled` prop. Names are consistent across tasks.
