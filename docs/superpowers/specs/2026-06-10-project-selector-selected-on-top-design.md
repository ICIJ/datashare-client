# Project selector: selected projects on top

## Goal

In the project selector dropdown (`ProjectDropdownSelector`), selected projects should always appear at the top of the option list — below the "All projects" checkbox, which stays where it is.

## Behavior

- **Both modes.** Applies to single-select (one active project) and multi-select (with the "All projects" checkbox).
- **Stable while open.** The set of projects pinned to the top is snapshotted when the dropdown opens. Toggling a checkbox while the dropdown is open does **not** reshuffle the list; the new ordering is applied the next time it opens.
- **While searching.** When a query filters the list, selected projects still float to the top of the filtered matches.
- **Within-group order.** Among pinned projects (and among the rest), the original `projects` order is preserved (stable sort).
- **"All projects" untouched.** The select-all checkbox is rendered in the `#above` slot and is not part of the reordered list.

## Components

### `SearchBarInputDropdown.vue` (additive)

`SearchBarInputDropdown` wraps `b-dropdown`, which already exposes its open state via `v-model="visible"`. Add a `shown` passthrough so consumers can react to opening:

- Add `'shown'` to the component's `emits` array.
- Wire `b-dropdown`'s `@shown` to re-emit a `shown` event upward.

This is purely additive. It does **not** modify the existing `valueChanged` / `initialValue` / `changed` logic, so the main `SearchBar` usage is unaffected (it simply ignores the new event).

### `ProjectDropdownSelector.vue`

1. **Pinned snapshot.** Add a `pinnedNames` ref holding the names of projects pinned to the top.
   - Initialize from the current selection at setup: `pinnedNames.value = selectedProjects.value.map(p => p.name)`.
   - Refresh on each `shown` event from `SearchBarInputDropdown` with the same expression.

2. **Ordering.** Add an `orderedOptions` computed and pass it as the dropdown's `:options` (replacing `options`). It takes the existing query-filtered `options` list and stable-sorts it:
   - Projects whose `name` is in `pinnedNames` come first, in their original relative order.
   - All others follow, in their original relative order.

   `options` (the query filter) stays as the source list; `pinnedNames` is independent of the query, so selected-on-top survives filtering.

## Testing

Extend `tests/unit/specs/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.spec.js`:

- A pre-selected project renders first in the option list (single and multi-select).
- After toggling a selection while open, the visible order does not change.
- Selected-on-top still holds when a query filters the list.

## Out of scope

- Live re-sorting on every toggle (explicitly rejected; chose stable-while-open).
- Any change to the existing `valueChanged` / `changed` behavior of `SearchBarInputDropdown`.
- Reordering the "All projects" checkbox.
