# File type categories filter improvements

**Issue:** [ICIJ/datashare#2177](https://github.com/ICIJ/datashare/issues/2177)
**Date:** 2026-06-08

## Summary

Three minor improvements to the file type categories experience in the search
filters panel and breadcrumb:

1. Use a plural fallback message ("Some of these projects were indexed without
   file type categories.") when several projects are selected.
2. Use the `files` Phosphor icon for the file type categories filter in the
   breadcrumb.
3. Make file type categories collapsible in the grouped filter view —
   collapsed by default, with state persisted across reloads.

These are pattern-following changes scoped to existing components; no new
architecture is introduced.

## Context

- The file types filter is `FilterTypeFileTypes.vue`. In **grouped** view it
  renders one `ContentTypesCategory` per category, each containing a
  `ContentTypesCategoryName` header row (checkbox + label + count) followed by
  per-type `ContentTypesEntry` rows.
- A "legacy index" overlay covers the grouped view when the
  `contentTypeCategory` field is missing from at least one selected index.
  Availability is a single boolean from `useContentTypeCategoryAvailability`
  (`isAvailable` is true only when **every** selected index has the field).
- The hidden `contentTypeCategory` filter (`src/store/filters/index.js`) is
  excluded from the panel but surfaces in the URL and breadcrumb. The
  breadcrumb resolves a filter's icon from `filter.options.icon` via
  `SearchParameterFilter.vue`.
- User settings are stored under `SETTINGS.views.<view>` and accessed with
  `appStore.getSettings(view, name)` / `appStore.setSettings(view, name, value)`.
  Object/array-shaped settings are already in use (e.g.
  `documentViewMetadata.pinned`).

## Item 1 — Plural fallback message for multiple projects

The overlay always renders the singular `filter.fileTypes.legacyIndex.description`.
We add a plural variant and pick between them based on the number of selected
projects (count-based, per the issue).

### i18n

In every language file under `src/lang/`, add a sibling key under
`filter.fileTypes.legacyIndex`:

```json
"legacyIndex": {
  "title": "Category grouping unavailable",
  "description": "This project was indexed without file type categories.",
  "descriptionPlural": "Some of these projects were indexed without file type categories."
}
```

The English string is authored. Non-English files receive the English string
as a placeholder for translators (consistent with how new strings are seeded).

### Logic

In `FilterTypeFileTypes.vue`, derive the description key from the selected
project count:

```js
const isMultipleProjects = computed(() => searchStore.indices.length > 1)
const legacyIndexDescription = computed(() =>
  isMultipleProjects.value
    ? t('filter.fileTypes.legacyIndex.descriptionPlural')
    : t('filter.fileTypes.legacyIndex.description')
)
```

The overlay template uses `legacyIndexDescription` instead of the hardcoded
`t('filter.fileTypes.legacyIndex.description')`. No change to
`useContentTypeCategoryAvailability` — we only need the project count, not
per-index detail.

## Item 2 — `files` icon for the category filter in the breadcrumb

In `src/store/filters/index.js`:

- Replace `import IPhStack from '~icons/ph/stack'` with
  `import IPhFiles from '~icons/ph/files'` (icon confirmed to exist in the
  Phosphor iconify set).
- On the `contentTypeCategory` filter definition, set
  `icon: markRaw(IPhFiles)`.

The visible `contentType` filter keeps its singular `IPhFile` icon. Update any
test that asserts `IPhStack` for the `contentTypeCategory` filter.

## Item 3 — Collapsible categories, collapsed by default, persisted

Each category in grouped view becomes independently collapsible. Categories
are **collapsed by default** and the state persists across reloads.

### Persisted setting

Add to `SETTINGS.views.search`:

```js
expandedContentTypeCategories: []
```

We store the **expanded** keys (not the collapsed ones) so the empty default
matches the collapsed-by-default behavior. An existing user with no saved
value gets collapsed-by-default for free — no migration needed.

### Composable `useContentTypeCategoryCollapse`

A small composable wrapping the setting:

- `isCollapsed(category)` → `!expandedSet.has(category)`
- `toggleCollapse(category, collapsed)` → add/remove the key from the expanded
  set and persist via `appStore.setSettings('search', 'expandedContentTypeCategories', ...)`

The expanded set is derived reactively from
`appStore.getSettings('search', 'expandedContentTypeCategories')`.

### Component changes

- **`ContentTypesCategoryName.vue`** — add a leading caret `ButtonIcon`
  (reusing the `IPhCaretDown` / `IPhCaretUp` pattern from
  `FiltersPanelSectionFilterTitleToggler`) bound to a `collapse` model. The
  caret toggles collapse; the existing checkbox continues to toggle category
  selection. The two controls are independent within the same header row.
- **`FilterTypeFileTypes.vue`** — instantiate `useContentTypeCategoryCollapse`,
  bind `:collapse` / `@update:collapse` (or `v-model:collapse`) on each
  `ContentTypesCategoryName`, and wrap the per-type `ContentTypesEntry` list in
  a `<b-collapse :model-value="!isCollapsed(category)">` for an animated
  expand/collapse consistent with the section-level collapse.
- **`ContentTypesCategory.vue`** — unchanged structurally; only the entries
  region (now inside `<b-collapse>`) becomes collapsible. Existing
  `padding-inline-start` styling on entries is preserved.

### Interaction notes

- "Click label = select" behavior is preserved for parity with every other
  filter. Collapse is driven solely by the dedicated caret control.
- **Search overrides collapse.** When the in-filter search box has a non-empty
  query, the grouped view narrows to matching categories/types. Categories must
  force-expand while a query is active so matches are never hidden behind a
  collapsed header. The persisted collapse state is not mutated by this — it is
  only visually overridden. Effective expanded state =
  `!isCollapsed(category) || Boolean(query)`.

## Testing

- **Item 1:** unit test on `FilterTypeFileTypes` asserting the singular message
  with one selected project and the plural message with two or more, while the
  legacy-index overlay is shown.
- **Item 2:** assert the `contentTypeCategory` filter definition exposes the
  `files` icon (and that the breadcrumb renders it). Update the existing
  `IPhStack` assertion.
- **Item 3:**
  - `useContentTypeCategoryCollapse`: defaults to collapsed, toggling persists
    the expanded key, re-reading reflects persisted state.
  - `ContentTypesCategoryName`: caret toggles the `collapse` model without
    emitting a selection change; checkbox toggles selection without changing
    collapse.
  - `FilterTypeFileTypes` (grouped): categories render collapsed by default;
    expanding via the caret reveals entries; state survives a remount with the
    same Pinia settings; a non-empty query force-expands matching categories
    without mutating the persisted collapse state.

## Out of scope

- Subset-aware ("some" vs "all") wording for the fallback message — explicitly
  decided count-based.
- Persisting the grouped/flat view toggle or the section-level collapse (no
  change to current behavior).
- Any change to `useContentTypeCategoryAvailability`.
