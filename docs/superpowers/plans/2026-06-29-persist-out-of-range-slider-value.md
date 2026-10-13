# Persist Out-of-Range Slider Value Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the advanced-search proximity/fuzzy slider keep a parsed out-of-range value (e.g. `8` on a max-6 slider) visible for the whole editing session — so the user can slide down and back up to it — and clear it on Reset / reopen.

**Architecture:** Two changes. (1) `useRangeSteps` anchors its overflow slot to a **high-water mark** of the value seen since (re)mount, so the extra tick + dashed tail persist when the live value drops below max. (2) `SearchAdvancedModal` bumps a `formKey` after populating on open and on reset, and keys the two range fields with it, so each session remounts the sliders and re-snapshots (or drops) the anchor.

**Tech Stack:** Vue 3 (`<script setup>`), Vitest + `@vue/test-utils`, d3 `range`.

## Global Constraints

- Preserve-only: the UI never lets a user dial a value above the max; the persisted value comes only from a parsed query.
- Applies to both sliders (proximity max 6, fuzzy max 2) via the shared `FormControlRange`.
- The persisted value clears on Reset and on reopening the modal (each session brings its own initial value, or none).
- No landable intermediate tick (e.g. no `7`); the non-interactive gap is unchanged.
- The normal (no-overflow) case is visually unchanged: single full-width solid track, no extra tick.
- `useRangeSteps`' exported signature stays `useRangeSteps(min, max, step, value)` returning `{ steps, hasOverflow }`.
- Commits: conventional `type(scope): description`, no body, no co-author trailers.
- Never use single-line `if` statements without braces.

---

### Task 1: Anchor the overflow slot to a high-water mark

**Files:**
- Modify: `src/composables/useRangeSteps.js`
- Test: `tests/unit/specs/composables/useRangeSteps.spec.js`
- Test: `tests/unit/specs/components/Form/FormControl/FormControlRange/FormControlRange.spec.js`

**Interfaces:**
- Consumes: nothing new.
- Produces: `useRangeSteps(min, max, step, value)` → `{ steps, hasOverflow }`, unchanged signature. New behaviour: the overflow entry is the highest `value` seen since the composable was created (not the live value), so it persists when `value` later drops to/below `max`. Created within bounds → no overflow entry; remount (fresh composable instance) → fresh high-water mark.

- [ ] **Step 1: Add the persistence test to the composable spec**

