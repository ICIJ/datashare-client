# Finalize the Advanced Search modal (make it usable)

- **Date:** 2026-06-08
- **Status:** Approved (design)
- **Area:** Search toolbar / advanced search

## Goal

The Advanced Search modal and its Lucene query generate/parse logic are built
and unit-tested but unreachable in the running app — the toggle button that
opens the modal is commented out in `SearchToolbar.vue`. This change makes the
feature reachable and verifies the end-to-end flow works when driven through
the UI.

## Background

The work to date has been UI-component-level and proven in isolation:

- `src/components/Search/SearchAdvancedModal/SearchAdvancedModal.vue` — the full
  modal (any/all/exact/none words, single/multi wildcards, fuzzy, proximity,
  field selection), with Storybook stories and unit tests.
- `src/utils/luceneQuery.js` — `generateLuceneQuery` / `parseLuceneQuery`
  round-trip, recently hardened (escaped wildcards, asymmetric field rejection,
  grammar screening, fidelity checks).
- `src/composables/useAdvancedSearchForm.js` — form state and the
  all-vs-individual-fields mutual-exclusion rules.
- Pre-populating the form from the active query on open is done.

The modal is already mounted in `SearchToolbar.vue` and its `@search` handler is
wired:

```
function handleAdvancedSearch(queryString) {
  if (queryString) {
    searchStore.query(queryString)
  }
}
```

The only missing piece is the toggle button, commented out in commit
`308ac4ac4` ("style(SearchToolbar): disable and comment out advanced search
toggle button") with no stated reason — most likely because the feature was not
finished at the time. It now is.

## Scope (what changes)

1. **`src/components/Search/SearchToolbar/SearchToolbar.vue`** — uncomment:
   - the `ButtonToggleAdvancedSearch` import (currently line 4);
   - the `<button-toggle-advanced-search>` block (currently lines 85–88) inside
     `search-toolbar__form`, restoring its original placement between the
     search bar and the settings toggle.

   It binds `v-model:active="showAdvancedSearch"`, the same ref already driving
   the modal's `v-model`.

## Out of scope (YAGNI)

- No wiring of the button's `saved` / `loading` props — they stay at their
  defaults; the button only opens the modal.
- No removal or refactor of those props (that was the rejected option B).
- No persistent "advanced search active" indicator (rejected option C).
- No changes to `luceneQuery.js`, `useAdvancedSearchForm.js`, or the modal
  internals — they are complete.

## Data flow (already in place; this change closes the loop)

```
click toggle
  → showAdvancedSearch = true
  → modal opens, pre-populates from searchStore.q (parseLuceneQuery)
  → user fills form, submits
  → modal emits search(query)  [generateLuceneQuery(toQueryShape(form))]
  → handleAdvancedSearch calls searchStore.query(queryString)
  → setQuery + refresh
  → q updates → search bar reflects it
  → next open re-populates from the new q
```

`searchStore.query(value)` (src/store/modules/search.js) accepts a string,
calls `setQuery(value)`, and returns `refresh()`. Because `q` feeds both the
search bar and the modal's `initial-query` prop, the round-trip is
self-consistent with no extra wiring.

## Verification

1. **New component test** `tests/unit/specs/components/Search/SearchToolbar/SearchToolbar.spec.js`
   (none exists today):
   - the toggle button renders;
   - clicking it sets `showAdvancedSearch` / opens the modal;
   - the modal's `search` event triggers `searchStore.query` with the emitted
     string;
   - the empty / disabled-state path does not call `query`.
2. **Manual check in the running app** — open the modal, build a query, confirm
   results refresh and the search bar shows the generated Lucene string;
   re-open and confirm the form pre-populates from it.
3. **Regression** — run the existing advanced-search unit suites
   (`tests/unit/specs/utils/luceneQuery.spec.js`,
   `tests/unit/specs/components/Search/SearchAdvancedModal/SearchAdvancedModal.spec.js`,
   `tests/unit/specs/composables/useAdvancedSearchForm.spec.js`). These are
   ES-free and run in the sandbox.

## Risks

- The button was commented out with a bare `style(...)` message and no stated
  reason — likely just "feature not finished yet," now resolved. If re-enabling
  surfaces a layout issue in the toolbar (compact breakpoint, wrapping), that is
  a small CSS fix within `SearchToolbar`'s existing compact handling
  (`useCompact`, `search-toolbar--compact`).
