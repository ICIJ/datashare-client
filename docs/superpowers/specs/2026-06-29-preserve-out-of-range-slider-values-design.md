# Preserve out-of-range slider values in the advanced search modal

## Problem

The advanced search modal has two range sliders backed by the same
`FormControlRange` component:

- **Proximity** ("with phrase changes"), max `PROXIMITY_DISTANCE_MAX = 6`
- **Fuzzy** ("with spelling changes"), max `FUZZY_DISTANCE_MAX = 2`

When the modal opens on an existing query, `toAdvancedForm` parses the query
back into the form. If a proximity/fuzzy distance exceeds the slider max
(e.g. `"test"~8`), `tryParseProximity` / `tryParseFuzzy`
(`src/utils/luceneQuery.js:623,638`) mark the parse `lossy`, and
`toAdvancedForm` returns `null` (line 853). A `null` parse blanks the **entire
modal form**, not just the affected field, so the query can no longer be
round-tripped through the modal.

## Goal

**Preserve only.** Opening the modal on an out-of-range query must no longer
blank the form. The slider holds whatever value was parsed and regenerates it
faithfully. Users still cannot dial a value above the max from the UI; the
slider simply preserves what it was given.

Applies to **both sliders** (proximity and fuzzy), since they share
`FormControlRange`. Note that fuzzy `~3+` is engine-invalid (Elasticsearch
caps edit distance at 2), but it is preserved uniformly anyway: it round-trips
in the modal even though Elasticsearch would reject the search itself.

## Behaviour

Opening the modal on `"test"~8` (proximity) or `term~3` (fuzzy) shows the
slider widened with the preserved value as an extra tick after the normal max,
joined to the rest of the track by a dashed line:

```
Max words apart
 1   2   3   4   5   6 ╌╌╌╌ 8
                            ●
```

- Landable positions: `1..max` and the single preserved custom value.
- There is **no** intermediate tick (no `7`); the gap is a visual bridge only.
- Dragging the bullet off the custom value snaps it back to `max` (6).
- Picking any `1..max` value discards the custom value (it is **not**
  remembered); the custom tick and dashed segment disappear.
- The UI can never produce a value above `max` except the preserved parsed
  one, and can never exceed the custom value.
- When `value <= max`, the slider behaves exactly as today: normal ticks, fully
  solid track, no custom tick. The feature is purely additive and inert in the
  normal case.

## Design

### 1. Parsing layer — `src/utils/luceneQuery.js`

Drop **only** the `distance > MAX` term from the lossy guards:

- `tryParseProximity` (line 623): remove `|| distance > PROXIMITY_DISTANCE_MAX`
- `tryParseFuzzy` (line 638): remove `|| distance > FUZZY_DISTANCE_MAX`

Everything else in those guards stays:

- the second-clause guard (`ctx.form.proximityPhrase` / `ctx.form.fuzzyTerm`
  already set — two clauses cannot be represented),
- the faithfulness check (`isFaithfulPhrase` / `isFaithfulTerm`),
- `distance < 1`.

The parsed distance is stored as-is (`proximityDistance` / `fuzzyDistance`).
Regeneration already emits it verbatim
(`src/utils/luceneQuery.js:284,291` — `"..."~${formData.proximityDistance}`),
so the round-trip faithfulness gate at line 872 — the real safety net —
passes. No new constants are introduced; `PROXIMITY_DISTANCE_MAX` (6) and
`FUZZY_DISTANCE_MAX` (2) remain the slider's normal max.

### 2. Shared steps — `FormControlRange` family

Today `FormControlRangeSliderBullet` and `FormControlRangeTicks` each
independently recompute `steps = range(min, max + step, step)`. Centralise this
into one shared source — a small `useRangeSteps(min, max, step, value)`
composable — so the bullet and ticks cannot disagree on the slot layout.

`useRangeSteps` returns the normal range, plus **one trailing custom entry
equal to `value` when `value > max`**:

- `value <= max` → `[1, 2, 3, 4, 5, 6]` (unchanged from today)
- `value > max`  → `[1, 2, 3, 4, 5, 6, 8]` (custom entry appended)

The composable accepts maybe-reactive inputs and normalises with
`toValue()` so callers can pass refs/getters (per the project's
adaptable-composable convention).

### 3. Track — `FormControlRangeSlider`

The slider track (`.form-control-range-slider`, the 1px `--bs-action` line the
bullet rides on) renders:

- **solid** for the in-range portion (min → max), and
- **dashed** for the out-of-range tail (max → custom value), replacing the
  solid line in that segment.

The dashed segment is the track itself, not a separate connector near the
ticks. The bullet travels the full track and rests on the custom slot at the
dashed end. With no overflow value the track is fully solid, exactly as today.

Geometry: with `steps = [1,2,3,4,5,6,8]` there are `N = 7` slots; tick/bullet
centres sit at `(i + 0.5) / N`. The solid portion runs to the centre of the
`max` tick (slot `maxIndex`), and the dashed portion spans from there to the
centre of the custom tick (slot `N - 1`).

### 4. Bullet — `FormControlRangeSliderBullet`

No change to the positioning or drag math:

- position: `left = (100 / N) * steps.indexOf(value)` → lands in the last slot
  for the custom value.
- drag: `index = round(N * (x / 100))` clamped to `[0, N - 1]`. Because no entry
  exists between the `max` slot and the custom slot, dragging off the custom
  value snaps to `max`. This behaviour falls out of the extended `steps` array
  for free.

The bullet consumes the shared `steps` from `useRangeSteps` instead of
recomputing it.

### 5. Ticks — `FormControlRangeTicks` / `FormControlRangeTicksEntry`

The custom entry renders as a normal tick showing the actual number. No dashed
element lives in the ticks row (the dashed treatment is on the track only).
The ticks consume the shared `steps` from `useRangeSteps`.

## Edge cases

- **Very large value** (e.g. `"test"~9999`): the custom tick renders the full
  number ("9999"). It will be wide but functional. No truncation — out of scope.
- **`distance < 1`** (e.g. `~0`): still lossy (unchanged), still blanks.
- **Two proximity/fuzzy clauses**: still lossy via the second-clause guard
  (unchanged).
- **Non-faithful phrase/term**: still lossy via the faithfulness check
  (unchanged).

## Testing

- **`luceneQuery` unit specs**: `"test"~8` and `term~3` now parse (not
  `null`), set `proximityDistance`/`fuzzyDistance` to the parsed value, and
  round-trip to the identical query string. Existing lossy cases
  (`distance < 1`, two clauses, non-faithful) still blank.
- **`FormControlRange` component specs**:
  - `value > max` renders the custom tick and a dashed track tail; `value <=
    max` renders normal ticks and a fully solid track (unchanged).
  - dragging the bullet off the custom value snaps to `max`.
  - clicking a normal tick clears the custom tick and dashed tail.
- **`SearchAdvancedModal` specs**: remain green.

## Out of scope

- Letting users actively set values above the max from the UI.
- Raising or removing `PROXIMITY_DISTANCE_MAX` / `FUZZY_DISTANCE_MAX`.
- Remembering a discarded custom value after the user picks a normal one.
- A wider visual gap for the dashed segment (equal flex spacing is kept).
