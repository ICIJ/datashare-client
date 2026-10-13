# Persist the out-of-range slider value within an editing session

## Problem

The preceding feature ("preserve out-of-range slider values") makes the
advanced-search proximity/fuzzy slider show a value above its max (e.g. `8`
on a max-6 proximity slider) as an extra tick after the max, joined by a
dashed track tail. But that extra slot is driven by the **live** value
(`value > max` in `useRangeSteps`): the instant the user slides below the
max, the slot and dashed tail vanish and there is no way to slide back up to
the out-of-range value.

## Goal

The out-of-range value should **persist on the slider for the duration of the
current editing session** so the user can slide down and back up to it. It is,
in effect, the "initial max" for the query being edited.

It clears (the extra slot disappears) on **Reset** and on **reopening the
modal** — each session brings its own initial value, or none.

Applies to **both** sliders (proximity max 6, fuzzy max 2), which share
`FormControlRange`.

## Behaviour

- Open the modal on `"test"~8`: ticks `1 … 6 ╌╌ 8`, dashed tail from 6 to 8,
  bullet on `8`.
- Slide down to `3`: the `8` tick and the dashed tail **stay visible**; the
  bullet moves to `3`. The user can slide back up and land on `8` again
  (still no landable `7` — the gap is non-interactive).
- Reset, or reopen the modal on a query whose distance is within range (or has
  no proximity/fuzzy clause): no extra slot; the slider is the normal `1..max`.
- Open on a within-range query (e.g. `"test"~5`): normal slider, no extra slot
  (unchanged from today).

## Design (Approach A: remount per session + high-water anchor)

### 1. `useRangeSteps` — anchor the overflow slot to a high-water mark

File: `src/composables/useRangeSteps.js`

Today the overflow entry tracks the live value. Change it to track the highest
value seen since the composable was (re)created:

```js
import { range } from 'd3'
import { computed, ref, toValue, watch } from 'vue'

export function useRangeSteps(min, max, step, value) {
  // Anchor the overflow slot to the highest value seen since (re)mount, so a
  // value parsed above the max stays on the slider even after the user slides
  // down. It resets when the component is remounted (modal reopen / Reset).
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

The signature is unchanged, so the three consumers (bullet, ticks, slider)
need no call-site change. Each maintains its own `ceiling`, but since they are
all driven by the same `modelValue` they converge on the same value; the
redundancy is harmless and keeps the change confined to the composable.

Because the bullet positions on the **live** `modelValue` (`steps.indexOf`)
and the active tick is the **live** `modelValue`, only the slot's *presence*
becomes sticky — the bullet and highlight still track the live value.

Why a high-water mark rather than a snapshot of the initial value: it is robust
to the order in which the populated value and the remount land, and the user
can never exceed the max from the UI, so the high-water mark equals the parsed
out-of-range value in practice.

### 2. Modal — clear per session by remounting the sliders

File: `src/components/Search/SearchAdvancedModal/SearchAdvancedModal.vue`

Add a remount key bumped at the start of each editing session:

- `const formKey = ref(0)`
- In `handleOpen`, after `populateFromInitialQuery()`, increment `formKey`.
- In `handleReset`, increment `formKey`.
- Bind `:key="formKey"` on both `<search-advanced-modal-field-range>`
  elements (fuzzy and proximity).

Reopening or resetting remounts the range fields, which resets each slider's
`ceiling` to the freshly-populated value: `8` → persists for the session,
`≤ max` → no slot.

Notes:
- `handleReset` already runs on close (`whenever(() => !isVisible.value, …)`),
  so closing also bumps the key; the next open re-snapshots regardless.
- Only the two range fields are keyed, so the autofocused first input
  (`anyWords`) and the other fields keep stable instances. Remounting a range
  field re-reads its `term`/`distance` from the form via `v-model`, so no
  state is lost.

### Why not Approach B (explicit `ceiling` prop)

Threading a `ceiling` prop through `FieldRange → FormControlRange →
useRangeSteps` and nulling it on reset is fully explicit and avoids a remount,
but it changes `useRangeSteps`' signature and adds prop plumbing across two
component layers. Approach A matches the "set when the component is created"
mental model and is the smaller change.

## What does not change

- Parsing (`luceneQuery.js`), the round-trip gate, and the distance constants.
- The slider track geometry (solid + dashed segments) and the bullet drag/
  position math.
- The non-interactive gap: still no landable `7`; the bullet snaps between
  `1..max` and the anchored value.
- The normal (no overflow) case stays a single full-width solid track.

## Testing

- **`useRangeSteps`** (`tests/unit/specs/composables/useRangeSteps.spec.js`):
  - The slot **persists** when the value rises above max and then drops back
    below: created at `3`, set to `8` (slot appears), set to `3` again → steps
    still `[1,2,3,4,5,6,8]`, `hasOverflow` still true.
  - High-water: created at `3`, set to `8` → steps gain `8` (existing reactive
    test, still valid under the high-water rule).
  - No slot when created and kept within bounds (existing test).
- **`FormControlRange`**
  (`tests/unit/specs/components/Form/FormControl/FormControlRange/FormControlRange.spec.js`):
  - Bullet/ticks/slider created at `modelValue: 8`, then `setProps({ modelValue: 3 })`:
    the custom tick (`'8'`) and the dashed track tail still render, and the
    bullet sits on the `3` slot (`style.left` for index 2 of 7).
- **`SearchAdvancedModal`**
  (`tests/unit/specs/components/Search/SearchAdvancedModal/SearchAdvancedModal.spec.js`):
  - Expose `formKey` via `defineExpose` and assert it increments after the
    modal opens and again after `handleReset`. This directly verifies the
    per-session remount mechanism without deep-mounting the slider (which would
    make the assertion brittle). The existing populate/submit tests confirm the
    form still behaves; the increment test confirms the sliders re-snapshot.

## Out of scope

- Letting users dial a value above the max from the UI (still preserve-only).
- Remembering the value across a full modal close→reopen on the *same* query
  beyond what re-parsing the query already restores.
- Animating the extra tick's appearance/disappearance.