In `tests/unit/specs/composables/useRangeSteps.spec.js`, add this test inside the `describe('useRangeSteps', ...)` block (after the existing reactive test, before the block's closing `})`):

```js
  it('keeps the custom step after the value drops back below the max', () => {
    const value = ref(3)
    const { steps, hasOverflow } = useRangeSteps(1, 6, 1, value)

    value.value = 8
    expect(steps.value).toEqual([1, 2, 3, 4, 5, 6, 8])
    expect(hasOverflow.value).toBe(true)

    value.value = 3
    // The slot is anchored to the high-water mark, so it persists.
    expect(steps.value).toEqual([1, 2, 3, 4, 5, 6, 8])
    expect(hasOverflow.value).toBe(true)
  })
```

(`ref` is already imported at the top of this spec.)

- [ ] **Step 2: Add the persistence tests to the component spec**

In `tests/unit/specs/components/Form/FormControl/FormControlRange/FormControlRange.spec.js`:

Inside `describe('FormControlRangeSliderBullet.vue', ...)` → `describe('overflow value (beyond max)', ...)`, add:

```js
    it('keeps the custom slot and moves the bullet there when the value drops below max', async () => {
      const wrapper = overflow({ modelValue: 8 })
      await wrapper.setProps({ modelValue: 3 })
      // steps stay [1,2,3,4,5,6,8] -> 7 slots; value 3 is index 2
      expect(wrapper.vm.style.left).toBe(`${(100 / 7) * 2}%`)
      expect(wrapper.vm.style.width).toBe(`${100 / 7}%`)
    })
```

Inside `describe('FormControlRangeTicks.vue', ...)` → `describe('overflow value (beyond max)', ...)`, add:

```js
    it('keeps the extra tick after the value drops below the max', async () => {
      const wrapper = ticksFactory({ modelValue: 8 })
      await wrapper.setProps({ modelValue: 3 })
      const labels = wrapper.findAll('.form-control-range-ticks-entry').map(e => e.text())
      expect(labels).toEqual(['1', '2', '3', '4', '5', '6', '8'])
    })
```

Inside `describe('FormControlRangeSlider.vue', ...)`, add:

```js
  it('keeps the dashed tail after the value drops below the max', async () => {
    const wrapper = factory({ modelValue: 8 })
    await wrapper.setProps({ modelValue: 3 })
    expect(wrapper.vm.hasOverflow).toBe(true)
    expect(wrapper.find('.form-control-range-slider__track--dashed').exists()).toBe(true)
  })
```

- [ ] **Step 3: Run the new tests to verify they fail**

Run: `npx vitest run tests/unit/specs/composables/useRangeSteps.spec.js tests/unit/specs/components/Form/FormControl/FormControlRange/FormControlRange.spec.js -t "drops back below\|drops below\|after the value"`
Expected: FAIL — the current composable reads the live value, so after `value` drops to `3` the overflow entry is removed (`steps` becomes `[1..6]`, `hasOverflow` false), the bullet lands on a 6-slot index, and the dashed tail disappears.

- [ ] **Step 4: Rewrite the composable to anchor on a high-water mark**

Replace the entire contents of `src/composables/useRangeSteps.js` with:

```js
import { range } from 'd3'
import { computed, ref, toValue, watch } from 'vue'

/**
 * Build the discrete steps for a range slider. When the value sits above the
 * max it is shown as a single trailing "custom" step (no intermediate steps in
 * the gap). The custom step is anchored to the highest value seen since this
 * composable was created — a high-water mark — so a value parsed above the max
 * stays on the slider even after the user slides back down. It resets when the
 * component is remounted (e.g. the advanced-search modal reopens or is reset).
 *
 * Inputs may be plain values, refs, or getters.
 */
export function useRangeSteps(min, max, step, value) {
  const ceiling = ref(toValue(value))
  watch(
    () => toValue(value),
    (current) => {
      if (current > ceiling.value) {
        ceiling.value = current
      }
    }
  )

  const steps = computed(() => {
    const lo = toValue(min)
    const hi = toValue(max)
    const by = toValue(step)
    const base = range(lo, hi + by, by)

    if (ceiling.value > hi) {
      base.push(ceiling.value)
    }

    return base
  })

  const hasOverflow = computed(() => ceiling.value > toValue(max))

  return { steps, hasOverflow }
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run tests/unit/specs/composables/useRangeSteps.spec.js tests/unit/specs/components/Form/FormControl/FormControlRange/FormControlRange.spec.js`
Expected: PASS — the new persistence tests pass and every pre-existing test in both files stays green (the high-water rule still appends the slot when the value first exceeds max, and within-bounds creation still yields no slot).

- [ ] **Step 6: Commit**

```bash
git add src/composables/useRangeSteps.js tests/unit/specs/composables/useRangeSteps.spec.js tests/unit/specs/components/Form/FormControl/FormControlRange/FormControlRange.spec.js
git commit -m "feat(useRangeSteps): anchor the overflow slot to a high-water mark"
```

---

### Task 2: Remount the sliders each session to clear the persisted value

**Files:**
- Modify: `src/components/Search/SearchAdvancedModal/SearchAdvancedModal.vue`
- Test: `tests/unit/specs/components/Search/SearchAdvancedModal/SearchAdvancedModal.spec.js`

**Interfaces:**
- Consumes: Task 1's high-water anchoring (a remounted slider re-snapshots its anchor from the freshly-populated `distance`).
- Produces: `SearchAdvancedModal` exposes `formKey` (a `Ref<number>`) that increments after the form is populated on open and on reset. The two `<search-advanced-modal-field-range>` elements are keyed by it, so they remount each session.

- [ ] **Step 1: Write the failing test**

In `tests/unit/specs/components/Search/SearchAdvancedModal/SearchAdvancedModal.spec.js`, add this test inside the `describe('SearchAdvancedModal.vue', ...)` block (after an existing test, before the block's closing `})`):

```js
  it('remounts the range sliders each session by bumping formKey on open and reset', async () => {
    const wrapper = factory({ modelValue: false })
    const initial = wrapper.vm.formKey

    await wrapper.setProps({ modelValue: true })
    await nextTick()
    expect(wrapper.vm.formKey).toBe(initial + 1)

    wrapper.vm.handleReset()
    expect(wrapper.vm.formKey).toBe(initial + 2)
  })
```

(`nextTick` is already imported at the top of this spec.)

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/unit/specs/components/Search/SearchAdvancedModal/SearchAdvancedModal.spec.js -t "remounts the range sliders"`
Expected: FAIL — `wrapper.vm.formKey` is `undefined` (not exposed yet), so `const initial = undefined` and `expect(wrapper.vm.formKey).toBe(NaN)` fails.

- [ ] **Step 3: Import `ref`**

In `src/components/Search/SearchAdvancedModal/SearchAdvancedModal.vue`, change line 135 from:

```js
import { computed, nextTick, useTemplateRef } from 'vue'
```

to:

```js
import { computed, nextTick, ref, useTemplateRef } from 'vue'
```

- [ ] **Step 4: Rename the destructured reset and add `formKey`**

Change the destructure + `firstInput` block (around lines 188-197) from:

```js
const {
  form,
  fields,
  isFormEmpty,
  setField,
  reset: handleReset,
  toQueryShape
} = useAdvancedSearchForm()

const firstInput = useTemplateRef('firstInput')
```

to:

```js
const {
  form,
  fields,
  isFormEmpty,
  setField,
  reset: resetForm,
  toQueryShape
} = useAdvancedSearchForm()

const firstInput = useTemplateRef('firstInput')

// Bumping this key on open (after populate) and on reset remounts the range
// sliders so each editing session re-captures its own out-of-range "initial
// max" value and a previous session's persisted value does not leak in.
const formKey = ref(0)
```

- [ ] **Step 5: Bump `formKey` on open and wrap reset**

Change the `handleOpen` + `whenever` block (around lines 255-263) from:

```js
async function handleOpen() {
  populateFromInitialQuery()
  await focusFirstInput()
}

// Open pre-populates and focuses; close resets so the next open starts
// clean if the parent stops passing a query.
whenever(isVisible, handleOpen)
whenever(() => !isVisible.value, handleReset)
```

to:

```js
async function handleOpen() {
  populateFromInitialQuery()
  // Remount the sliders after the form is populated so each picks up this
  // query's distance as its persisted out-of-range value.
  formKey.value++
  await focusFirstInput()
}

// Wrap the form reset so resetting also remounts the sliders, dropping any
// persisted out-of-range value along with the rest of the form state.
function handleReset() {
  resetForm()
  formKey.value++
}

// Open pre-populates and focuses; close resets so the next open starts
// clean if the parent stops passing a query.
whenever(isVisible, handleOpen)
whenever(() => !isVisible.value, handleReset)
```

- [ ] **Step 6: Expose `formKey`**

Change the `defineExpose` line (line 281) from:

```js
defineExpose({ form, isFormEmpty, handleSearch, handleReset })
```

to:

```js
defineExpose({ form, isFormEmpty, handleSearch, handleReset, formKey })
```

- [ ] **Step 7: Key the two range fields**

In the template, add a `:key` as the first attribute of each `<search-advanced-modal-field-range>`.

For the fuzzy field (around line 77), change:

```html
        <search-advanced-modal-field-range
          v-model:term="form.fuzzyTerm"
```

to:

```html
        <search-advanced-modal-field-range
          :key="`fuzzy-${formKey}`"
          v-model:term="form.fuzzyTerm"
```

For the proximity field (around line 89), change:

```html
        <search-advanced-modal-field-range
          v-model:term="form.proximityPhrase"
```

to:

```html
        <search-advanced-modal-field-range
          :key="`proximity-${formKey}`"
          v-model:term="form.proximityPhrase"
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npx vitest run tests/unit/specs/components/Search/SearchAdvancedModal/SearchAdvancedModal.spec.js`
Expected: PASS — the new remount test passes and all pre-existing modal tests stay green (`handleReset` still resets the form; the keyed range fields are stubbed under `shallowMount`).

- [ ] **Step 9: Commit**

```bash
git add src/components/Search/SearchAdvancedModal/SearchAdvancedModal.vue tests/unit/specs/components/Search/SearchAdvancedModal/SearchAdvancedModal.spec.js
git commit -m "feat(SearchAdvancedModal): remount range sliders per session to clear persisted value"
```

---

### Task 3: End-to-end verification

**Files:**
- Test: the three affected specs (run only)

**Interfaces:**
- Consumes: Tasks 1-2.
- Produces: confirmation the full behaviour holds and nothing regressed.

- [ ] **Step 1: Run the affected suites together**

Run:
```bash
npx vitest run \
  tests/unit/specs/composables/useRangeSteps.spec.js \
  tests/unit/specs/components/Form/FormControl/FormControlRange/FormControlRange.spec.js \
  tests/unit/specs/components/Search/SearchAdvancedModal/SearchAdvancedModal.spec.js
```
Expected: PASS — all three files green.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Manual smoke check (optional but recommended)**

Open the advanced search modal on `"test"~8`. Expected: proximity slider shows `1..6` then a dashed line to a `8` tick, bullet on `8`. Drag the bullet down to `3`: the `8` tick and dashed line **stay**; drag back up and land on `8` again. Press Reset: the slider returns to the plain `1..6` with no `8` tick. Reopen on `"test"~8`: the `8` tick is back.

- [ ] **Step 4: Final commit (only if Step 1-2 surfaced fixes)**

```bash
git add -A
git commit -m "test: verify persisted out-of-range slider value end-to-end"
```

---

## Self-Review

**Spec coverage:**
- High-water anchor in `useRangeSteps` (spec §Design 1) → Task 1.
- Persistence behaviour (slot stays when value drops) → Task 1 (composable + component tests).
- Modal per-session remount via `formKey` (spec §Design 2) → Task 2.
- Clears on Reset / reopen → Task 2 (`handleReset` and `handleOpen` both bump `formKey`).
- Testing (spec §Testing): composable persistence → Task 1; component persistence → Task 1; `formKey` increments → Task 2; end-to-end → Task 3.
- Unchanged: parsing, geometry, constants, non-interactive gap, normal case → no task touches them; Task 1 keeps the signature and Task 3 reruns the suites to confirm.

**Placeholder scan:** none — every code step shows full code; no TBD/TODO.

**Type consistency:** `useRangeSteps(min, max, step, value)` → `{ steps, hasOverflow }` unchanged across Task 1 and its consumers. In Task 2 the composable's `reset` is bound to `resetForm`, the new local `handleReset` wraps it, and `formKey` is the name used in the script, the template keys, `defineExpose`, and the test.
