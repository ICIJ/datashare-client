# Search bar dropdowns — unification design

Date: 2026-07-01
Status: Design (awaiting review)

## Problem

The search bar's two dropdowns — the **field** selector and the **project** selector —
are inconsistent in quality and share a weak foundation.

- The generic base they both build on, `SearchBarInputDropdown.vue`, is Options API,
  ~292 lines, contains dead commented code (`hide()`/`hidden()`), mixes confusing event
  names (`hide` vs `hidden` vs `selected` vs `changed`), reimplements its own selection
  toggle logic inline, and has only 2 tests.
- `SearchBarInputDropdownForField.vue` is a thin Options API wrapper with a meaningless
  `immediate: true` on a computed, and no dedicated test.
- `ProjectDropdownSelector.vue` is the quality bar (Composition API, well tested, rich:
  filter-search, keyboard navigation, select-all, pin-selected, thumbnails) — but it owns
  all of that richness itself, so the field dropdown cannot benefit from it.
- Project value normalization (indices ↔ `{ name }` objects + fallback default) is
  duplicated across three places: `SearchBar.vue`, `SearchBarInputDropdownForProjects.vue`,
  and `ProjectDropdownSelector.vue`.

## Goal

Reorganize these implementations for DRYness, `/vue-best-practices`, and `/pirhoo-style`:
one powerful, generic, well-tested dropdown primitive that both the field and project
selectors reduce to thin wrappers of. No regression in behavior.

## Decisions (locked)

- **Full unification**: fold the rich features (filter-search, keyboard navigation,
  select-all, pin-selected) into the generic base so the field dropdown gets them too.
- **Slot-first + key prop** API: the generic component owns state/keyboard/filter and
  requires an `optionKey` prop plus mandatory `#button-content` and `#item` slots. There is
  no `optionLabel` accessor — all display goes through slots.
- **Rename + relocate** the generic base to a neutral folder.
- **Base name: `AppDropdown`** in `src/components/AppDropdown/`
  (`SelectableDropdown` is unavailable — it is a globally-registered `@icij/murmur`
  component already used for the search suggestions list).
- **Field wrapper: `FieldDropdownSelector`** in its own folder
  (`src/components/FieldDropdownSelector/`), renamed from `SearchBarInputDropdownForField`.
- **SearchBar.vue rewrite** is in scope: convert to `<script setup>` (plain JS, the project
  is not TypeScript) and extract the Lucene suggestion logic into a composable.

## Hard constraints (do not break)

Public APIs of these components must stay stable — they have consumers outside the search bar:

- `ProjectDropdownSelector` — also used by `TaskBatchSearchFormDetails.vue`.
- `SearchBarInputDropdownForProjects` — also used by `TaskDocumentsForm.vue` and
  `TaskEntitiesForm.vue`.

The only current importers of the generic base (`SearchBarInputDropdown`) are
`SearchBarInputDropdownForField`, `ProjectDropdownSelector`, and (indirectly) `SearchBar`.
The base rename is therefore contained.

## Target topology

```
AppDropdown  ← generic primitive, <script setup>, components/AppDropdown/
  owns: b-dropdown wrapper, selection (single/multiple), filter-search,
        keyboard navigation, select-all, pin-selected, unified events
  subcomponents: AppDropdownSearch, AppDropdownSelectAll
  slots: #button-content (required), #item (required), #above/#below/#no-matches (optional)
        ▲                                   ▲
        │                                   │
FieldDropdownSelector                ProjectDropdownSelector
 components/FieldDropdownSelector/     components/Project/ProjectDropdownSelector/
  thin wrapper: field keys,            re-pointed at AppDropdown; drops its own
  identity key, single-select,         focusIndex/moveFocus/query/scrollIntoView and
  i18n labels via #item slot           its Search/All subcomponents (now generic);
                                       keeps ButtonContent + Entry + Checkbox as slots
                                              ▲
                                    SearchBarInputDropdownForProjects
                                     search-context wrapper: indices ↔ project
                                     normalization + fallback, consolidated to ONE place
```

## The generic `AppDropdown`

### Props

- `options: Array` — any shape.
- `optionKey: [String, Function]` — how to derive a unique key from an option; default identity.
- `modelValue` via `defineModel` — `[String, Array, Object]`; an array value means multiple.
- `multiple: Boolean` — explicit multiple mode.
- `searchable: Boolean` — show the built-in search input and filter options.
- `optionFilter: Function` — `(option, query) => boolean`; used when `searchable`. Default
  matches the option key (case-insensitive wildcard). The project wrapper passes a custom
  filter that matches both `label` and `name`.
- `allowSelectAll: Boolean` — show the select-all row (multiple only).
- `pinSelected: Boolean` — pin selected options to the top; re-pin on close.
- `disabled`, `noCaret`, `placement`, `teleportTo` (default `'body'`), `teleportDisabled`.
- `searchPlaceholder: String`, `selectAllLabel: String`, `noMatchesLabel: String` — labels
  for the built-in search / select-all / empty states (wrappers pass i18n strings).

### Slots

- `#button-content="{ selectedOptions, selectedKeys }"` — required; toggle button display.
- `#item="{ option, index, selected, focused, toggle, toggleUnique }"` — required; render one option.
- `#above`, `#below`, `#no-matches` — optional.

### Emits (unified)

Replaces the old `hide`/`changed`/`selected`/`hidden` mix:

- `update:modelValue`
- `change` — fires on close, only when the value changed since the dropdown opened
  (replaces `changed`).
