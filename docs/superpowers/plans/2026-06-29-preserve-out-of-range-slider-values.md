# Preserve Out-of-Range Slider Values Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop the advanced search modal from blanking when it opens on a proximity/fuzzy query whose distance exceeds the slider's max (e.g. `"test"~8`); instead preserve the value and show it as an extra slider tick past the max, joined by a dashed track tail.

**Architecture:** Two layers. (1) Parsing (`src/utils/luceneQuery.js`): stop marking an out-of-range distance as lossy so it round-trips. (2) Rendering (`FormControlRange` family): a shared `useRangeSteps` composable appends one custom step when the value exceeds max; the bullet and ticks consume it; the slider track draws a solid segment to the max tick and a dashed segment from there to the custom tick.

**Tech Stack:** Vue 3 (`<script setup>`), Vitest + `@vue/test-utils`, d3 `range`, SCSS, Bootstrap CSS variables.

## Global Constraints

- Slider maxes stay as-is: `PROXIMITY_DISTANCE_MAX = 6`, `FUZZY_DISTANCE_MAX = 2`. Do not raise or remove them.
- Preserve-only: the UI must never produce a value above the max except the one parsed from an existing query. No intermediate tick (e.g. no `7`).
- Both sliders (proximity and fuzzy) get the behaviour via the shared `FormControlRange` component.
- A discarded custom value is not remembered: once the user picks a `1..max` value, the custom step disappears.
- Commits: conventional `type(scope): description`, no body, no co-author trailers.
- Never use single-line `if` statements without braces.

---

### Task 1: Parsing preserves out-of-range distances

**Files:**
- Modify: `src/utils/luceneQuery.js:615-644` (`tryParseProximity`, `tryParseFuzzy`)
- Test: `tests/unit/specs/utils/luceneQuery.spec.js:723-729`

**Interfaces:**
- Consumes: nothing new.
- Produces: `parseLuceneQuery(query)` now returns a populated form (not `null`) for proximity distances `> 6` and fuzzy distances `> 2`, with `proximityDistance` / `fuzzyDistance` set to the parsed value. `foo~0` (distance `< 1`) still returns `null`.

- [ ] **Step 1: Replace the out-of-range test and add a preserve test**

In `tests/unit/specs/utils/luceneQuery.spec.js`, replace the existing test at lines 723-729:

```js
    it('returns null for out-of-range distances', () => {
      // The sliders cap fuzzy at 2 and proximity at 6; clamping would
      // silently change the user's distance.
      expect(parseLuceneQuery('foo~3')).toBeNull()
      expect(parseLuceneQuery('"a b"~7')).toBeNull()
      expect(parseLuceneQuery('foo~0')).toBeNull()
    })
```

with:

```js
    it('returns null for a zero distance', () => {
      // Distance 0 cannot be represented: the slider has no 0 and `~0` is
      // not equivalent to the smallest slider value.
      expect(parseLuceneQuery('foo~0')).toBeNull()
      expect(parseLuceneQuery('"a b"~0')).toBeNull()
    })

    it('preserves out-of-range distances instead of blanking', () => {
      // Above the slider max the value is kept verbatim (the slider widens to
      // show it) so the modal still represents the query.
      const fuzzy = parseLuceneQuery('foo~3')
      expect(fuzzy).not.toBeNull()
      expect(fuzzy.fuzzyTerm).toBe('foo')
      expect(fuzzy.fuzzyDistance).toBe(3)

      const proximity = parseLuceneQuery('"a b"~7')
      expect(proximity).not.toBeNull()
      expect(proximity.proximityPhrase).toBe('a b')
      expect(proximity.proximityDistance).toBe(7)
    })
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run tests/unit/specs/utils/luceneQuery.spec.js -t "preserves out-of-range"`
Expected: FAIL — `parseLuceneQuery('foo~3')` currently returns `null`, so `expect(fuzzy).not.toBeNull()` fails.

- [ ] **Step 3: Drop the `distance > MAX` guard in both parsers**

In `src/utils/luceneQuery.js`, change `tryParseProximity` (around line 621-625) from:

