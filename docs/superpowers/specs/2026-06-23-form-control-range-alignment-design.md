# FormControlRange tick/bullet alignment fix

## Problem

Three defects in `FormControlRange`:

1. **Misalignment** — the slider bullet's dot does not line up with its
   corresponding tick entry. The gap widens toward the last tick.
2. **Clipping** — the outer ticks are clipped at the component edges.
3. **Unreachable last tick** — dragging the bullet to the right cannot land on
   the last tick (it freezes near the start).

## Root cause

### Misalignment (regression)

`FormControlRangeSliderBullet` positions the dot with a *bucket model*: each
step `i` of `N` steps occupies a slice of width `100/N` of the **full slider
width**, and the dot sits at the slice center — i.e. at `(i + 0.5)/N`
(`FormControlRangeSliderBullet.vue:32-40`).

For the ticks to align, tick `i`'s center must also fall at `(i + 0.5)/N` of
the same full width. With flex items (`flex-grow: 1; flex-basis: 0`) the gap
and outer margin shift those centers, so alignment only holds when
**outer margin = gap / 2**. The original styles satisfied this exactly:

```scss
gap: $spacer-xl;
margin: 0 math.div($spacer-xl, 2);   // margin = gap / 2
```

Commit `0f58eb939` ("reduce slider density on mobile device") replaced these
with `gap-1 gap-sm-3 mx-3`. `mx-3` (1rem) is no longer half the gap (1rem
desktop / 0.25rem mobile), so the tick row is compressed and shifted inward,
drifting away from the full-width slider — worst at the last tick.

### Clipping (regression)

The `&__wrapper` carried a negative horizontal margin
(`margin: 0 -$spacer-xl/2`) paired with `overflow: hidden` on
`.form-control-range`. The original design used this so the *slider track* could
be wider than the visible box while the *ticks container* (with
`margin: 0 $spacer-xl/2`) matched the visible box exactly — both still aligning
at `(i + 0.5)/N` of the wrapper width. Once the ticks row was changed to span
the full wrapper width (per-entry spacing, below), the outer ticks extended past
the visible box and were clipped by `overflow: hidden`.

### Unreachable last tick (root cause: directive thresholds)

The shared `draggable` directive carries resizable-panel semantics: its
`handleDragThresholds` emits an `expand` event (instead of `drag`) once
`position >= parentWidth - expandThreshold`, with `expandThreshold` defaulting
to **100px** (and a symmetric `reduceThreshold`). On a narrow track (e.g. 133px)
that boundary sits at ~33px, so after the smallest rightward drag every move
emits `expand`. `FormControlRangeSliderBullet` only listens for `@drag`, so
those moves are dropped and the value freezes near the start — the bullet can
never reach the last tick.

Verified empirically in the browser: before the fix the emitted sequence was
`drag:12.8, expand:42.8, expand:66.9`; after disabling the thresholds it is
`drag:12.8, drag:42.8, drag:66.9` (detail `66.9` → index `N-1`).

A defensive index clamp is also added: when the bullet width measures as `0`
(no layout, e.g. jsdom) the directive's own clamp is ineffective and
`Math.round(N · x/100)` can yield `N`, making `steps[N]` `undefined`.

## Fix (Option B — gapless spacing on the entry)

Move tick spacing off the flex `gap` (which moves item centers) onto each
entry's own symmetric horizontal margin (which keeps each item a uniform cell,
so centers stay exactly at `(i + 0.5)/N`). This removes the fragile
`margin = gap/2` invariant entirely and lets responsive spacing change freely
without breaking alignment.

### `FormControlRangeTicks.vue`

- Drop `gap-1 gap-sm-3 mx-3` from the row container; keep `d-flex flex-row`.
  The row spans the full slider width (no outer margin).
- Apply responsive symmetric horizontal spacing on each entry instead, e.g.
  `class="mx-1 mx-sm-2"` on `<form-control-range-ticks-entry>`, preserving the
  mobile-vs-desktop density intent of `0f58eb939`.

### `FormControlRange.vue`

Drop the `&__wrapper` negative margin (and the now-pointless `overflow: hidden`)
so the slider track, the ticks row, and the visible box all share one width.
With the per-entry spacing above, tick centres and bullet positions both fall at
`(i + 0.5)/N` of that shared width — aligned, and nothing overflows to clip.

### `FormControlRangeSliderBullet.vue`

1. Disable the directive's resizable-panel thresholds so it always emits `drag`:

   ```
   v-draggable.relative.percent="{ target, expandThreshold: -Infinity, reduceThreshold: Infinity }"
   ```

2. Clamp the drag index into the valid range (keep `round`):

   ```js
   const i = Math.round(steps.value.length * (x / 100))
   const index = Math.min(steps.value.length - 1, Math.max(0, i))
   ```

## Out of scope

- Switching to a true endpoint slider model (ticks at `i/(N-1)`, dot flush to
  0%/100%). Larger rewrite; not pursued.

## Verification

- Each bullet dot is centered over its tick across the full range (incl. first
  and last) at both mobile and desktop breakpoints.
- No tick is clipped at the component edges.
- Dragging right emits `drag` (not `expand`) across the whole track and reaches
  the last tick; the value is never `undefined`.
- Existing FormControlRange stories still render.