- `shown`, `hidden` — open/close lifecycle.

Reset-on-open (clear query and focus index) is handled internally, removing the need for
the old externally-consumed `selected` event.

### Exposed

`defineExpose({ hide, focus })` for wrappers that need imperative control.

## Extracted composables (DRYness)

- **`useDropdownSelection(modelValue, { multiple, optionKey })`**
  → `{ selectedKeys, isSelected, toggleValue, toggleUniqueValue, selectValue, unselectValue,
  selectAll, unselectAll }`. Replaces the bespoke inline toggle logic in the old base,
  including the "cannot unselect the last item in multiple mode" rule and the
  set/toggle-unique semantics. Aligned with the philosophy of the existing `useSelection`
  composable, but handles the single-vs-multiple duality the dropdown needs.
- **`useListNavigation(items, { onEnter })`**
  → `{ focusIndex, moveFocusUp, moveFocusDown, selectFocused, resetFocus }` plus
  scroll-into-view. Lifts the keyboard logic out of `ProjectDropdownSelector` into the base,
  so the field dropdown gets keyboard navigation for free.

Option filtering stays a small computed driven by the `optionFilter` prop (no dedicated
composable — YAGNI).

## Wrapper simplifications

### `FieldDropdownSelector` (was `SearchBarInputDropdownForField`)

- `<script setup>` + `defineModel`.
- Default `options` from `settings.searchFields` (field keys).
- `optionKey` = identity; single-select; not searchable.
- `#button-content` and `#item` slots render `t('search.field.' + key)`.
- Drops the meaningless `immediate: true` computed.
- Gains a dedicated spec.

### `ProjectDropdownSelector`

- Re-pointed at `AppDropdown` (`multiple`, `searchable`, `allowSelectAll`, `pinSelected`,
  custom `optionFilter` matching label + name, `optionKey="name"`).
- Deletes its own `focusIndex`/`moveFocus*`/`query`/`scrollIntoView`/pin logic (now in base).
- Deletes `ProjectDropdownSelectorSearch` and `ProjectDropdownSelectorAll` — they collapse
  into the generic `AppDropdownSearch` / `AppDropdownSelectAll`.
- Keeps `ProjectDropdownSelectorButtonContent`, `ProjectDropdownSelectorEntry`,
  `ProjectDropdownSelectorCheckbox` as slot content.
- Public props/emits unchanged (hard constraint). Pin-on-close behavior preserved and tested.

### Projects normalization consolidation

The indices ↔ `{ name }` object mapping and fallback-default logic currently duplicated in
`SearchBar.vue`, `SearchBarInputDropdownForProjects.vue`, and `ProjectDropdownSelector.vue`
is consolidated into a single `useSelectedProjects` composable that resolves a list of
index names to project objects (with the optional fallback default). The composable is used
by `SearchBarInputDropdownForProjects` (which keeps its public API); `SearchBar.vue`
delegates project resolution to that wrapper instead of re-mapping indices itself; and
`ProjectDropdownSelector` receives already-resolved project objects. `AppDropdown` deals only
in keys.

## SearchBar.vue rewrite

- Convert to `<script setup>` (plain JS).
- Extract the Lucene term-suggestion logic — `termCandidates`, `replaceLastTermCandidate`,
  `injectTermInQuery`, `suggestTerms`, and the throttled `searchTerms` — into a
  **`useSearchSuggestions`** composable, keeping the view a thin composition surface.
- Preserve store wiring, focus handling, and submit behavior identically.
- `@changed="focusOnSearchInput"` on the field/project dropdowns becomes `@change`.

## Testing (Vitest + Vue Test Utils)

New / expanded specs:

- `AppDropdown.spec.js` — single-select, multiple-select, toggle, toggle-unique,
  cannot-unselect-last rule, searchable filtering, keyboard up/down/enter + scroll,
  select-all, pin-selected + re-pin on close, `change` fires only on changed close,
  `shown`/`hidden`, teleport, disabled, noCaret, slot rendering.
- `useDropdownSelection.spec.js`, `useListNavigation.spec.js` — unit tests.
- `FieldDropdownSelector.spec.js` — renders field options, translates labels, single-select,
  v-model, default options from settings (new; none exists today).
- `useSearchSuggestions.spec.js` — term parsing/injection/candidate replacement.
- Adapt existing `ProjectDropdownSelector`, `SearchBarInputDropdownForProjects`, and
  `SearchBar` specs so behavior stays green. Retire `SearchBarInputDropdown.spec.js` in favor
  of `AppDropdown.spec.js`.

## Verification / "not broken"

- Update all importers: `SearchBar.vue`, `ProjectDropdownSelector`, and the renamed field
  wrapper. Confirm the Task* consumers of `ProjectDropdownSelector` and
  `SearchBarInputDropdownForProjects` still work (public APIs unchanged).
- Run the full unit suite and lint before completion.

## Risks

- `b-dropdown` (bootstrap-vue-next) teleport + keyboard focus interplay when nav moves into
  the base.
- Preserving `ProjectDropdownSelector`'s subtle pin-on-close behavior (reorder while hidden
  to avoid a visible flash).
- Lucene edge cases in the extracted `useSearchSuggestions`.

## Out of scope

- The `@icij/murmur` `SelectableDropdown` used for suggestions (only its usage in the
  rewritten `SearchBar.vue` is touched).
- Any visual redesign — this is a structural/quality refactor with behavior parity.