```js
  // The form has a single proximity slot and a bounded slider: a second
  // clause or an out-of-range distance cannot be represented.
  if (ctx.form.proximityPhrase || !isFaithfulPhrase(m[1]) || distance < 1 || distance > PROXIMITY_DISTANCE_MAX) {
    ctx.lossy = true
  }
```

to:

```js
  // The form has a single proximity slot: a second clause cannot be
  // represented. An out-of-range distance is preserved instead (the slider
  // widens to show it), so only a second clause, an unfaithful phrase, or a
  // sub-1 distance makes the parse lossy.
  if (ctx.form.proximityPhrase || !isFaithfulPhrase(m[1]) || distance < 1) {
    ctx.lossy = true
  }
```

And change `tryParseFuzzy` (around line 636-640) from:

```js
  // Same single-slot and bounded-slider rules as proximity.
  if (ctx.form.fuzzyTerm || !isFaithfulTerm(m[1]) || distance < 1 || distance > FUZZY_DISTANCE_MAX) {
    ctx.lossy = true
  }
```

to:

```js
  // Same single-slot rules as proximity; an out-of-range distance is
  // preserved rather than blanking the form.
  if (ctx.form.fuzzyTerm || !isFaithfulTerm(m[1]) || distance < 1) {
    ctx.lossy = true
  }
```

Leave the `PROXIMITY_DISTANCE_MAX` / `FUZZY_DISTANCE_MAX` exports (lines 305, 311) untouched — they are still used by `SearchAdvancedModal.vue` as the slider max.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/unit/specs/utils/luceneQuery.spec.js`
Expected: PASS — the new preserve test and the zero-distance test both pass, and the rest of the suite is green (the round-trip gate at line 872 still rejects anything that does not regenerate equivalently).

- [ ] **Step 5: Commit**

```bash
git add src/utils/luceneQuery.js tests/unit/specs/utils/luceneQuery.spec.js
git commit -m "fix(luceneQuery): preserve out-of-range proximity and fuzzy distances"
```

---

### Task 2: `useRangeSteps` composable

**Files:**
- Create: `src/composables/useRangeSteps.js`
- Test: `tests/unit/specs/composables/useRangeSteps.spec.js`

**Interfaces:**
- Consumes: d3 `range`, Vue `computed` / `toValue`.
- Produces: `useRangeSteps(min, max, step, value)` → `{ steps, hasOverflow }`. Each argument may be a plain value, ref, or getter (normalised with `toValue`). `steps` is a `ComputedRef<number[]>` equal to `range(min, max + step, step)`, plus one trailing entry equal to `value` when `value > max`. `hasOverflow` is a `ComputedRef<boolean>` true when `value > max`.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/specs/composables/useRangeSteps.spec.js`:

```js
import { ref } from 'vue'

import { useRangeSteps } from '@/composables/useRangeSteps'

describe('useRangeSteps', () => {
  it('returns the plain range when the value is within bounds', () => {
    const { steps, hasOverflow } = useRangeSteps(1, 6, 1, 3)
    expect(steps.value).toEqual([1, 2, 3, 4, 5, 6])
    expect(hasOverflow.value).toBe(false)
  })

  it('returns the plain range when the value equals the max', () => {
    const { steps, hasOverflow } = useRangeSteps(1, 6, 1, 6)
    expect(steps.value).toEqual([1, 2, 3, 4, 5, 6])
    expect(hasOverflow.value).toBe(false)
  })

  it('appends one custom step when the value exceeds the max', () => {
    const { steps, hasOverflow } = useRangeSteps(1, 6, 1, 8)
    expect(steps.value).toEqual([1, 2, 3, 4, 5, 6, 8])
    expect(hasOverflow.value).toBe(true)
  })

  it('never inserts intermediate steps in the overflow gap', () => {
    const { steps } = useRangeSteps(1, 6, 1, 9)
    expect(steps.value).toEqual([1, 2, 3, 4, 5, 6, 9])
  })

  it('accepts reactive inputs and recomputes when the value changes', () => {
    const value = ref(3)
    const { steps, hasOverflow } = useRangeSteps(1, 6, 1, value)
    expect(hasOverflow.value).toBe(false)
    value.value = 8
    expect(steps.value).toEqual([1, 2, 3, 4, 5, 6, 8])
    expect(hasOverflow.value).toBe(true)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/unit/specs/composables/useRangeSteps.spec.js`
