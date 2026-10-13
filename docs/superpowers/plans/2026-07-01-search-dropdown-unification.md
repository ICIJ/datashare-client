# Search Bar Dropdowns Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two divergent search-bar dropdowns (field and project) with one generic, well-tested `DropdownSelector` primitive that both reduce to thin wrappers of.

**Architecture:** Build a slot-first generic `DropdownSelector` (in `components/DropdownSelector/`) that owns selection, filter-search, keyboard navigation, select-all and pin-selected. Extract the reusable logic into two composables (`useDropdownSelection`, `useListNavigation`). Re-point `ProjectDropdownSelector` at it, introduce `FieldDropdownSelector` to replace `SearchBarInputDropdownForField`, consolidate project resolution into `useSelectedProjects`, extract the Lucene suggestion logic into `useSearchSuggestions`, and rewrite `SearchBar.vue` to `<script setup>`. Delete the legacy `SearchBarInputDropdown` and `SearchBarInputDropdownForField` last, once nothing imports them.

**Tech Stack:** Vue 3 Composition API with `<script setup>` (plain JS — the project is not TypeScript), bootstrap-vue-next (`b-dropdown`), `@icij/murmur`, lodash, Vitest + Vue Test Utils, ESLint.

## Global Constraints

- Plain-JS `<script setup>` only. Do NOT introduce TypeScript.
- `/pirhoo-style`: verbose intention-revealing names; comment *before* each logical block explaining *why*; always braces on `if`/`else` (Stroustrup); imports ordered framework → third-party → local; trailing newline on every file.
- Component naming: PascalCase; children prefixed with parent (`DropdownSelector` / `DropdownSelectorSearch` / `DropdownSelectorSelectAll`).
- Template event handlers use `on*` naming; `defineEmits` with explicit names.
- **`SelectableDropdown` and `AppDropdown` are both unavailable** — `SelectableDropdown` is a globally-registered `@icij/murmur` component used for the suggestions list, and `AppDropdown` already exists in `components/AppDropdown/` as a kebab/actions-menu primitive (consumers: DocumentMetadataActions, DocumentViewerPdfDropdown, NavigationBreadcrumbDropdown, ParentOverflowEntries) — leave it untouched. The generic base is named **`DropdownSelector`** in `components/DropdownSelector/`, matching the existing `ProjectDropdownSelector` / `LoginLocaleDropdownSelector` naming. Subcomponents: `DropdownSelectorSearch`, `DropdownSelectorSelectAll`.
- **Do not break public APIs** of `ProjectDropdownSelector` (also used by `TaskBatchSearchFormDetails.vue`) and `SearchBarInputDropdownForProjects` (also used by `TaskDocumentsForm.vue` and `TaskEntitiesForm.vue`).
- Behavior parity: no visual redesign and no functional change to search suggestions.
- Test runner: `yarn test:unit <path>` runs a single spec file; `yarn test:unit` runs all. Lint: `yarn lint` / `yarn lint:fix`.

---

### Task 1: `useDropdownSelection` composable

Selection logic shared by every dropdown selector: single- and multi-select, plus the "a multiple selection always keeps at least one value" rule.

**Files:**
- Create: `src/composables/useDropdownSelection.js`
- Test: `tests/unit/specs/composables/useDropdownSelection.spec.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `useDropdownSelection(modelValue, allOptions, { multiple, optionKey })` where `modelValue` and `allOptions` are refs and `multiple` is a ref. Returns `{ keyOf, selectedValues, selectedKeys, isSelected, selectValue, unselectValue, toggleValue, toggleUniqueValue, selectAll, unselectAll }`.

- [ ] **Step 1: Write the failing test**

```js
// tests/unit/specs/composables/useDropdownSelection.spec.js
import { ref } from 'vue'

import { useDropdownSelection } from '@/composables/useDropdownSelection'

