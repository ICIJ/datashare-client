# Persist the file-type filter's categories-view toggle

## Problem

The "file type" filter can switch between a flat list and a grouped
categories view via a toggle button (`ButtonToggleContentTypesView`). That
toggle state lives in `FilterTypeFileTypes.vue` as a local
`defineModel('grouped', { default: false })` that no parent binds, so it
resets to the flat view on every remount — page reload, navigation away and
back, etc. Users who prefer the categories view must re-enable it constantly.

The per-category collapse state in the same filter is already persisted via
`useContentTypeCategoryCollapse` (stored under the `search` settings view).
The grouped/flat preference should be persisted the same way.

## Goal

Persist the grouped (categories) vs flat (list) view preference for the file
type filter so it survives reloads and navigation. Persistence is **global**
(one preference shared across all projects), matching the existing
`expandedContentTypeCategories` setting.

## Approach

Mirror the established `useContentTypeCategoryCollapse` pattern: a small
composable owns the persisted preference and exposes it as a writable value;
the component consumes that instead of holding local state.

### New composable — `src/composables/useContentTypeGroupedView.js`

- Single responsibility: own the persisted grouped/flat view preference.
- Depends only on `useAppStore`.
- Reads `appStore.getSettings('search', 'groupedContentTypeView') ?? false`.
- Returns a writable `computed` `grouped` (boolean). Its setter calls
  `appStore.setSettings('search', 'groupedContentTypeView', value)`.

```js
import { computed } from 'vue'
import { useAppStore } from '@/store/modules'

const SETTINGS_VIEW = 'search'
const SETTINGS_NAME = 'groupedContentTypeView'

/**
 * Persisted grouped (categories) vs flat (list) view preference for the
 * file-types filter. Flat is the default. Stored globally under the `search`
 * settings view, mirroring useContentTypeCategoryCollapse.
 *
 * @returns {import('vue').WritableComputedRef<boolean>}
 */
export function useContentTypeGroupedView() {
  const appStore = useAppStore()
  return computed({
    get: () => appStore.getSettings(SETTINGS_VIEW, SETTINGS_NAME) ?? false,
    set: value => appStore.setSettings(SETTINGS_VIEW, SETTINGS_NAME, value)
  })
}
```

### Default setting — `src/store/modules/app.js`

Add `groupedContentTypeView: false` to `SETTINGS.views.search`, alongside
`expandedContentTypeCategories`.

No `SETTINGS_VERSION` bump: the `?? false` fallback in the composable handles
already-persisted state that lacks the key, so existing users keep defaulting
to the flat view. The default in `SETTINGS` documents the shape and seeds
fresh installs.

### Component — `src/components/Filter/FilterType/FilterTypeFileTypes.vue`

- Replace line 30,
  `const grouped = defineModel('grouped', { type: Boolean, default: false })`,
  with `const grouped = useContentTypeGroupedView()` (plus the import).
- The `grouped` model/prop is removed from the component's public API.
- Template is unchanged: `v-model:grouped="grouped"` on the toggle button and
  `v-if="grouped"` both operate on the writable computed.

## Data flow

```
toggle button click
  → writable computed setter
  → appStore.setSettings('search', 'groupedContentTypeView', value)
  → Pinia persist plugin
  → localStorage
```

On remount the composable reads the persisted value via `getSettings`, so the
selected view is restored.

## Out of scope / unchanged

- Legacy-index handling (`overlayVisible`) is untouched. A persisted
  `grouped = true` opening on a legacy project still shows the existing
  explanatory overlay.
- Per-category collapse persistence is unchanged.
- No per-project persistence (explicitly decided global).

## Testing

**New — `tests/unit/specs/composables/useContentTypeGroupedView.spec.js`**
(mirrors `useContentTypeCategoryCollapse.spec.js`):

- defaults to `false` (flat view) with no persisted state,
- setting the value to `true` persists it to
  `search.groupedContentTypeView`,
- reflects pre-existing persisted state on read,
- toggling back to `false` persists `false`.

**Update — `tests/unit/specs/components/Filter/FilterType/FilterTypeFileTypes.spec.js`:**

- Tests that currently pass `grouped` as a prop instead seed the preference
  with `useAppStore().setSettings('search', 'groupedContentTypeView', true)`.
- Reset the setting to `false` in `beforeEach` (as the collapse setting is
  reset), so tests start from the flat-view baseline regardless of order.