Expected: FAIL — module `@/composables/useRangeSteps` does not exist.

- [ ] **Step 3: Write the composable**

Create `src/composables/useRangeSteps.js`:

```js
import { range } from 'd3'
import { computed, toValue } from 'vue'

/**
 * Build the discrete steps for a range slider. When the current value sits
 * above the max, it is appended as a single trailing "custom" step so an
 * out-of-range value stays representable on the slider without adding any
 * intermediate steps in the gap.
 *
 * Inputs may be plain values, refs, or getters.
 */
export function useRangeSteps(min, max, step, value) {
  const steps = computed(() => {
    const lo = toValue(min)
    const hi = toValue(max)
    const by = toValue(step)
    const current = toValue(value)
    const base = range(lo, hi + by, by)

    if (current > hi) {
      base.push(current)
    }

    return base
  })

  const hasOverflow = computed(() => toValue(value) > toValue(max))

  return { steps, hasOverflow }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/unit/specs/composables/useRangeSteps.spec.js`
Expected: PASS — all five cases green.

- [ ] **Step 5: Commit**

```bash
git add src/composables/useRangeSteps.js tests/unit/specs/composables/useRangeSteps.spec.js
git commit -m "feat(useRangeSteps): add range steps composable with overflow slot"
```

---

### Task 3: Bullet and ticks render the custom overflow slot

**Files:**
- Modify: `src/components/Form/FormControl/FormControlRange/FormControlRangeSliderBullet.vue`
- Modify: `src/components/Form/FormControl/FormControlRange/FormControlRangeTicks.vue`
- Test: `tests/unit/specs/components/Form/FormControl/FormControlRange/FormControlRange.spec.js`

**Interfaces:**
- Consumes: `useRangeSteps` from Task 2.
- Produces: with `min=1, max=6, step=1, modelValue=8` the bullet sits on the appended slot (`left = (100/7) * 6`) and the ticks render `['1','2','3','4','5','6','8']`. Within bounds, both behave exactly as before.

- [ ] **Step 1: Write the failing tests**

In `tests/unit/specs/components/Form/FormControl/FormControlRange/FormControlRange.spec.js`, add this block inside `describe('FormControlRangeSliderBullet.vue', ...)` (after the existing `describe('dragging', ...)`, before its closing `})`):

```js
  describe('overflow value (beyond max)', () => {
    const overflow = (props = {}) => factory({ min: 1, max: 6, step: 1, ...props })

    it('places the bullet on the appended custom slot', () => {
      const wrapper = overflow({ modelValue: 8 })
      // steps become [1,2,3,4,5,6,8] -> 7 slots, custom slot is index 6
      expect(wrapper.vm.style.left).toBe(`${(100 / 7) * 6}%`)
      expect(wrapper.vm.style.width).toBe(`${100 / 7}%`)
    })

    it('selects the custom value when dragged to the far right', async () => {
      const wrapper = overflow({ modelValue: 8 })
      await wrapper.find('.form-control-range-slider-bullet').trigger('drag', { detail: 100 })
      expect(wrapper.emitted('update:modelValue').at(-1)[0]).toBe(8)
    })

    it('snaps to the max (never an intermediate value) when dragged off the custom slot', async () => {
      const wrapper = overflow({ modelValue: 8 })
      await wrapper.find('.form-control-range-slider-bullet').trigger('drag', { detail: 70 })
      // round(7 * 0.70) = 5 -> steps[5] = 6, with no value 7 in between
      expect(wrapper.emitted('update:modelValue').at(-1)[0]).toBe(6)
    })
  })
```

Then add this block inside `describe('FormControlRangeTicks.vue', ...)` (before its closing `})`):

