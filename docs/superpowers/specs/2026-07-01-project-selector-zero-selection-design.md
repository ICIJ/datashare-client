# Project selector: prevent deselecting the last project

## Problem

In the project dropdown selector (`ProjectDropdownSelector`), a user can appear to
deselect every project by clicking directly on a checkbox, ending up with "zero
projects" selected. Clicking the row instead of the checkbox never does this.

### Root cause

`ProjectDropdownSelectorEntry` has two overlapping click targets:

- The row `<div>` has `@click` → `toggleValue`, which is correctly guarded in
  `useDropdownSelection.js`: `unselectValue` refuses to remove the last remaining
  project (`multiple && selectedValues.length > 1`).
- Inside the row sits a real `<b-form-checkbox>` bound one-way with
  `:model-value="selected"`.

When the user clicks the **row**, only the guarded path runs, so the selection can
never drop to zero. When the user clicks **directly on the checkbox**, the native
`<input>` toggles itself to unchecked *and* the click bubbles to the guarded row
handler. The guard blocks the model change (the selection is preserved), but nothing
forces the native checkbox back to checked — so the checkbox visually desyncs and
reads as "nothing selected" even though one project is still selected.

Verified in a scratch test: with a single project selected, clicking its checkbox
leaves the model unchanged (still 1 active, no `update:modelValue` emitted) while the
checkbox DOM `.checked` flips to `false`.

The model is actually protected by the existing guard; the bug is the checkbox visual
lying.

## Decision

Disable the checkbox of the last remaining selected project. A disabled checkbox can't
be toggled by the user, which removes the native desync at its source and gives a
visible affordance that the last project can't be unchecked.

## Behavior

- Multiple-select mode, exactly one project selected: that project's checkbox renders
  **disabled** (still checked, not clickable).
- All other checkboxes stay interactive.
- Selecting a second project re-enables every checkbox.
- Single-select mode is unaffected (it renders no checkbox — `noCheckbox`).

## Design

The "keep at least one" rule already lives in `useDropdownSelection.js`
(`unselectValue`'s `multiple && selectedValues.length > 1` guard). To avoid
duplicating it in the view layer, expose a derived helper from the composable and let
it drive the disabled state — single source of truth.

### Wiring (top to bottom)

1. **`src/composables/useDropdownSelection.js`** — add and return a helper:

   ```js
   // A selected option in multiple mode can't be unselected if it's the last one.
   const isRequiredSelection = (option) =>
     multiple.value && isSelected(option) && selectedValues.value.length <= 1
   ```

2. **`src/components/DropdownSelector/DropdownSelector.vue`** — destructure
   `isRequiredSelection` from the composable and expose it on the `item` slot bindings
   alongside `selected`, `focused`, `toggle`, `toggleUnique` (e.g. as
   `selectionRequired: isRequiredSelection(option)`).

3. **`src/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.vue`** —
   read the new slot binding and forward it to `ProjectDropdownSelectorEntry`
   (e.g. `:selection-required="selectionRequired"`).

4. **`src/components/Project/ProjectDropdownSelector/ProjectDropdownSelectorEntry.vue`**
   — accept the prop and forward it to the checkbox's existing `disabled` prop.

5. **`src/components/Project/ProjectDropdownSelector/ProjectDropdownSelectorCheckbox.vue`**
   — no change; it already wires a `disabled` prop into `b-form-checkbox`.

## Tests

- **`useDropdownSelection.spec.js`**: `isRequiredSelection` is `true` for the sole
  selected option in multiple mode; `false` when 2+ options are selected; `false` in
  single-select mode.
- **`ProjectDropdownSelector.spec.js`**: with one project selected, its checkbox
  `<input>` is `disabled`; with two projects selected, neither checkbox is disabled.

## Out of scope

- Changing the composable guard itself (already correct).
- `FilterTypeProject`, which uses its own `b-form-checkbox-group` and does not go
  through this entry/checkbox path.