describe('useDropdownSelection', () => {
  const projects = [{ name: 'a', label: 'A' }, { name: 'b', label: 'B' }, { name: 'c', label: 'C' }]

  function setup(modelValueInit, multipleInit) {
    const modelValue = ref(modelValueInit)
    const allOptions = ref(projects)
    const multiple = ref(multipleInit)
    const api = useDropdownSelection(modelValue, allOptions, { multiple, optionKey: 'name' })
    return { modelValue, api }
  }

  it('reports selected keys for a multiple selection', () => {
    const { api } = setup([{ name: 'a' }, { name: 'b' }], true)
    expect(api.selectedKeys.value).toEqual(['a', 'b'])
  })

  it('reports selected key for a single selection', () => {
    const { api } = setup({ name: 'b' }, false)
    expect(api.selectedKeys.value).toEqual(['b'])
    expect(api.isSelected({ name: 'b' })).toBe(true)
    expect(api.isSelected({ name: 'a' })).toBe(false)
  })

  it('replaces the value in single-select mode when toggling', () => {
    const { modelValue, api } = setup({ name: 'a' }, false)
    api.toggleValue(null, { name: 'c' })
    expect(modelValue.value).toEqual({ name: 'c' })
  })

  it('adds and removes values in multiple mode', () => {
    const { modelValue, api } = setup([{ name: 'a' }], true)
    api.toggleValue({ stopPropagation() {} }, { name: 'b' })
    expect(modelValue.value.map((v) => v.name)).toEqual(['a', 'b'])
    api.toggleValue({ stopPropagation() {} }, { name: 'a' })
    expect(modelValue.value.map((v) => v.name)).toEqual(['b'])
  })

  it('never removes the last value in multiple mode', () => {
    const { modelValue, api } = setup([{ name: 'a' }], true)
    api.toggleValue({ stopPropagation() {} }, { name: 'a' })
    expect(modelValue.value.map((v) => v.name)).toEqual(['a'])
  })

  it('toggleUniqueValue selects a single value even in multiple mode', () => {
    const { modelValue, api } = setup([{ name: 'a' }, { name: 'b' }], true)
    api.toggleUniqueValue(null, { name: 'c' })
    expect(modelValue.value.map((v) => v.name)).toEqual(['c'])
  })

  it('selectAll selects every option, unselectAll keeps the first', () => {
    const { modelValue, api } = setup([{ name: 'a' }], true)
    api.selectAll()
    expect(modelValue.value.map((v) => v.name)).toEqual(['a', 'b', 'c'])
    api.unselectAll()
    expect(modelValue.value.map((v) => v.name)).toEqual(['a'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:unit tests/unit/specs/composables/useDropdownSelection.spec.js`
Expected: FAIL with "Failed to resolve import '@/composables/useDropdownSelection'".

- [ ] **Step 3: Write the composable**

```js
// src/composables/useDropdownSelection.js
import { computed } from 'vue'
import { castArray, isEqual } from 'lodash'

// Resolve a stable key from an option. `optionKey` is either a property
// name (string), a getter function, or null/undefined for identity.
function resolveKey(option, optionKey) {
  if (typeof optionKey === 'function') {
    return optionKey(option)
  }
  if (typeof optionKey === 'string') {
    return option?.[optionKey]
  }
  return option
}

/**
 * Selection logic shared by every dropdown selector.
 *
 * @param {import('vue').Ref} modelValue reactive model value (from defineModel)
 * @param {import('vue').Ref} allOptions reactive list of every selectable option
 * @param {Object} config
 * @param {import('vue').Ref<Boolean>} config.multiple whether selection is multiple
 * @param {String|Function} config.optionKey how to derive a key from an option
 */
export function useDropdownSelection(modelValue, allOptions, { multiple, optionKey }) {
  const keyOf = (option) => resolveKey(option, optionKey)

  // Current selection as an array, regardless of single/multiple mode.
  const selectedValues = computed(() => {
    if (modelValue.value === null || modelValue.value === undefined) {
      return []
    }
    return castArray(modelValue.value)
  })

  const selectedKeys = computed(() => selectedValues.value.map(keyOf))

  const isSelected = (option) => {
    const key = keyOf(option)
    return selectedKeys.value.some((selectedKey) => isEqual(selectedKey, key))
  }

  // Replace the whole model value, honouring single vs multiple mode.
  const setSelection = (values) => {
    modelValue.value = multiple.value ? values : (values[0] ?? null)
  }

  const selectValue = (option) => {
    if (multiple.value) {
      setSelection([...selectedValues.value, option])
    }
    else {
      setSelection([option])
    }
  }

  const unselectValue = (option) => {
    // A multiple selection must always keep at least one value.
    if (multiple.value && selectedValues.value.length > 1) {
      const remaining = selectedValues.value.filter((value) => !isEqual(keyOf(value), keyOf(option)))
      setSelection(remaining)
    }
  }

  // Toggle a value while keeping every other selected value (multiple mode).
  const toggleValue = (event, option) => {
    if (multiple.value) {
      event?.stopPropagation?.()
    }
    if (isSelected(option)) {
      unselectValue(option)
    }
    else {
      selectValue(option)
    }
  }

  // Toggle a value as the ONLY selected value (single-select behaviour even in multiple mode).
  const toggleUniqueValue = (event, option) => {
    if (isSelected(option)) {
      unselectValue(option)
    }
    else {
      setSelection([option])
    }
  }

  const selectAll = () => {
    setSelection([...allOptions.value])
  }

  const unselectAll = () => {
    // Keep the first option so a multiple selection never becomes empty.
    setSelection(allOptions.value.slice(0, 1))
  }

  return {
    keyOf,
    selectedValues,
    selectedKeys,
    isSelected,
    selectValue,
    unselectValue,
    toggleValue,
    toggleUniqueValue,
    selectAll,
    unselectAll
  }
}

export default useDropdownSelection
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test:unit tests/unit/specs/composables/useDropdownSelection.spec.js`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/composables/useDropdownSelection.js tests/unit/specs/composables/useDropdownSelection.spec.js
git commit -m "feat: add useDropdownSelection composable"
```

---

### Task 2: `useListNavigation` composable

Keyboard navigation over a list: a movable focus index plus enter-to-select. Scrolling the focused element into view is the consumer's job (it owns the DOM refs).

**Files:**
- Create: `src/composables/useListNavigation.js`
- Test: `tests/unit/specs/composables/useListNavigation.spec.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `useListNavigation(items, { onEnter })` where `items` is a ref/computed. Returns `{ focusIndex, moveFocusUp, moveFocusDown, resetFocus, selectFocused }`.

- [ ] **Step 1: Write the failing test**

```js
// tests/unit/specs/composables/useListNavigation.spec.js
import { ref } from 'vue'

import { useListNavigation } from '@/composables/useListNavigation'

describe('useListNavigation', () => {
  it('starts with no focused item', () => {
    const { focusIndex } = useListNavigation(ref(['a', 'b', 'c']))
    expect(focusIndex.value).toBe(-1)
  })

  it('moves focus down and up within bounds', () => {
    const { focusIndex, moveFocusDown, moveFocusUp } = useListNavigation(ref(['a', 'b']))
    moveFocusDown()
    expect(focusIndex.value).toBe(0)
    moveFocusDown()
    expect(focusIndex.value).toBe(1)
    moveFocusDown()
    expect(focusIndex.value).toBe(1)
    moveFocusUp()
    moveFocusUp()
    moveFocusUp()
    expect(focusIndex.value).toBe(-1)
  })

  it('calls onEnter with the focused item', () => {
    const onEnter = vi.fn()
    const { moveFocusDown, selectFocused } = useListNavigation(ref(['a', 'b']), { onEnter })
    moveFocusDown()
    const event = { type: 'keydown' }
    selectFocused(event)
    expect(onEnter).toHaveBeenCalledWith(event, 'a')
  })

  it('does not call onEnter when nothing is focused', () => {
    const onEnter = vi.fn()
    const { selectFocused } = useListNavigation(ref(['a']), { onEnter })
    selectFocused({})
    expect(onEnter).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:unit tests/unit/specs/composables/useListNavigation.spec.js`
Expected: FAIL with import resolution error.

- [ ] **Step 3: Write the composable**

```js
// src/composables/useListNavigation.js
import { ref, unref } from 'vue'

/**
 * Keyboard navigation for a list of options: a movable focus index plus
 * enter-to-select. The consumer scrolls the focused element into view.
 *
 * @param {import('vue').Ref<Array>} items reactive list being navigated
 * @param {Object} config
 * @param {Function} config.onEnter called as onEnter(event, focusedItem) on Enter
 */
export function useListNavigation(items, { onEnter } = {}) {
  const focusIndex = ref(-1)

  const moveFocusUp = () => {
    focusIndex.value = Math.max(-1, focusIndex.value - 1)
  }

  const moveFocusDown = () => {
    focusIndex.value = Math.min(unref(items).length - 1, focusIndex.value + 1)
  }

  const resetFocus = () => {
    focusIndex.value = -1
  }

  const selectFocused = (event) => {
    if (focusIndex.value > -1) {
      onEnter?.(event, unref(items)[focusIndex.value])
    }
  }

  return { focusIndex, moveFocusUp, moveFocusDown, resetFocus, selectFocused }
}

export default useListNavigation
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test:unit tests/unit/specs/composables/useListNavigation.spec.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/composables/useListNavigation.js tests/unit/specs/composables/useListNavigation.spec.js
git commit -m "feat: add useListNavigation composable"
```

---

### Task 3: `DropdownSelectorSearch` subcomponent

The built-in search input for `DropdownSelector`. Purely prop-driven (no i18n inside), so wrappers pass localized labels and no locale files change.

**Files:**
- Create: `src/components/DropdownSelector/DropdownSelectorSearch.vue`
- Test: `tests/unit/specs/components/DropdownSelector/DropdownSelectorSearch.spec.js`

**Interfaces:**
- Consumes: `FormControlSearch` (`@/components/Form/FormControl/FormControlSearch`).
- Produces: component `DropdownSelectorSearch`. Model: `modelValue` (String). Props: `hasMatches` (Boolean, default true), `autofocus` (Boolean), `placeholder` (String), `noMatchesLabel` (String). Emits: `up`, `down`, `enter`, `blur`.

- [ ] **Step 1: Write the failing test**

```js
// tests/unit/specs/components/DropdownSelector/DropdownSelectorSearch.spec.js
import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DropdownSelectorSearch from '@/components/DropdownSelector/DropdownSelectorSearch'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'

describe('DropdownSelectorSearch.vue', () => {
  const { plugins } = CoreSetup.init().useAll()

  it('emits the typed query through v-model', async () => {
    const wrapper = mount(DropdownSelectorSearch, { global: { plugins }, props: { modelValue: '' } })
    wrapper.findComponent(FormControlSearch).vm.$emit('update:modelValue', 'foo')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')).toEqual([['foo']])
  })

  it('shows the no-matches label when hasMatches is false', () => {
    const props = { modelValue: 'x', hasMatches: false, noMatchesLabel: 'Nothing here' }
    const wrapper = mount(DropdownSelectorSearch, { global: { plugins }, props })
    expect(wrapper.text()).toContain('Nothing here')
  })

  it('forwards keyboard events', () => {
    const wrapper = mount(DropdownSelectorSearch, { global: { plugins }, props: { modelValue: '' } })
    const search = wrapper.findComponent(FormControlSearch)
    search.vm.$emit('up')
    search.vm.$emit('down')
    search.vm.$emit('enter')
    expect(wrapper.emitted('up')).toHaveLength(1)
    expect(wrapper.emitted('down')).toHaveLength(1)
    expect(wrapper.emitted('enter')).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:unit tests/unit/specs/components/DropdownSelector/DropdownSelectorSearch.spec.js`
Expected: FAIL with import resolution error.

- [ ] **Step 3: Write the component**

```vue
<!-- src/components/DropdownSelector/DropdownSelectorSearch.vue -->
<script setup>
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'

defineOptions({ name: 'DropdownSelectorSearch' })

const modelValue = defineModel({ type: String, default: '' })

defineProps({
  /**
   * Whether the current query matches at least one option.
   */
  hasMatches: {
    type: Boolean,
    default: true
  },
  /**
   * Autofocus the input (used when the dropdown opens).
   */
  autofocus: {
    type: Boolean
  },
  /**
   * Placeholder for the search input.
   */
  placeholder: {
    type: String,
    default: null
  },
  /**
   * Message shown when no option matches the query.
   */
  noMatchesLabel: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['up', 'down', 'enter', 'blur'])
</script>

<template>
  <li class="dropdown-selector-search">
    <div class="b-dropdown-form pt-1 mb-3">
      <form-control-search
        v-model="modelValue"
        :autofocus="autofocus"
        shadow
        :placeholder="placeholder"
        @blur="emit('blur', $event)"
        @up="emit('up', $event)"
        @down="emit('down', $event)"
        @enter="emit('enter', $event)"
      />
    </div>
    <div
      v-if="!hasMatches"
      class="text-center small text-muted pb-2"
    >
      {{ noMatchesLabel }}
    </div>
  </li>
</template>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test:unit tests/unit/specs/components/DropdownSelector/DropdownSelectorSearch.spec.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/DropdownSelector/DropdownSelectorSearch.vue tests/unit/specs/components/DropdownSelector/DropdownSelectorSearch.spec.js
git commit -m "feat: add DropdownSelectorSearch subcomponent"
```

---

### Task 4: `DropdownSelectorSelectAll` subcomponent

The built-in "select all" checkbox row for `DropdownSelector`. Prop-driven label.

**Files:**
- Create: `src/components/DropdownSelector/DropdownSelectorSelectAll.vue`
- Test: `tests/unit/specs/components/DropdownSelector/DropdownSelectorSelectAll.spec.js`

**Interfaces:**
- Consumes: `b-form-checkbox` (bootstrap-vue-next, globally registered).
- Produces: component `DropdownSelectorSelectAll`. Model: `modelValue` (Boolean). Props: `label` (String). No custom emits beyond the model.

- [ ] **Step 1: Write the failing test**

```js
// tests/unit/specs/components/DropdownSelector/DropdownSelectorSelectAll.spec.js
import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DropdownSelectorSelectAll from '@/components/DropdownSelector/DropdownSelectorSelectAll'

describe('DropdownSelectorSelectAll.vue', () => {
  const { plugins } = CoreSetup.init().useAll()

  it('renders its label', () => {
    const wrapper = mount(DropdownSelectorSelectAll, { global: { plugins }, props: { label: 'Select all' } })
    expect(wrapper.text()).toContain('Select all')
  })

  it('emits update:modelValue when toggled', async () => {
    const wrapper = mount(DropdownSelectorSelectAll, {
      global: { plugins },
      props: { label: 'Select all', modelValue: false }
    })
    await wrapper.find('input[type="checkbox"]').setValue(true)
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:unit tests/unit/specs/components/DropdownSelector/DropdownSelectorSelectAll.spec.js`
Expected: FAIL with import resolution error.

- [ ] **Step 3: Write the component**

```vue
<!-- src/components/DropdownSelector/DropdownSelectorSelectAll.vue -->
<script setup>
defineOptions({ name: 'DropdownSelectorSelectAll' })

const modelValue = defineModel({ type: Boolean, default: false })

defineProps({
  /**
   * Label shown next to the checkbox.
   */
  label: {
    type: String,
    default: null
  }
})
</script>

<template>
  <li class="dropdown-selector-select-all">
    <b-form-checkbox v-model="modelValue">
      {{ label }}
    </b-form-checkbox>
  </li>
</template>

<style lang="scss" scoped>
.dropdown-selector-select-all {
  display: flex;

  &:deep(.form-check) {
    flex: 1;
    border-radius: var(--bs-border-radius);
    padding-block: $spacer-xs;

    &:hover {
      background: var(--bs-dropdown-link-hover-bg);
      color: var(--bs-dropdown-link-hover-color);
    }
  }
}
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test:unit tests/unit/specs/components/DropdownSelector/DropdownSelectorSelectAll.spec.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/DropdownSelector/DropdownSelectorSelectAll.vue tests/unit/specs/components/DropdownSelector/DropdownSelectorSelectAll.spec.js
git commit -m "feat: add DropdownSelectorSelectAll subcomponent"
```

---

### Task 5: `DropdownSelector` generic component

The generic slot-first dropdown that owns the b-dropdown wrapper, selection (via `useDropdownSelection`), filter-search, keyboard navigation (via `useListNavigation`), select-all, pin-selected, and unified events.

**Files:**
- Create: `src/components/DropdownSelector/DropdownSelector.vue`
- Test: `tests/unit/specs/components/DropdownSelector/DropdownSelector.spec.js`

**Interfaces:**
- Consumes: `useDropdownSelection`, `useListNavigation`, `DropdownSelectorSearch`, `DropdownSelectorSelectAll`, `iwildcardMatch` (`@/utils/strings`), `AppIcon`.
- Produces: component `DropdownSelector`.
  - Model: `modelValue` (`[String, Array, Object]`).
  - Props: `options` (Array), `optionKey` (`[String, Function]`), `multiple` (Boolean), `searchable` (Boolean), `optionFilter` (Function `(option, query) => Boolean`), `allowSelectAll` (Boolean), `pinSelected` (Boolean), `disabled` (Boolean), `noCaret` (Boolean), `placement` (String), `teleportTo` (`[String, Object]`, default `'body'`), `teleportDisabled` (Boolean), `searchPlaceholder` (String), `selectAllLabel` (String), `noMatchesLabel` (String).
  - Slots: `#button-content="{ selectedOptions, selectedKeys }"` (required), `#item="{ option, index, selected, focused, toggle, toggleUnique }"` (required), `#above="{ visible }"`, `#below="{ visible }"`.
  - Emits: `update:modelValue`, `change`, `shown`, `hidden`.
  - Exposes: `hide()`, `focus()`.

- [ ] **Step 1: Write the failing test**

```js
// tests/unit/specs/components/DropdownSelector/DropdownSelector.spec.js
import { mount } from '@vue/test-utils'
import { h } from 'vue'

import CoreSetup from '~tests/unit/CoreSetup'
import DropdownSelector from '@/components/DropdownSelector/DropdownSelector'
import DropdownSelectorSearch from '@/components/DropdownSelector/DropdownSelectorSearch'

describe('DropdownSelector.vue', () => {
  const { plugins } = CoreSetup.init().useAll()
  const options = [
    { name: 'a', label: 'A' },
    { name: 'b', label: 'B' },
    { name: 'c', label: 'C' }
  ]

  // Mount with slots that expose the option name so we can assert on text.
  function mountComponent(props = {}) {
    return mount(DropdownSelector, {
      props: { options, optionKey: 'name', teleportDisabled: true, ...props },
      global: { plugins },
      slots: {
        'button-content': ({ selectedOptions }) =>
          h('span', { class: 'button' }, selectedOptions.map((o) => o.name).join(',')),
        item: ({ option, selected, toggle }) =>
          h('span', { class: ['entry', { 'entry--selected': selected }], onClick: (e) => toggle(e) }, option.name)
      }
    })
  }

  it('renders one dropdown item per option', () => {
    const wrapper = mountComponent({ modelValue: { name: 'a' } })
    expect(wrapper.findAll('.dropdown-item')).toHaveLength(3)
  })

  it('marks the selected option active', () => {
    const wrapper = mountComponent({ modelValue: { name: 'b' } })
    expect(wrapper.find('.dropdown-item.active .entry').text()).toBe('b')
  })

  it('renders the button content from the selected options', () => {
    const wrapper = mountComponent({ modelValue: [{ name: 'a' }, { name: 'b' }], multiple: true })
    expect(wrapper.find('.button').text()).toBe('a,b')
  })

  it('filters options with a custom optionFilter when searchable', async () => {
    const optionFilter = (option, query) => option.name.includes(query)
    const wrapper = mountComponent({ modelValue: { name: 'a' }, searchable: true, optionFilter })
    wrapper.findComponent(DropdownSelectorSearch).vm.$emit('update:modelValue', 'b')
    await wrapper.vm.$nextTick()
    const items = wrapper.findAll('.dropdown-item')
    expect(items).toHaveLength(1)
    expect(items.at(0).find('.entry').text()).toBe('b')
  })

  it('pins the selected option first when pinSelected is set', () => {
    const wrapper = mountComponent({ modelValue: [{ name: 'c' }], multiple: true, pinSelected: true })
    expect(wrapper.findAll('.dropdown-item').at(0).find('.entry').text()).toBe('c')
  })

  it('emits change on close only when the value changed', async () => {
    const wrapper = mountComponent({ modelValue: { name: 'a' } })
    wrapper.findComponent({ name: 'BDropdown' }).vm.$emit('shown')
    wrapper.findComponent({ name: 'BDropdown' }).vm.$emit('hidden')
    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.findComponent({ name: 'BDropdown' }).vm.$emit('shown')
    await wrapper.setProps({ modelValue: { name: 'b' } })
    wrapper.findComponent({ name: 'BDropdown' }).vm.$emit('hidden')
    expect(wrapper.emitted('change')).toHaveLength(1)
  })

  it('teleports the menu to body by default', () => {
    const wrapper = mount(DropdownSelector, {
      props: { options, optionKey: 'name', modelValue: { name: 'a' } },
      global: { plugins },
      slots: { 'button-content': () => 'x', item: ({ option }) => option.name }
    })
    expect(wrapper.findComponent({ name: 'BDropdown' }).props('teleportTo')).toBe('body')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:unit tests/unit/specs/components/DropdownSelector/DropdownSelector.spec.js`
Expected: FAIL with import resolution error.

- [ ] **Step 3: Write the component**

```vue
<!-- src/components/DropdownSelector/DropdownSelector.vue -->
<script setup>
import { ref, computed, watch, nextTick, toRef, useTemplateRef } from 'vue'
import { AppIcon } from '@icij/murmur'
import { cloneDeep, isArray, isEqual, trim } from 'lodash'

import DropdownSelectorSearch from '@/components/DropdownSelector/DropdownSelectorSearch'
import DropdownSelectorSelectAll from '@/components/DropdownSelector/DropdownSelectorSelectAll'
import { useDropdownSelection } from '@/composables/useDropdownSelection'
import { useListNavigation } from '@/composables/useListNavigation'
import { iwildcardMatch } from '@/utils/strings'

/**
 * A generic, slot-first selection dropdown. Owns selection, optional
 * filter-search, keyboard navigation, select-all and pin-selected.
 */
defineOptions({ name: 'DropdownSelector' })

const modelValue = defineModel({ type: [String, Array, Object], default: null })

const props = defineProps({
  /**
   * Options list (any shape).
   */
  options: {
    type: Array,
    default: () => []
  },
  /**
   * How to derive a unique key from an option: a property name, a getter, or
   * null for identity.
   */
  optionKey: {
    type: [String, Function],
    default: null
  },
  /**
   * Select multiple values (model value is an array).
   */
  multiple: {
    type: Boolean
  },
  /**
   * Show the built-in search input and filter the options.
   */
  searchable: {
    type: Boolean
  },
  /**
   * Predicate used to filter options while searching: (option, query) => Boolean.
   * Defaults to a case-insensitive wildcard match on the option key.
   */
  optionFilter: {
    type: Function,
    default: null
  },
  /**
   * Show the select-all row (multiple mode only).
   */
  allowSelectAll: {
    type: Boolean
  },
  /**
   * Pin selected options to the top; re-pin on close.
   */
  pinSelected: {
    type: Boolean
  },
  /**
   * Disable the dropdown toggler.
   */
  disabled: {
    type: Boolean
  },
  /**
   * Hide the caret in the toggler.
   */
  noCaret: {
    type: Boolean
  },
  /**
   * Dropdown placement (bottom, top, bottom-end, etc).
   */
  placement: {
    type: String,
    default: null
  },
  /**
   * Teleport the menu to a different element.
   */
  teleportTo: {
    type: [String, Object],
    default: 'body'
  },
  /**
   * Disable teleporting the menu.
   */
  teleportDisabled: {
    type: Boolean
  },
  /**
   * Placeholder for the built-in search input.
   */
  searchPlaceholder: {
    type: String,
    default: null
  },
  /**
   * Label for the select-all row.
   */
  selectAllLabel: {
    type: String,
    default: null
  },
  /**
   * Message shown when the search matches no option.
   */
  noMatchesLabel: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['change', 'shown', 'hidden'])

/**
 * Template refs and local state
 */
const dropdown = useTemplateRef('dropdown')
const visible = ref(false)
const query = ref('')
// Snapshot of the value when the dropdown opened, used to detect a change on close.
const initialValue = ref(null)
// Keys pinned to the top; snapshotted on open/close to avoid a visible reorder flash.
const pinnedKeys = ref([])

// Multiple mode is explicit, but an array model value also implies it.
const multiple = computed(() => props.multiple || isArray(modelValue.value))

/**
 * Selection
 */
const { keyOf, selectedValues, selectedKeys, isSelected, toggleValue, toggleUniqueValue, selectAll, unselectAll } =
  useDropdownSelection(modelValue, toRef(props, 'options'), { multiple, optionKey: props.optionKey })

/**
 * Filtering
 */
const hasQuery = computed(() => !!query.value)

// Default filter matches the option key with a wildcard on both sides.
const defaultOptionFilter = (option, currentQuery) => {
  const wildcard = '*' + trim(currentQuery, '*') + '*'
  return iwildcardMatch(String(keyOf(option) ?? ''), wildcard)
}

const filteredOptions = computed(() => {
  if (!props.searchable || !hasQuery.value) {
    return props.options
  }
  const predicate = props.optionFilter ?? defaultOptionFilter
  return props.options.filter((option) => predicate(option, query.value))
})

const hasMatches = computed(() => !hasQuery.value || filteredOptions.value.length > 0)

/**
 * Pinning
 */
const isPinned = (option) => pinnedKeys.value.some((key) => isEqual(key, keyOf(option)))

const orderedOptions = computed(() => {
  if (!props.pinSelected) {
    return filteredOptions.value
  }
  return [...filteredOptions.value].sort((a, b) => Number(isPinned(b)) - Number(isPinned(a)))
})

function pinSelected() {
  pinnedKeys.value = selectedKeys.value.slice()
}

// Snapshot the initial selection so the first open already shows it on top.
pinSelected()

/**
 * Keyboard navigation
 */
const { focusIndex, moveFocusUp, moveFocusDown, resetFocus, selectFocused } = useListNavigation(orderedOptions, {
  onEnter: (event, option) => {
    toggleUniqueValue(event, option)
    hide()
  }
})

// Scroll the focused item into view once the DOM reflects the new index.
watch(focusIndex, async () => {
  await nextTick()
  const focused = dropdown.value?.$el?.querySelector('.dropdown-selector__item--focus')
  focused?.scrollIntoView({ behavior: 'instant', block: 'nearest' })
})

// Typing a query focuses the first match; clearing it removes focus.
watch(query, () => {
  focusIndex.value = query.value && orderedOptions.value.length ? 0 : -1
})

// Selecting a value clears the query and focus, matching the previous behaviour.
watch(selectedKeys, () => {
  if (props.searchable) {
    query.value = ''
  }
  resetFocus()
})

/**
 * Select-all
 */
const selectAllModel = computed({
  get() {
    return props.options.length > 0 && selectedKeys.value.length === props.options.length
  },
  set(value) {
    if (value) {
      selectAll()
    }
    else {
      unselectAll()
    }
  }
})

/**
 * Lifecycle
 */
function onShown($event) {
  initialValue.value = cloneDeep(modelValue.value)
  emit('shown', $event)
}

function onHidden($event) {
  // Re-pin while hidden so the reorder happens off-screen (no visible flash).
  if (props.pinSelected) {
    pinSelected()
  }
  if (!isEqual(initialValue.value, modelValue.value)) {
    emit('change', $event)
  }
  emit('hidden', $event)
}

/**
 * Imperative API
 */
function hide() {
  dropdown.value?.hide?.()
}

function focus() {
  dropdown.value?.$el?.querySelector('.dropdown-toggle')?.focus()
}

defineExpose({ hide, focus })
</script>

<template>
  <b-dropdown
    ref="dropdown"
    v-model="visible"
    class="dropdown-selector"
    :disabled="disabled"
    :placement="placement"
    no-caret
    menu-class="dropdown-selector__menu"
    toggle-class="d-inline-flex align-items-center p-2 text-body"
    boundary="viewport"
    :teleport-to="teleportTo"
    :teleport-disabled="teleportDisabled"
    variant="outline-tertiary"
    @shown="onShown"
    @hidden="onHidden"
  >
    <template #button-content>
      <slot
        name="button-content"
        v-bind="{ selectedOptions: selectedValues, selectedKeys }"
      />
      <app-icon
        v-if="!noCaret"
        class="ms-2"
      >
        <i-ph-caret-down />
      </app-icon>
    </template>

    <dropdown-selector-search
      v-if="searchable"
      v-model="query"
      :autofocus="visible"
      :has-matches="hasMatches"
      :placeholder="searchPlaceholder"
      :no-matches-label="noMatchesLabel"
      @click.stop
      @blur="resetFocus"
      @up="moveFocusUp"
      @down="moveFocusDown"
      @enter="selectFocused"
    />

    <dropdown-selector-select-all
      v-if="allowSelectAll && multiple && hasMatches"
      v-model="selectAllModel"
      :label="selectAllLabel"
      @click.stop
    />

    <!-- @slot Content inserted above the options list -->
    <slot
      name="above"
      v-bind="{ visible }"
    />

    <b-dropdown-item
      v-for="(option, index) in orderedOptions"
      :key="index"
      :active="isSelected(option)"
      :link-class="{ 'p-0': true, 'dropdown-selector__item--focus': focusIndex === index }"
      class="dropdown-selector__item"
    >
      <slot
        name="item"
        v-bind="{
          option,
          index,
          selected: isSelected(option),
          focused: focusIndex === index,
          toggle: (event) => toggleValue(event, option),
          toggleUnique: (event) => toggleUniqueValue(event, option)
        }"
      />
    </b-dropdown-item>

    <!-- @slot Content inserted below the options list -->
    <slot
      name="below"
      v-bind="{ visible }"
    />
  </b-dropdown>
</template>

<style lang="scss">
.dropdown-selector {
  background: $input-bg;
  font-size: inherit;

  .btn {
    display: inline-flex;
    justify-content: center;
    white-space: nowrap;
    flex-wrap: nowrap;

    .input-group-lg & {
      font-size: 1.25rem;
    }

    &.disabled,
    &.disabled:hover {
      opacity: 1;
      background: $tertiary !important;
      color: $text-muted;
    }
  }

  &__menu {
    max-height: 50vh;
    overflow: auto;
    z-index: $zindex-sticky;
  }
}
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test:unit tests/unit/specs/components/DropdownSelector/DropdownSelector.spec.js`
Expected: PASS (7 tests). If the `change`-on-close test is flaky due to the `visible` v-model, assert against the emitted events after emitting `shown`/`hidden` on the `BDropdown` child (as written).

- [ ] **Step 5: Commit**

```bash
git add src/components/DropdownSelector/DropdownSelector.vue tests/unit/specs/components/DropdownSelector/DropdownSelector.spec.js
git commit -m "feat: add generic DropdownSelector component"
```

---

### Task 6: Migrate `ProjectDropdownSelector` onto `DropdownSelector`

Re-point the project selector at `DropdownSelector`, deleting its own search/keyboard/pin logic and its `ProjectDropdownSelectorSearch` / `ProjectDropdownSelectorAll` subcomponents (now provided generically). Keep the public API (`modelValue`, `sliceSize`, `disabled`, `noCaret`, `projects`, `teleportTo`, `teleportDisabled`; emits `hidden`, `changed`, `update:modelValue`) and the pin-on-close behavior.

**Files:**
- Modify: `src/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.vue` (full rewrite of `<script setup>` + template)
- Delete: `src/components/Project/ProjectDropdownSelector/ProjectDropdownSelectorSearch.vue`
- Delete: `src/components/Project/ProjectDropdownSelector/ProjectDropdownSelectorAll.vue`
- Modify: `tests/unit/specs/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.spec.js` (swap internal component references)

**Interfaces:**
- Consumes: `DropdownSelector` (`@/components/DropdownSelector/DropdownSelector`), `ProjectDropdownSelectorButtonContent`, `ProjectDropdownSelectorEntry`, `iwildcardMatch`.
- Produces: `ProjectDropdownSelector` with unchanged public props/emits.

- [ ] **Step 1: Update the spec to reference the new internals**

Replace the imports and the two internal-component references in
`tests/unit/specs/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.spec.js`:

```js
// change these imports at the top of the file
import ProjectDropdownSelector from '@/components/Project/ProjectDropdownSelector/ProjectDropdownSelector'
import DropdownSelectorSearch from '@/components/DropdownSelector/DropdownSelectorSearch'
import CoreSetup from '~tests/unit/CoreSetup'
```

In the "keep the selected project on top while a query filters the list" test, replace:

```js
    wrapper.findComponent(ProjectDropdownSelectorSearch).vm.$emit('update:model-value', 'a')
```

with:

```js
    wrapper.findComponent(DropdownSelectorSearch).vm.$emit('update:modelValue', 'a')
```

In the "re-pin the current selection after the dropdown closes" test, replace:

```js
    wrapper.findComponent(SearchBarInputDropdown).vm.$emit('hidden')
```

with (emit on the INNER `b-dropdown` — the re-pin/`onHidden` logic lives inside `DropdownSelector` bound to its child `b-dropdown`'s `@hidden`, exactly as the `DropdownSelector.spec.js` change/pin tests do; emitting on the `DropdownSelector` component itself would NOT trigger its `onHidden`):

```js
    wrapper.findComponent({ name: 'BDropdown' }).vm.$emit('hidden')
```

- [ ] **Step 2: Run the spec to verify it fails**

Run: `yarn test:unit tests/unit/specs/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.spec.js`
Expected: FAIL (old `ProjectDropdownSelector` still uses `SearchBarInputDropdown`/`ProjectDropdownSelectorSearch`, so `DropdownSelector`/`DropdownSelectorSearch` are not found in the tree).

- [ ] **Step 3: Rewrite `ProjectDropdownSelector.vue`**

```vue
<!-- src/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.vue -->
<script setup>
import { computed } from 'vue'
import { compact, find, isArray, trim } from 'lodash'
import { useI18n } from 'vue-i18n'

import ProjectDropdownSelectorButtonContent from './ProjectDropdownSelectorButtonContent'
import ProjectDropdownSelectorEntry from './ProjectDropdownSelectorEntry'

import DropdownSelector from '@/components/DropdownSelector/DropdownSelector'
import { iwildcardMatch } from '@/utils/strings'

defineOptions({ name: 'ProjectDropdownSelector' })

const props = defineProps({
  /**
   * Selected projects (array for multiple selection) or a single project object.
   */
  modelValue: {
    type: [Array, Object],
    default: () => []
  },
  /**
   * Limit the number of visible project thumbnails in the button.
   */
  sliceSize: {
    type: Number,
    default: 3
  },
  /**
   * Disable the dropdown toggler.
   */
  disabled: {
    type: Boolean
  },
  /**
   * Hide the caret in the toggler.
   */
  noCaret: {
    type: Boolean
  },
  /**
   * List of available projects.
   */
  projects: {
    type: Array,
    default: () => []
  },
  /**
   * Teleport the menu to a different element.
   */
  teleportTo: {
    type: [String, Object],
    default: 'body'
  },
  /**
   * Disable teleporting the menu.
   */
  teleportDisabled: {
    type: Boolean
  }
})

const emit = defineEmits(['hidden', 'changed', 'update:modelValue'])
const { t } = useI18n()

const multiple = computed(() => isArray(props.modelValue))

// Resolve the model value (which may carry only { name }) to full project
// objects from the catalog, so labels and thumbnails render.
const selectedProjects = computed({
  get() {
    if (!multiple.value) {
      if (!props.modelValue) {
        return null
      }
      return find(props.projects, { name: props.modelValue.name }) ?? props.modelValue
    }
    return compact(props.modelValue.map(({ name }) => find(props.projects, { name })))
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

const hasMultipleProjects = computed(() => multiple.value && props.modelValue.length > 1)

// A project matches when its label OR its name matches the wildcard query.
function filterProject(project, query) {
  const wildcard = '*' + trim(query, '*') + '*'
  return iwildcardMatch(project.label ?? '', wildcard) || iwildcardMatch(project.name ?? '', wildcard)
}
</script>

<template>
  <dropdown-selector
    v-model="selectedProjects"
    class="project-dropdown-selector"
    :class="{ 'project-dropdown-selector--multiple': hasMultipleProjects }"
    :multiple="multiple"
    option-key="name"
    searchable
    :option-filter="filterProject"
    :allow-select-all="multiple"
    pin-selected
    :disabled="disabled"
    :no-caret="noCaret"
    :options="projects"
    :teleport-to="teleportTo"
    :teleport-disabled="teleportDisabled"
    :search-placeholder="t('projectDropdownSelectorSearch.placeholder')"
    :no-matches-label="t('projectDropdownSelectorSearch.noMatches')"
    :select-all-label="t('projectDropdownSelectorAll.label')"
    @change="emit('changed', $event)"
    @hidden="emit('hidden', $event)"
  >
    <template #button-content="{ selectedOptions }">
      <project-dropdown-selector-button-content
        :slice-size="sliceSize"
        :selected-projects="selectedOptions"
        :projects="projects"
      />
    </template>
    <template #item="{ option: project, selected, focused, toggle, toggleUnique }">
      <project-dropdown-selector-entry
        :project="project"
        :focus="focused"
        :selected="selected"
        :no-checkbox="!multiple"
        @toggle-value="toggle($event)"
        @toggle-unique-value="toggleUnique($event)"
      />
    </template>
  </dropdown-selector>
</template>

<style lang="scss" scoped>
.project-dropdown-selector {
  &:deep(.btn.dropdown-toggle) {
    --bs-btn-color: var(--bs-body-color);
    --bs-btn-border-color: var(--bs-light);
    --bs-btn-bg: var(--bs-body-bg);
    --bs-btn-hover-bg: var(--bs-btn-bg);
    --bs-btn-hover-color: var(--bs-btn-color);
    --bs-btn-hover-border-color: var(--bs-primary);
    --bs-btn-disabled-bg: var(--bs-btn-bg);
    --bs-btn-disabled-color: var(--bs-btn-color);
    --bs-btn-disabled-border-color: var(--bs-btn-border-color);
    --bs-btn-active-color: var(--bs-btn-color);
    --bs-btn-active-bg: rgba(var(--bs-body-color-rgb), 0.2);
    --bs-btn-active-border-color: var(--bs-light);
  }

  .dropdown-item:focus-visible &:deep(.project-dropdown-selector-entry),
  .dropdown-item:focus &:deep(.project-dropdown-selector-entry) {
    position: relative;
    color: $dropdown-link-hover-color;
    background: $dropdown-link-hover-bg;
    text-decoration: none;
    box-shadow: $focus-ring-box-shadow;
    outline: 0;
  }

  .dropdown-item:focus-visible,
  .dropdown-item:focus {
    outline: 0;
  }
}
</style>
```

- [ ] **Step 4: Delete the now-unused subcomponents**

```bash
git rm src/components/Project/ProjectDropdownSelector/ProjectDropdownSelectorSearch.vue
git rm src/components/Project/ProjectDropdownSelector/ProjectDropdownSelectorAll.vue
```

Verify nothing else imports them:

Run: `grep -rn "ProjectDropdownSelectorSearch\|ProjectDropdownSelectorAll" src/ tests/`
Expected: no matches.

- [ ] **Step 5: Run the spec to verify it passes**

Run: `yarn test:unit tests/unit/specs/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.spec.js`
Expected: PASS (all existing cases green — 3-item render, active/button labels, single/multi pin ordering, filter-keeps-pin, no-reorder-while-open, re-pin-on-close).

- [ ] **Step 6: Commit**

```bash
git add src/components/Project/ProjectDropdownSelector/ tests/unit/specs/components/Project/ProjectDropdownSelector/
git commit -m "refactor: build ProjectDropdownSelector on the generic DropdownSelector"
```

---

### Task 7: `FieldDropdownSelector` (replaces `SearchBarInputDropdownForField`)

A thin field selector wrapping `DropdownSelector` in single-select mode, translating field keys through i18n via slots.

**Files:**
- Create: `src/components/FieldDropdownSelector/FieldDropdownSelector.vue`
- Test: `tests/unit/specs/components/FieldDropdownSelector/FieldDropdownSelector.spec.js`

**Interfaces:**
- Consumes: `DropdownSelector`, `settings` (`@/utils/settings`).
- Produces: `FieldDropdownSelector`. Model: `modelValue` (String, default `'all'`). Props: `disabled` (Boolean), `noCaret` (Boolean), `options` (Array, default field keys from `settings.searchFields`), `optionsPath` (Array, default `['search', 'field']`). Emits: `hidden`, `changed`.

- [ ] **Step 1: Write the failing test**

```js
// tests/unit/specs/components/FieldDropdownSelector/FieldDropdownSelector.spec.js
import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import FieldDropdownSelector from '@/components/FieldDropdownSelector/FieldDropdownSelector'
import settings from '@/utils/settings'

describe('FieldDropdownSelector.vue', () => {
  const { plugins } = CoreSetup.init().useAll().useRouterWithoutGuards()

  function mountComponent(props = {}) {
    return mount(FieldDropdownSelector, {
      props: { teleportDisabled: true, ...props },
      global: { plugins }
    })
  }

  it('renders one item per configured search field', () => {
    const wrapper = mountComponent({ modelValue: 'all' })
    expect(wrapper.findAll('.dropdown-item')).toHaveLength(settings.searchFields.length)
  })

  it('shows the translated label of the selected field in the button', () => {
    const wrapper = mountComponent({ modelValue: 'all' })
    expect(wrapper.find('.dropdown-toggle').text().trim()).toBe('All fields')
  })

  it('marks the selected field active with its translated label', () => {
    const wrapper = mountComponent({ modelValue: 'tags' })
    expect(wrapper.find('.dropdown-item.active').text().trim()).toBe('Tags')
  })

  it('emits update:modelValue when another field is clicked', async () => {
    const wrapper = mountComponent({ modelValue: 'all' })
    // Click the "Tags" option (second search field).
    const tagsItem = wrapper.findAll('.dropdown-item').at(1)
    await tagsItem.find('.field-dropdown-selector__option').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['tags']])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:unit tests/unit/specs/components/FieldDropdownSelector/FieldDropdownSelector.spec.js`
Expected: FAIL with import resolution error.

- [ ] **Step 3: Write the component**

```vue
<!-- src/components/FieldDropdownSelector/FieldDropdownSelector.vue -->
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import DropdownSelector from '@/components/DropdownSelector/DropdownSelector'
import settings from '@/utils/settings'

defineOptions({ name: 'FieldDropdownSelector' })

const modelValue = defineModel({ type: String, default: 'all' })

const props = defineProps({
  /**
   * Disable the dropdown toggler.
   */
  disabled: {
    type: Boolean
  },
  /**
   * Hide the caret in the toggler.
   */
  noCaret: {
    type: Boolean
  },
  /**
   * Teleport the menu to a different element.
   */
  teleportTo: {
    type: [String, Object],
    default: 'body'
  },
  /**
   * Disable teleporting the menu.
   */
  teleportDisabled: {
    type: Boolean
  },
  /**
   * Field keys to offer.
   */
  options: {
    type: Array,
    default: () => settings.searchFields.map((field) => field.key)
  },
  /**
   * Translation path prefix for each field key.
   */
  optionsPath: {
    type: Array,
    default: () => ['search', 'field']
  }
})

const emit = defineEmits(['hidden', 'changed'])
const { t } = useI18n()

const optionsPathPrefix = computed(() => `${props.optionsPath.join('.')}.`)

// Translate a field key to its localized label.
const fieldLabel = (key) => t(`${optionsPathPrefix.value}${key}`)
</script>

<template>
  <dropdown-selector
    v-model="modelValue"
    class="field-dropdown-selector"
    :class="{ 'field-dropdown-selector--selected': modelValue !== 'all' }"
    placement="bottom-end"
    :disabled="disabled"
    :no-caret="noCaret"
    :options="options"
    :teleport-to="teleportTo"
    :teleport-disabled="teleportDisabled"
    @change="emit('changed', $event)"
    @hidden="emit('hidden', $event)"
  >
    <template #button-content>
      <span>{{ fieldLabel(modelValue) }}</span>
    </template>
    <template #item="{ option, toggle }">
      <span
        class="field-dropdown-selector__option px-3 d-block"
        @click="toggle($event)"
      >
        {{ fieldLabel(option) }}
      </span>
    </template>
  </dropdown-selector>
</template>

<style lang="scss" scoped>
.field-dropdown-selector {
  &--selected:deep(.dropdown-toggle):after {
    bottom: 1px;
    border: 2px solid $secondary;
    content: '';
    left: 0;
    position: absolute;
    right: 1px;
    top: 1px;
  }
}
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test:unit tests/unit/specs/components/FieldDropdownSelector/FieldDropdownSelector.spec.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/FieldDropdownSelector/ tests/unit/specs/components/FieldDropdownSelector/
git commit -m "feat: add FieldDropdownSelector built on DropdownSelector"
```

---

### Task 8: `useSelectedProjects` composable + refactor `SearchBarInputDropdownForProjects`

Consolidate the "resolve index names to project objects, with optional fallback default" logic (currently duplicated in `SearchBar.vue` and `SearchBarInputDropdownForProjects.vue`) into one composable, and make the projects wrapper use it. Public API of the wrapper (`modelValue`, `disabled`, `fallbackDefault`; emits `update:modelValue`) is unchanged.

**Files:**
- Create: `src/composables/useSelectedProjects.js`
- Test: `tests/unit/specs/composables/useSelectedProjects.spec.js`
- Modify: `src/components/Search/SearchBar/SearchBarInputDropdownForProjects.vue`
- Verify: `tests/unit/specs/components/Search/SearchBar/SearchBarInputDropdownForProjects.spec.js` stays green (no change expected)

**Interfaces:**
- Consumes: `useCore` (`@/composables/useCore`).
- Produces: `useSelectedProjects(modelValue, { fallbackDefault })` where `modelValue` is a ref (single object or array of `{ name }`). Returns `{ multiple, projects, selectedProjects }` where `selectedProjects` is a writable computed usable as an `DropdownSelector`/`ProjectDropdownSelector` v-model.

- [ ] **Step 1: Write the failing test**

```js
// tests/unit/specs/composables/useSelectedProjects.spec.js
import { mount } from '@vue/test-utils'
import { ref, defineComponent } from 'vue'

import CoreSetup from '~tests/unit/CoreSetup'
import { useSelectedProjects } from '@/composables/useSelectedProjects'

// A host component is required because useSelectedProjects relies on useCore,
// which needs an active component instance.
function withComposable(modelValueInit, options = {}) {
  let api
  const Host = defineComponent({
    setup() {
      const modelValue = ref(modelValueInit)
      api = { modelValue, ...useSelectedProjects(modelValue, options) }
      return () => null
    }
  })
  const { plugins, config } = CoreSetup.init().useAll().useRouterWithoutGuards()
  config.set('defaultProject', 'default-project')
  config.set('projects', [{ name: 'default-project' }, { name: 'banana-papers' }])
  mount(Host, { global: { plugins } })
  return api
}

describe('useSelectedProjects', () => {
  it('resolves an existing single project', () => {
    const { selectedProjects } = withComposable({ name: 'banana-papers' })
    expect(selectedProjects.value.name).toBe('banana-papers')
  })

  it('returns null for an unknown single project without fallback', () => {
    const { selectedProjects } = withComposable({ name: 'kiwi-papers' })
    expect(selectedProjects.value).toBeNull()
  })

  it('falls back to the default project when enabled', () => {
    const { selectedProjects } = withComposable({ name: 'kiwi-papers' }, { fallbackDefault: true })
    expect(selectedProjects.value.name).toBe('default-project')
  })

  it('filters an array to existing projects only', () => {
    const { selectedProjects } = withComposable([{ name: 'banana-papers' }, { name: 'kiwi-papers' }])
    expect(selectedProjects.value.map((p) => p.name)).toEqual(['banana-papers'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:unit tests/unit/specs/composables/useSelectedProjects.spec.js`
Expected: FAIL with import resolution error.

- [ ] **Step 3: Write the composable**

```js
// src/composables/useSelectedProjects.js
import { computed } from 'vue'
import { isArray } from 'lodash'

import { useCore } from '@/composables/useCore'

/**
 * Resolve a model value made of project names to full project objects from the
 * catalog, with an optional fallback to the default project. Shared by every
 * search-context project selector so the resolution lives in one place.
 *
 * @param {import('vue').Ref} modelValue single { name } object or an array of them
 * @param {Object} config
 * @param {Boolean} config.fallbackDefault fall back to the default project when empty
 */
export function useSelectedProjects(modelValue, { fallbackDefault = false } = {}) {
  const core = useCore()

  const projects = computed(() => core.projects)
  const multiple = computed(() => isArray(modelValue.value))

  const selectedProjects = computed({
    get() {
      // Single selection: resolve to the catalog project, or fall back.
      if (!multiple.value) {
        const project = core.findProject(modelValue.value?.name)
        if (fallbackDefault && !project) {
          return { name: core.getDefaultProject() }
        }
        return project ?? null
      }
      // Multiple selection: keep only the names that exist in the catalog.
      const existing = modelValue.value.filter(({ name }) => !!core.findProject(name))
      if (fallbackDefault && !existing.length) {
        return [{ name: core.getDefaultProject() }]
      }
      return existing
    },
    set(value) {
      modelValue.value = value
    }
  })

  return { multiple, projects, selectedProjects }
}

export default useSelectedProjects
```

Note: `core.findProject(undefined)` must return falsy — the previous inline code called `core.findProject(modelValue.value.name)`, so the `?.` guards a null single model value. If `findProject` throws on `undefined`, guard with `modelValue.value?.name ? core.findProject(...) : null` instead.

- [ ] **Step 4: Refactor `SearchBarInputDropdownForProjects.vue` to use it**

```vue
<!-- src/components/Search/SearchBar/SearchBarInputDropdownForProjects.vue -->
<script setup>
import ProjectDropdownSelector from '@/components/Project/ProjectDropdownSelector/ProjectDropdownSelector'
import { useSelectedProjects } from '@/composables/useSelectedProjects'

defineOptions({ name: 'SearchBarInputDropdownForProjects' })

const modelValue = defineModel({
  type: [Array, Object],
  default: () => []
})

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  fallbackDefault: {
    type: Boolean,
    default: false
  }
})

const { projects, selectedProjects } = useSelectedProjects(modelValue, { fallbackDefault: props.fallbackDefault })
</script>

<template>
  <project-dropdown-selector
    v-model="selectedProjects"
    placement="bottom-end"
    :disabled="disabled"
    :projects="projects"
  />
</template>
```

- [ ] **Step 5: Run the wrapper and composable specs to verify they pass**

Run: `yarn test:unit tests/unit/specs/composables/useSelectedProjects.spec.js tests/unit/specs/components/Search/SearchBar/SearchBarInputDropdownForProjects.spec.js`
Expected: PASS (composable 4 tests; wrapper 5 existing tests unchanged).

- [ ] **Step 6: Commit**

```bash
git add src/composables/useSelectedProjects.js tests/unit/specs/composables/useSelectedProjects.spec.js src/components/Search/SearchBar/SearchBarInputDropdownForProjects.vue
git commit -m "refactor: consolidate project resolution in useSelectedProjects"
```

---

### Task 9: `useSearchSuggestions` composable

Extract the Lucene term-candidate parsing, term injection, and Elasticsearch term-suggestion logic out of `SearchBar.vue` so the view stays a thin composition surface and the parsing is unit-testable without a component.

**Files:**
- Create: `src/composables/useSearchSuggestions.js`
- Test: `tests/unit/specs/composables/useSearchSuggestions.spec.js`

**Interfaces:**
- Consumes: `useCore`, `settings`, `bodybuilder`, `lucene`, lodash (`castArray`, `escapeRegExp`, `get`, `last`, `orderBy`, `some`, `throttle`).
- Produces: `useSearchSuggestions({ query, field, formIndices, focused })` where each argument is a ref/computed. Returns `{ suggestions, activeSuggestions, suggestionsAllowed, termCandidates, injectTermInQuery, suggestTerms, searchTerms, selectTerm, hideSuggestions }`.

- [ ] **Step 1: Write the failing test (pure parsing only — no Elasticsearch)**

```js
// tests/unit/specs/composables/useSearchSuggestions.spec.js
import { mount } from '@vue/test-utils'
import { ref, computed, defineComponent } from 'vue'

import CoreSetup from '~tests/unit/CoreSetup'
import { useSearchSuggestions } from '@/composables/useSearchSuggestions'

function withComposable(queryInit = '', fieldInit = 'all') {
  let api
  const Host = defineComponent({
    setup() {
      const query = ref(queryInit)
      const field = ref(fieldInit)
      const formIndices = computed(() => ['local-datashare'])
      const focused = ref(true)
      api = { query, field, ...useSearchSuggestions({ query, field, formIndices, focused }) }
      return () => null
    }
  })
  const { plugins } = CoreSetup.init().useAll().useRouterWithoutGuards()
  mount(Host, { global: { plugins } })
  return api
}

describe('useSearchSuggestions', () => {
  it('extracts implicit term candidates from the query', () => {
    const { query, termCandidates } = withComposable('hello')
    query.value = 'hello'
    const candidates = termCandidates()
    expect(candidates.map((candidate) => candidate.term)).toContain('hello')
  })

  it('injects a selected term in place of the last candidate', () => {
    const { query, injectTermInQuery } = withComposable('hel')
    query.value = 'hel'
    expect(injectTermInQuery('hello')).toBe('hello')
  })

  it('returns the original query when injection cannot parse', () => {
    const { query, injectTermInQuery } = withComposable('')
    query.value = ''
    expect(injectTermInQuery('hello')).toBe('')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:unit tests/unit/specs/composables/useSearchSuggestions.spec.js`
Expected: FAIL with import resolution error.

- [ ] **Step 3: Write the composable**

```js
// src/composables/useSearchSuggestions.js
import { ref, unref } from 'vue'
import bodybuilder from 'bodybuilder'
import lucene from 'lucene'
import { castArray, escapeRegExp, get, last, orderBy, some, throttle } from 'lodash'

import { useCore } from '@/composables/useCore'
import settings from '@/utils/settings'

// Quote a term when it contains characters Lucene would otherwise interpret.
function escapeLuceneChars(str) {
  const escapable = [' ', '+', '-', '&&', '||', '!', '(', ')', '{', '}', '[', ']', '^', '~', '?', ':', '\\', '/']
  return some(escapable, (char) => str.indexOf(char) > -1) ? JSON.stringify(str) : str
}

/**
 * Search-bar term suggestions: parse the Lucene query for candidate terms,
 * fetch matching terms from Elasticsearch, and inject a chosen term back.
 *
 * @param {Object} sources reactive sources
 * @param {import('vue').Ref<String>} sources.query the current query string
 * @param {import('vue').Ref<String>} sources.field the current field key
 * @param {import('vue').Ref<Array>} sources.formIndices indices to search in
 * @param {import('vue').Ref<Boolean>} sources.focused whether the input is focused
 */
export function useSearchSuggestions({ query, field, formIndices, focused }) {
  const core = useCore()
  const suggestions = ref([])
  const activeSuggestions = ref([])

  // Recursively collect readable term candidates from the parsed query AST.
  function termCandidates(ast = null) {
    try {
      let terms = []
      ast = ast === null ? lucene.parse(unref(query)) : ast
      if (ast.left) {
        terms = terms.concat(termCandidates(ast.left))
      }
      if (ast.right) {
        terms = terms.concat(termCandidates(ast.right))
      }
      if (settings.suggestedFields.indexOf(ast.field) > -1) {
        terms.push(ast)
      }
      return terms
    }
    catch {
      return []
    }
  }

  // Suggestions are only offered on implicit/tag fields for long-enough terms.
  const suggestionsAllowed = () => {
    const terms = termCandidates().map((candidate) => candidate.term)
    const lastTerm = last(terms) || ''
    return ['all', settings.suggestedImplicitFields].indexOf(unref(field)) > -1 && lastTerm.length > 4
  }

  function replaceLastTermCandidate(term, ast = null) {
    ast = ast === null ? lucene.parse(unref(query)) : ast
    if (ast.right) {
      replaceLastTermCandidate(term, ast.right)
    }
    else if (ast.left) {
      replaceLastTermCandidate(term, ast.left)
    }
    else if (ast.term === termCandidates().pop().term) {
      ast.term = ast.quoted ? term : escapeLuceneChars(term)
    }
    return ast
  }

  function injectTermInQuery(term, ast = null) {
    try {
      ast = replaceLastTermCandidate(term, ast)
      return lucene.toString(ast)
    }
    catch {
      return unref(query)
    }
  }

  async function suggestTerms(candidates) {
    const currentQuery = unref(query)
    const index = unref(formIndices).join(',')
    const candidate = last(candidates)
    const fields = castArray(candidate.field === '<implicit>' ? settings.suggestedImplicitFields : candidate.field)
    const include = `.*${escapeRegExp(candidate.term).toLowerCase()}.*`
    const body = bodybuilder().size(0)
    fields.forEach((f) => body.aggregation('terms', f, { include }, f))
    const preference = 'search-bar-suggestions'
    const response = await core.api.elasticsearch.search({ index, body: body.build(), preference })
    const suggestionsPerField = fields.map((f) => get(response, `aggregations.${f}.buckets`, []))
    const orderedSuggestions = orderBy(suggestionsPerField.flat(), ['doc_count'], ['desc'])
    // Return the query alongside so the caller can discard stale results.
    return { query: currentQuery, suggestions: orderedSuggestions }
  }

  const searchTerms = throttle(async () => {
    try {
      if (suggestionsAllowed()) {
        const result = await suggestTerms(termCandidates())
        // Ignore the result if the user left the input or changed the query.
        if (unref(focused)) {
          suggestions.value = result.query === unref(query) ? result.suggestions : []
          activeSuggestions.value = []
        }
      }
      else {
        suggestions.value = []
      }
    }
    catch {
      hideSuggestions()
    }
  }, 200)

  function hideSuggestions() {
    suggestions.value = []
  }

  function selectTerm(term) {
    return term ? injectTermInQuery(term.key, null) : unref(query)
  }

  return {
    suggestions,
    activeSuggestions,
    suggestionsAllowed,
    termCandidates,
    injectTermInQuery,
    suggestTerms,
    searchTerms,
    selectTerm,
    hideSuggestions
  }
}

export default useSearchSuggestions
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test:unit tests/unit/specs/composables/useSearchSuggestions.spec.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/composables/useSearchSuggestions.js tests/unit/specs/composables/useSearchSuggestions.spec.js
git commit -m "feat: extract useSearchSuggestions from SearchBar"
```

---

### Task 10: Rewrite `SearchBar.vue` to `<script setup>`

Modernize the orchestrator to Composition API, using `FieldDropdownSelector`, `SearchBarInputDropdownForProjects`, and `useSearchSuggestions`. Preserve store wiring, focus handling, and submit behavior exactly. Expose `submit` and `suggestTerms` for the (rewritten) integration tests.

**Files:**
- Modify: `src/components/Search/SearchBar/SearchBar.vue` (full rewrite)
- Modify: `tests/unit/specs/components/Search/SearchBar/SearchBar.spec.js` (rewrite Options-API-internals assertions)

**Interfaces:**
- Consumes: `useSearchStore`, `useCore`, `useI18n`, `useMobileDetect`, `useRouter`, `useSearchSuggestions`, `FieldDropdownSelector`, `SearchBarInput`, `SearchBarInputDropdownForProjects`, `settings`, lodash (`iteratee`, `isEqual`, `sortBy`, `uniqueId`).
- Produces: `SearchBar` with unchanged props (`placeholder`, `settings`, `hideFieldDropdown`, `hideProjectsDropdown`, `size`, `indices`, `showSubmit`, `compact`, `clearFilters`) and emit (`submit`). Exposes `{ submit, suggestTerms, query, field, suggestions }`.

- [ ] **Step 1: Rewrite the spec first**

```js
// tests/unit/specs/components/Search/SearchBar/SearchBar.spec.js
import { mount, shallowMount } from '@vue/test-utils'

import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import SearchBar from '@/components/Search/SearchBar/SearchBar'
import SearchBarInput from '@/components/Search/SearchBar/SearchBarInput'
import { useSearchStore } from '@/store/modules'

describe('SearchBar.vue', function () {
  const { index, es } = esConnectionHelper.build('search-bar')
  const { index: indexFoo } = esConnectionHelper.build('search-bar-foo')
  const { plugins, config } = CoreSetup.init().useAll().useRouterWithoutGuards()

  let wrapper, searchStore

  const shallowMountFactory = (props = {}) => {
    return shallowMount(SearchBar, { props, global: { plugins, renderStubDefaultSlot: true } })
  }

  const mountFactory = (props = {}) => {
    return mount(SearchBar, { props, global: { plugins, renderStubDefaultSlot: true } })
  }

  beforeAll(() => {
    searchStore = useSearchStore()
    config.set('projects', [
      { name: index, label: 'default' },
      { name: indexFoo, label: 'foo' }
    ])
  })

  beforeEach(() => {
    searchStore.setIndex(index)
    searchStore.reset()
  })

  afterAll(() => {
    searchStore.reset()
  })

  it('should display search bar', () => {
    wrapper = shallowMountFactory()
    expect(wrapper.find('.search-bar').element).toBeTruthy()
  })

  it('should display a field dropdown', () => {
    wrapper = mountFactory()
    expect(wrapper.findComponent({ name: 'SearchBarInput' }).exists()).toBeTruthy()
    expect(wrapper.findComponent({ name: 'FieldDropdownSelector' }).exists()).toBeTruthy()
  })

  it('should submit the query into the store', async () => {
    wrapper = shallowMountFactory()
    wrapper.findComponent(SearchBarInput).vm.$emit('update:modelValue', 'foo')
    await wrapper.vm.$nextTick()
    wrapper.vm.submit()
    expect(searchStore.q).toBe('foo')
  })

  it('should reset the from search parameter to 0', () => {
    wrapper = shallowMountFactory()
    searchStore.setFrom(12)
    wrapper.vm.submit()
    expect(searchStore.from).toBe(0)
  })

  it('should submit with a different index', () => {
    wrapper = shallowMountFactory({ indices: [indexFoo] })
    wrapper.vm.submit()
    expect(searchStore.indices).toContain(indexFoo)
  })

  describe('search suggestions', () => {
    it('should retrieve suggestions in NamedEntities and tags for default search', async () => {
      wrapper = shallowMountFactory()
      await letData(es)
        .have(new IndexedDocument('document', index).withNer('ne_01').withTags(['ne_tag']))
        .commit()

      const suggestions = await wrapper.vm.suggestTerms([{ field: '<implicit>', term: 'ne_' }])

      expect(suggestions.suggestions).toEqual([
        { key: 'ne_01', doc_count: 1 },
        { key: 'ne_tag', doc_count: 1 }
      ])
    })

    it('should order suggestions by doc_count descending', async () => {
      wrapper = shallowMountFactory()
      await letData(es).have(new IndexedDocument('document_01', index).withNer('ne_01').withNer('ne_02')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withNer('ne_02')).commit()

      const suggestions = await wrapper.vm.suggestTerms([{ field: '<implicit>', term: 'ne_' }])

      expect(suggestions.suggestions).toEqual([
        { key: 'ne_02', doc_count: 2 },
        { key: 'ne_01', doc_count: 1 }
      ])
    })
  })
})
```

- [ ] **Step 2: Run the spec to verify it fails**

Run: `yarn test:unit tests/unit/specs/components/Search/SearchBar/SearchBar.spec.js`
Expected: FAIL — the current Options-API `SearchBar` does not expose `submit`/`suggestTerms` for `wrapper.vm`, and `FieldDropdownSelector` does not yet appear in the tree.

- [ ] **Step 3: Rewrite `SearchBar.vue`**

```vue
<!-- src/components/Search/SearchBar/SearchBar.vue -->
<script setup>
import { ref, computed, watch, nextTick, useTemplateRef } from 'vue'
import { isEqual, iteratee, sortBy, uniqueId } from 'lodash'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import SearchBarInput from '@/components/Search/SearchBar/SearchBarInput'
import FieldDropdownSelector from '@/components/FieldDropdownSelector/FieldDropdownSelector'
import SearchBarInputDropdownForProjects from '@/components/Search/SearchBar/SearchBarInputDropdownForProjects'
import { useCore } from '@/composables/useCore'
import { useMobileDetect } from '@/composables/useMobileDetect'
import { useSearchSuggestions } from '@/composables/useSearchSuggestions'
import { useSearchStore } from '@/store/modules'

/**
 * The general search form.
 */
defineOptions({ name: 'SearchBar' })

const props = defineProps({
  placeholder: { type: String, default: null },
  settings: { type: Boolean },
  hideFieldDropdown: { type: Boolean },
  hideProjectsDropdown: { type: Boolean },
  size: { type: String, default: 'md' },
  indices: { type: Array, default: null },
  showSubmit: { type: Boolean, default: false },
  compact: { type: Boolean, default: false },
  clearFilters: { type: Boolean, default: false }
})

const emit = defineEmits(['submit'])

const core = useCore()
const router = useRouter()
const searchStore = useSearchStore()
const { isMobile } = useMobileDetect()
const { t } = useI18n()

const searchInput = useTemplateRef('searchInput')
const suggestionsRef = useTemplateRef('suggestions')

const autofocus = !isMobile
const uid = uniqueId('search-bar-')

const field = ref(null)
const pristine = ref(true)
const focused = ref(false)
const query = ref(null)

// Projects currently selected, derived from the forced indices or the store.
const selectedProjects = computed({
  get() {
    const indices = props.indices ?? searchStore.indices
    return indices.filter((index) => !!core.findProject(index)).map((name) => ({ name }))
  },
  set(projects) {
    searchStore.setIndices(projects.map(iteratee('name')))
  }
})

const formIndices = computed(() => selectedProjects.value.map(iteratee('name')))

const localizedPlaceholder = computed(() => props.placeholder ?? t('search.placeholder'))
const sameIndices = computed(() => isEqual(sortBy(searchStore.indices), sortBy(props.indices)))
const mustClearFilters = computed(() => props.clearFilters && !sameIndices.value)

const { suggestions, activeSuggestions, suggestTerms, searchTerms, selectTerm, hideSuggestions } = useSearchSuggestions({
  query,
  field,
  formIndices,
  focused
})

const hiddenSuggestions = computed(() => !suggestions.value.length || pristine.value)

// Keep the local query and field mirrored from the store.
watch(
  () => searchStore.q,
  (value) => {
    query.value = value
  },
  { immediate: true }
)

watch(
  () => searchStore.field,
  (value) => {
    field.value = value
  },
  { immediate: true }
)

function submit() {
  hideSuggestions()
  if (mustClearFilters.value) {
    searchStore.resetFilterValues()
  }
  // Update the store before pushing the route with the new query.
  searchStore.setIndices(formIndices.value)
  searchStore.setField(field.value)
  searchStore.setQuery(query.value)
  searchStore.setFrom(0)
  searchStore.refreshStamp()
  router.push({ name: 'search', query: searchStore.toRouteQueryWithStamp })
}

function onSelectTerm(term) {
  const nextQuery = selectTerm(term)
  if (term) {
    query.value = nextQuery
  }
}

function hideSuggestionsAfterDelay() {
  setTimeout(() => {
    nextTick(hideSuggestions)
  }, 200)
}

function onBlur() {
  focused.value = false
  hideSuggestionsAfterDelay()
}

function onSubmit() {
  hideSuggestions()
  submit()
}

function onInput() {
  pristine.value = false
  searchTerms()
}

function onFocus() {
  focused.value = true
  searchTerms()
}

function onClear() {
  if (searchStore.q) {
    onSubmit()
  }
}

async function focusOnSearchInput() {
  await nextTick()
  searchInput.value.focus()
}

defineExpose({ submit, suggestTerms, query, field, suggestions })
</script>

<template>
  <div
    :id="uid"
    class="search-bar"
    :class="{ 'search-bar--focused': focused }"
  >
    <div class="d-flex align-items-center">
      <search-bar-input
        ref="searchInput"
        v-model="query"
        class="search-bar__input w-100"
        :autofocus="autofocus"
        :compact="compact"
        :placeholder="localizedPlaceholder"
        :show-submit="showSubmit"
        :size="size"
        @blur="onBlur"
        @focus="onFocus"
        @input="onInput"
        @clear="onClear"
        @submit="onSubmit"
      >
        <template #addons>
          <field-dropdown-selector
            v-if="!hideFieldDropdown"
            v-model="field"
            :disabled="!!indices"
            @changed="focusOnSearchInput"
          />
          <search-bar-input-dropdown-for-projects
            v-if="!hideProjectsDropdown"
            v-model="selectedProjects"
            :disabled="!!indices"
            :no-caret="!!indices"
          />
        </template>
        <template #suggestions>
          <selectable-dropdown
            ref="suggestions"
            class="search-bar__suggestions dropdown-menu shadow-lg bg-action-subtle border-action-subtle"
            :hide="hiddenSuggestions"
            :items="suggestions"
            :active-items="activeSuggestions"
            @update:model-value="onSelectTerm"
            @click="submit"
          >
            <template #item-label="{ item }">
              <div class="d-flex">
                <div class="flex-grow-1 text-truncate">
                  {{ item.key }}
                </div>
              </div>
            </template>
          </selectable-dropdown>
        </template>
      </search-bar-input>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-bar {
  &:deep(.search-bar-input__input) {
    height: auto;
  }

  &--focused:deep(.input-group-append .dropdown-toggle) {
    border-top-color: $primary;
    border-bottom-color: $primary;
  }

  &:deep(.dropdown-toggle) {
    border: 0;
  }

  & &__suggestions.dropdown-menu {
    left: 0;
    position: absolute !important;
    right: 0;
    top: 100%;
  }

  &__suggestions {
    box-shadow: $dropdown-box-shadow;
    margin-top: $dropdown-spacer;

    & .dropdown-item {
      cursor: pointer;

      &:active,
      &:focus,
      &.active {
        color: white;
      }
    }
  }
}
</style>
```

Notes for the implementer:
- The old template passed `:offset="6"` to the dropdowns; `DropdownSelector`/`FieldDropdownSelector` do not define an `offset` prop, so it is dropped (it fell through to `b-dropdown` before with no observed effect). If a visual gap regression appears, add an `offset` pass-through prop to `DropdownSelector`.
- `suggestionsRef` is declared to match the old `ref="suggestions"`; it is not otherwise read, mirroring the original.

- [ ] **Step 4: Run the spec to verify it passes**

Run: `yarn test:unit tests/unit/specs/components/Search/SearchBar/SearchBar.spec.js`
Expected: PASS. If the ES suggestion tests need an active project, they inherit the `beforeAll` `config.set('projects', ...)` and `searchStore.setIndex(index)`, matching the original.

- [ ] **Step 5: Commit**

```bash
git add src/components/Search/SearchBar/SearchBar.vue tests/unit/specs/components/Search/SearchBar/SearchBar.spec.js
git commit -m "refactor: rewrite SearchBar with script setup and useSearchSuggestions"
```

---

### Task 11: Delete the legacy components and verify the whole suite

Remove `SearchBarInputDropdown.vue` and `SearchBarInputDropdownForField.vue` (and their specs) now that nothing imports them, then run the full suite and lint.

**Files:**
- Delete: `src/components/Search/SearchBar/SearchBarInputDropdown.vue`
- Delete: `src/components/Search/SearchBar/SearchBarInputDropdownForField.vue`
- Delete: `tests/unit/specs/components/Search/SearchBar/SearchBarInputDropdown.spec.js`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing.

- [ ] **Step 1: Confirm there are no remaining references**

Run: `grep -rn "SearchBarInputDropdown\b\|SearchBarInputDropdownForField" src/ tests/`
Expected: no matches (only `SearchBarInputDropdownForProjects` remains, which is a different name — confirm the matches, if any, are exclusively that).

If any reference remains, fix the importer to use `DropdownSelector` / `FieldDropdownSelector` before deleting.

- [ ] **Step 2: Delete the files**

```bash
git rm src/components/Search/SearchBar/SearchBarInputDropdown.vue
git rm src/components/Search/SearchBar/SearchBarInputDropdownForField.vue
git rm tests/unit/specs/components/Search/SearchBar/SearchBarInputDropdown.spec.js
```

- [ ] **Step 3: Run the full unit suite**

Run: `yarn test:unit`
Expected: PASS (entire suite green, including the migrated `ProjectDropdownSelector`, new `DropdownSelector`/composable/`FieldDropdownSelector` specs, and the Task* consumers of `ProjectDropdownSelector` / `SearchBarInputDropdownForProjects`).

- [ ] **Step 4: Lint the changed files**

Run: `yarn lint:fix`
Then: `yarn lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: remove legacy SearchBarInputDropdown and field wrapper"
```

---

## Self-Review

**Spec coverage:**
- Generic `DropdownSelector` (slot-first + key prop, full features) → Tasks 3, 4, 5.
- `useDropdownSelection` / `useListNavigation` → Tasks 1, 2.
- Unified events (`update:modelValue`, `change`, `shown`, `hidden`) → Task 5 (component) + Tasks 6/7 map `change` → wrappers' `changed`.
- Rename + relocate base to `DropdownSelector` in `components/DropdownSelector/` → Task 5.
- `FieldDropdownSelector` in its own folder → Task 7.
- `ProjectDropdownSelector` re-pointed, subcomponents collapsed, public API preserved → Task 6.
- Projects normalization consolidated into `useSelectedProjects` → Task 8.
- `useSearchSuggestions` extraction + `SearchBar.vue` `<script setup>` rewrite → Tasks 9, 10.
- Legacy deletion + full suite/lint verification ("not broken") → Task 11.

**Placeholder scan:** No TBD/TODO; every code step includes complete code; every test step includes real assertions and exact run commands.

**Type/name consistency:**
- `useDropdownSelection(modelValue, allOptions, { multiple, optionKey })` returns `keyOf` (used by `DropdownSelector` for pinning/default filter). ✓
- `useListNavigation(items, { onEnter })` returns `focusIndex, moveFocusUp, moveFocusDown, resetFocus, selectFocused` — all consumed by `DropdownSelector`. ✓
- `DropdownSelector` emits `change`/`shown`/`hidden`; `ProjectDropdownSelector` and `FieldDropdownSelector` listen `@change` and re-emit `changed`. ✓
- `DropdownSelectorSearch` model event is `update:modelValue` (defineModel); the `ProjectDropdownSelector` spec update uses `update:modelValue` (not the old kebab `update:model-value`). ✓
- `useSelectedProjects` returns `{ multiple, projects, selectedProjects }`; the projects wrapper uses `projects` and `selectedProjects`. ✓
- `useSearchSuggestions` returns `suggestTerms` (used by `SearchBar` `defineExpose` and the ES tests) and `searchTerms`/`selectTerm`/`hideSuggestions` (used by `SearchBar` handlers). ✓

## Open verification notes (for the implementer)

- `b-dropdown` in bootstrap-vue-next `0.42.0`: confirm the `@shown`/`@hidden` event names and that `ref="dropdown"` exposes a `hide()` method. If `hide()` is not on the instance, use the `v-model:visible` (`visible.value = false`) to close instead.
- Confirm `core.findProject(undefined)` returns falsy (guard in `useSelectedProjects` Step 3 note).
- Confirm the `i-ph-caret-down` global icon component resolves in `DropdownSelector` (it did in the legacy `SearchBarInputDropdown`).