```js
  describe('overflow value (beyond max)', () => {
    const ticksFactory = (props = {}) =>
      mount(FormControlRangeTicks, { props: { min: 1, max: 6, step: 1, modelValue: 0, ...props } })

    it('renders an extra tick for the out-of-range value', () => {
      const wrapper = ticksFactory({ modelValue: 8 })
      const labels = wrapper.findAll('.form-control-range-ticks-entry').map(e => e.text())
      expect(labels).toEqual(['1', '2', '3', '4', '5', '6', '8'])
    })

    it('renders only the normal ticks when the value is within bounds', () => {
      const wrapper = ticksFactory({ modelValue: 3 })
      expect(wrapper.findAll('.form-control-range-ticks-entry')).toHaveLength(6)
    })
  })
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run tests/unit/specs/components/Form/FormControl/FormControlRange/FormControlRange.spec.js -t overflow`
Expected: FAIL — the bullet computes `steps` from its own local `range(min, max+step, step)`, so a value of `8` is not in `steps`, `indexOf` returns `-1`, and `style.left` is `${(100/6) * -1}%` (not the expected custom-slot position). The ticks render 6 entries, not 7.

- [ ] **Step 3: Switch the bullet to `useRangeSteps`**

Replace the entire `<script setup>` block in `FormControlRangeSliderBullet.vue` with:

```js
<script setup>
import { computed, ref } from 'vue'

import { useRangeSteps } from '@/composables/useRangeSteps'
import { draggable as vDraggable } from '@/directives/draggable'

const modelValue = defineModel({
  type: Number
})
const props = defineProps({
  step: {
    type: Number
  },
  min: {
    type: Number
  },
  max: {
    type: Number
  }
})

const target = ref(null)
const active = ref(false)

const { steps } = useRangeSteps(
  () => props.min,
  () => props.max,
  () => props.step,
  modelValue
)

const modelValueStep = computed(() => {
  return steps.value.indexOf(modelValue.value)
})

const style = computed(() => {
  const width = 100 / steps.value.length
  const left = width * modelValueStep.value

  return {
    left: `${left}%`,
    width: `${width}%`
  }
})

const drag = ({ detail: x }) => {
  active.value = true
  const index = Math.round(steps.value.length * (x / 100))
  const clamped = Math.min(steps.value.length - 1, Math.max(0, index))
  modelValue.value = steps.value[clamped]
}

const dragend = () => {
  active.value = false
}

const classList = computed(() => {
  return {
    'form-control-range-slider-bullet--active': active.value
  }
})
</script>
```

(The only changes: drop `import { range } from 'd3'`, add the `useRangeSteps` import, and replace the local `steps` computed with the composable call. The template and `<style>` are unchanged.)

- [ ] **Step 4: Switch the ticks to `useRangeSteps`**

Replace the entire `<script setup>` block in `FormControlRangeTicks.vue` with:

```js
<script setup>
import { computed } from 'vue'

import { useRangeSteps } from '@/composables/useRangeSteps'
import FormControlRangeTicksEntry from './FormControlRangeTicksEntry'

const modelValue = defineModel('modelValue', { type: Number })

const props = defineProps({
  step: {
    type: Number
  },
  min: {
    type: Number
  },
  max: {
    type: Number
  }
})

const { steps } = useRangeSteps(
  () => props.min,
  () => props.max,
  () => props.step,
  modelValue
)

const style = computed(() => {
  const minWidth = String(props.max).length
  return { minWidth: `${minWidth}em` }
})
</script>
```

(Changes: drop `import { range } from 'd3'`, add the `useRangeSteps` import, replace the local `steps` computed with the composable call. The template and `<style>` are unchanged.)

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run tests/unit/specs/components/Form/FormControl/FormControlRange/FormControlRange.spec.js`
Expected: PASS — the new overflow blocks pass and all pre-existing bullet/ticks tests stay green.

- [ ] **Step 6: Commit**

```bash
git add src/components/Form/FormControl/FormControlRange/FormControlRangeSliderBullet.vue src/components/Form/FormControl/FormControlRange/FormControlRangeTicks.vue tests/unit/specs/components/Form/FormControl/FormControlRange/FormControlRange.spec.js
git commit -m "feat(FormControlRange): show a custom tick for out-of-range values"
```

---

### Task 4: Slider track renders a dashed out-of-range tail

**Files:**
- Modify: `src/components/Form/FormControl/FormControlRange/FormControlRangeSlider.vue`
- Test: `tests/unit/specs/components/Form/FormControl/FormControlRange/FormControlRange.spec.js`

**Interfaces:**
- Consumes: `useRangeSteps` from Task 2.
- Produces: the slider draws a solid track child (`.form-control-range-slider__track`) plus, when `hasOverflow`, a dashed track child (`.form-control-range-slider__track--dashed`). Exposes `hasOverflow`, `solidWidth` (string `%`), and `dashStyle` (`{ left, width }` in `%`) for assertions.

- [ ] **Step 1: Write the failing tests**

In `tests/unit/specs/components/Form/FormControl/FormControlRange/FormControlRange.spec.js`, add the import at the top alongside the existing imports:

```js
import FormControlRangeSlider from '@/components/Form/FormControl/FormControlRange/FormControlRangeSlider'
```

Then add a new top-level `describe` block at the end of the file:

```js
describe('FormControlRangeSlider.vue', () => {
  const factory = (props = {}) =>
    mount(FormControlRangeSlider, {
      props: { min: 1, max: 6, step: 1, modelValue: 3, ...props }
    })

  it('draws a single full-width solid track when the value is within bounds', () => {
    const wrapper = factory({ modelValue: 3 })
    expect(wrapper.vm.hasOverflow).toBe(false)
    expect(wrapper.vm.solidWidth).toBe('100%')
    expect(wrapper.find('.form-control-range-slider__track--dashed').exists()).toBe(false)
  })

  it('draws a dashed tail from the max tick to the custom tick when out of bounds', () => {
    const wrapper = factory({ modelValue: 8 })
    // steps [1,2,3,4,5,6,8] -> 7 slots; max tick index 5, custom tick index 6.
    expect(wrapper.vm.hasOverflow).toBe(true)
    expect(parseFloat(wrapper.vm.solidWidth)).toBeCloseTo((5.5 / 7) * 100)
    expect(parseFloat(wrapper.vm.dashStyle.left)).toBeCloseTo((5.5 / 7) * 100)
    expect(parseFloat(wrapper.vm.dashStyle.width)).toBeCloseTo((1 / 7) * 100)
    expect(wrapper.find('.form-control-range-slider__track--dashed').exists()).toBe(true)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run tests/unit/specs/components/Form/FormControl/FormControlRange/FormControlRange.spec.js -t FormControlRangeSlider`
Expected: FAIL — `wrapper.vm.hasOverflow` is `undefined` and `.form-control-range-slider__track` does not exist (the current slider only renders the bullet and paints the line via the container background).

- [ ] **Step 3: Render solid + dashed track segments**

Replace the entire contents of `FormControlRangeSlider.vue` with:

```vue
<script setup>
import { computed } from 'vue'

import { useRangeSteps } from '@/composables/useRangeSteps'
import FormControlRangeSliderBullet from './FormControlRangeSliderBullet'

const modelValue = defineModel({
  type: Number
})

const props = defineProps({
  step: {
    type: Number
  },
  min: {
    type: Number
  },
  max: {
    type: Number
  }
})

const { steps, hasOverflow } = useRangeSteps(
  () => props.min,
  () => props.max,
  () => props.step,
  modelValue
)

// Dot centres sit at (i + 0.5) / N of the track. The solid line runs to the
// centre of the normal-max tick; the dashed tail bridges from there to the
// centre of the appended custom tick.
const stepCount = computed(() => steps.value.length)
const maxIndex = computed(() => (hasOverflow.value ? stepCount.value - 2 : stepCount.value - 1))
const solidEnd = computed(() => ((maxIndex.value + 0.5) / stepCount.value) * 100)
const dashEnd = computed(() => ((stepCount.value - 0.5) / stepCount.value) * 100)

const solidWidth = computed(() => (hasOverflow.value ? `${solidEnd.value}%` : '100%'))
const dashStyle = computed(() => {
  return {
    left: `${solidEnd.value}%`,
    width: `${dashEnd.value - solidEnd.value}%`
  }
})
</script>

<template>
  <div
    class="form-control-range-slider"
    aria-hidden="true"
  >
    <span
      class="form-control-range-slider__track"
      :style="{ width: solidWidth }"
    />
    <span
      v-if="hasOverflow"
      class="form-control-range-slider__track form-control-range-slider__track--dashed"
      :style="dashStyle"
    />
    <form-control-range-slider-bullet
      v-model="modelValue"
      :min="min"
      :max="max"
      :step="step"
    />
  </div>
</template>

<style lang="scss" scoped>
.form-control-range-slider {
  position: relative;
  height: 1px;

  // The track is drawn as absolutely-positioned child segments rather than a
  // background on the container, so the out-of-range tail can render dashed
  // without changing the container width the bullet positions against.
  &__track {
    position: absolute;
    left: 0;
    top: 0;
    height: 1px;
    background-color: var(--bs-action);

    &--dashed {
      height: 0;
      background-color: transparent;
      border-top: 1px dashed var(--bs-action);
    }
  }
}
</style>
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/unit/specs/components/Form/FormControl/FormControlRange/FormControlRange.spec.js`
Expected: PASS — the new `FormControlRangeSlider.vue` block passes and the bullet/ticks blocks stay green.

- [ ] **Step 5: Commit**

```bash
git add src/components/Form/FormControl/FormControlRange/FormControlRangeSlider.vue tests/unit/specs/components/Form/FormControl/FormControlRange/FormControlRange.spec.js
git commit -m "feat(FormControlRange): render a dashed track tail past the slider max"
```

---

### Task 5: End-to-end verification

**Files:**
- Test: `tests/unit/specs/components/Search/SearchAdvancedModal/SearchAdvancedModal.spec.js` (run only)

**Interfaces:**
- Consumes: Tasks 1-4.
- Produces: confirmation that the modal round-trips an out-of-range query end-to-end.

- [ ] **Step 1: Run the modal + lucene + range suites together**

Run:
```bash
npx vitest run \
  tests/unit/specs/utils/luceneQuery.spec.js \
  tests/unit/specs/composables/useRangeSteps.spec.js \
  tests/unit/specs/components/Form/FormControl/FormControlRange/FormControlRange.spec.js \
  tests/unit/specs/components/Search/SearchAdvancedModal/SearchAdvancedModal.spec.js
```
Expected: PASS — all four files green. The `SearchAdvancedModal` specs are unchanged but confirm the modal still parses and submits correctly with the new parsing behaviour.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Manual smoke check (optional but recommended)**

Open the advanced search modal on a query of `"test"~8`. Expected: the form is populated (not blank), the proximity slider shows ticks `1..6` then a dashed line to a `8` tick with the bullet on it. Drag the bullet left: it snaps to `6` and the dashed tail disappears. Submit: the query is `"test"~8` again.

- [ ] **Step 4: Final commit (only if Step 1-2 surfaced fixes)**

```bash
git add -A
git commit -m "test(FormControlRange): verify out-of-range slider round-trip"
```

---

## Self-Review

**Spec coverage:**
- Parsing change (spec §1) → Task 1.
- Shared `useRangeSteps` (spec §2) → Task 2.
- Dashed track on the slider, not the ticks (spec §3) → Task 4.
- Bullet math unchanged, lands on custom slot, snaps to max (spec §4) → Task 3.
- Ticks show custom number, no dashed element there (spec §5) → Task 3.
- Both sliders / scope (spec) → covered structurally (shared `FormControlRange`); proximity exercised in tests, fuzzy covered by the parsing test (`foo~3`) and the shared component.
- Testing (spec §Testing) → Tasks 1, 3, 4, 5.
- Edge cases (`~0` still null, two clauses still null, non-faithful still null) → Task 1 keeps those guards; zero-distance test added.

**Placeholder scan:** none — every code step shows full code; no TBD/TODO.

**Type consistency:** `useRangeSteps(min, max, step, value)` returns `{ steps, hasOverflow }`; all three consumers (bullet, ticks, slider) call it with the same getter-wrapped argument order and destructure the same names. `solidWidth` / `dashStyle` / `hasOverflow` names match between Task 4's component and its test.
