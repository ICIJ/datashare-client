# File type categories filter improvements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship three minor improvements to the file type categories filter — a plural legacy-index fallback message for multi-project searches, the `files` icon in the breadcrumb, and collapsed-by-default, persisted collapsible categories.

**Architecture:** All changes are scoped to existing Vue 3 `<script setup>` components, the filter definition registry, the i18n bundles, the app-settings store, plus one new small composable for collapse persistence. No new architectural patterns are introduced; we reuse the existing `appStore.getSettings/setSettings('search', …)` mechanism and the `ButtonIcon` caret pattern.

**Tech Stack:** Vue 3 (Composition API, `<script setup>`), Pinia, vue-i18n, bootstrap-vue-next (`<b-collapse>`), `@icij/murmur-next` (`ButtonIcon`), `unplugin-icons` (`~icons/ph/*`), Vitest + @vue/test-utils.

**Spec:** `docs/superpowers/specs/2026-06-08-file-type-categories-filter-improvements-design.md`

---

## File Structure

**Item 1 — plural fallback message**
- Modify: `src/lang/en.json` (+ `de.json`, `es.json`, `fr.json`, `ja.json`, `zh.json`, `ach.json`) — add `filter.fileTypes.legacyIndex.descriptionPlural`
- Modify: `src/components/Filter/FilterType/FilterTypeFileTypes.vue` — count-based description
- Test: `tests/unit/specs/components/Filter/FilterType/FilterTypeFileTypes.spec.js`

**Item 2 — `files` breadcrumb icon**
- Modify: `src/store/filters/index.js` — swap `IPhStack` → `IPhFiles` on `contentTypeCategory`
- Test: `tests/unit/specs/store/filters/FilterContentTypeCategory.spec.js`

**Item 3 — collapsible categories**
- Modify: `src/store/modules/app.js` — add `expandedContentTypeCategories: []` default
- Create: `src/composables/useContentTypeCategoryCollapse.js`
- Test: `tests/unit/specs/composables/useContentTypeCategoryCollapse.spec.js`
- Modify: `src/components/ContentTypes/ContentTypesCategories/ContentTypesCategoryName.vue` — caret toggler + `collapse` model
- Test: `tests/unit/specs/components/ContentTypes/ContentTypesCategories/ContentTypesCategoryName.spec.js`
- Modify: `src/components/Filter/FilterType/FilterTypeFileTypes.vue` — wire collapse + `<b-collapse>`
- Test: `tests/unit/specs/components/Filter/FilterType/FilterTypeFileTypes.spec.js`

---

## Task 1: Plural legacy-index fallback message (i18n)

**Files:**
- Modify: `src/lang/en.json` (around the `filter.fileTypes.legacyIndex` block)
- Modify: `src/lang/de.json`, `src/lang/es.json`, `src/lang/fr.json`, `src/lang/ja.json`, `src/lang/zh.json`, `src/lang/ach.json`

- [ ] **Step 1: Add the English plural string**

In `src/lang/en.json`, find:

```json
    "fileTypes": {
      "legacyIndex": {
        "title": "Category grouping unavailable",
        "description": "This project was indexed without file type categories."
      }
    },
```

Replace with:

```json
    "fileTypes": {
      "legacyIndex": {
        "title": "Category grouping unavailable",
        "description": "This project was indexed without file type categories.",
        "descriptionPlural": "Some of these projects were indexed without file type categories."
      }
    },
```

- [ ] **Step 2: Seed the other six locales**

For each of `de.json`, `es.json`, `fr.json`, `ja.json`, `zh.json`, `ach.json`: locate the same `fileTypes.legacyIndex` object and add a `descriptionPlural` sibling. Seed it with the English string `"Some of these projects were indexed without file type categories."` (placeholder for translators), preserving each file's existing `title`/`description` values and key order.

Run to find the exact location in each file:

```bash
grep -n "legacyIndex" src/lang/*.json
```

- [ ] **Step 3: Verify the JSON is valid**

Run:

```bash
node -e "for (const f of ['en','de','es','fr','ja','zh','ach']) { const j = require('./src/lang/'+f+'.json'); if (!j.filter.fileTypes.legacyIndex.descriptionPlural) throw new Error('missing in '+f); } console.log('OK')"
```

Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add src/lang/*.json
git commit -m "i18n(fileTypes): add plural legacy-index fallback message"
```

---

## Task 2: Count-based description in FilterTypeFileTypes

**Files:**
- Modify: `src/components/Filter/FilterType/FilterTypeFileTypes.vue`
- Test: `tests/unit/specs/components/Filter/FilterType/FilterTypeFileTypes.spec.js`

- [ ] **Step 1: Write the failing tests**

Add a new `describe` block at the end of the existing `describe('FilterTypeFileTypes.vue', …)` in `tests/unit/specs/components/Filter/FilterType/FilterTypeFileTypes.spec.js`. It reuses the existing `remountWithAvailability` helper defined inside the `legacy-index overlay` describe — so place this block **inside** that same `describe('legacy-index overlay', …)`, after the last test:

```js
    it('shows the singular legacy-index message when a single project is selected', () => {
      searchStore.setIndices([index])
      remountWithAvailability({ isAvailable: false, isLoading: false })
      const text = wrapper.find('.filter-type-file-types__legacy-index__description').text()
      expect(text).toBe('This project was indexed without file type categories.')
    })

    it('shows the plural legacy-index message when several projects are selected', () => {
      searchStore.setIndices([index, `${index}-second`])
      remountWithAvailability({ isAvailable: false, isLoading: false })
      const text = wrapper.find('.filter-type-file-types__legacy-index__description').text()
      expect(text).toBe('Some of these projects were indexed without file type categories.')
    })
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```bash
yarn test:unit tests/unit/specs/components/Filter/FilterType/FilterTypeFileTypes.spec.js -t "legacy-index message"
```

Expected: the plural test FAILS (renders the singular string); the singular test PASSES.

- [ ] **Step 3: Implement the count-based description**

In `src/components/Filter/FilterType/FilterTypeFileTypes.vue`:

Add the search store import alongside the existing imports (after the `useSearchFilter` import line):

```js
import { useSearchStore } from '@/store/modules'
```

After the existing `const filterRef = toRef(props, 'filter')` line, add:

```js
const searchStore = useSearchStore.inject()
const legacyIndexDescription = computed(() => {
  const key = searchStore.indices.length > 1
    ? 'filter.fileTypes.legacyIndex.descriptionPlural'
    : 'filter.fileTypes.legacyIndex.description'
  return t(key)
})
```

In the `<template>`, replace:

```vue
        <p class="filter-type-file-types__legacy-index__description small mb-0">
          {{ t('filter.fileTypes.legacyIndex.description') }}
        </p>
```

with:

```vue
        <p class="filter-type-file-types__legacy-index__description small mb-0">
          {{ legacyIndexDescription }}
        </p>
```

- [ ] **Step 4: Run the tests to verify they pass**

Run:

```bash
yarn test:unit tests/unit/specs/components/Filter/FilterType/FilterTypeFileTypes.spec.js -t "legacy-index"
```

Expected: all legacy-index tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Filter/FilterType/FilterTypeFileTypes.vue tests/unit/specs/components/Filter/FilterType/FilterTypeFileTypes.spec.js
git commit -m "feat(fileTypes): use plural fallback message for multi-project searches"
```

---

## Task 3: `files` icon for the contentTypeCategory filter

**Files:**
- Modify: `src/store/filters/index.js`
- Test: `tests/unit/specs/store/filters/FilterContentTypeCategory.spec.js`

- [ ] **Step 1: Write the failing test**

Add this `describe` block inside `describe('FilterContentTypeCategory.js', …)` in `tests/unit/specs/store/filters/FilterContentTypeCategory.spec.js`. Add the import at the top of the file with the other imports:

```js
import IPhFiles from '~icons/ph/files'
import filtersDefs from '@/store/filters'
```

Then add the block:

```js
  describe('breadcrumb icon', () => {
    it('uses the files icon so the breadcrumb chip reads as file types', () => {
      const def = filtersDefs.find(d => d.options.name === 'contentTypeCategory')
      expect(def.options.icon).toBe(IPhFiles)
    })
  })
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
yarn test:unit tests/unit/specs/store/filters/FilterContentTypeCategory.spec.js -t "breadcrumb icon"
```

Expected: FAIL — the icon is currently `IPhStack`, not `IPhFiles`.

- [ ] **Step 3: Swap the icon in the filter registry**

In `src/store/filters/index.js`:

Replace the import line:

```js
import IPhStack from '~icons/ph/stack'
```

with:

```js
import IPhFiles from '~icons/ph/files'
```

On the `contentTypeCategory` filter definition, replace:

```js
      icon: markRaw(IPhStack),
```

with:

```js
      icon: markRaw(IPhFiles),
```

Note: `markRaw(IPhFiles)` and the test's bare `IPhFiles` compare equal — `markRaw` returns the same object reference, it does not wrap it.

- [ ] **Step 4: Verify `IPhStack` is no longer imported**

Run:

```bash
grep -n "IPhStack\|ph/stack" src/store/filters/index.js || echo "no stray IPhStack"
```

Expected: `no stray IPhStack` (removing the only usage avoids an unused-import lint error).

- [ ] **Step 5: Run the test to verify it passes**

Run:

```bash
yarn test:unit tests/unit/specs/store/filters/FilterContentTypeCategory.spec.js -t "breadcrumb icon"
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/store/filters/index.js tests/unit/specs/store/filters/FilterContentTypeCategory.spec.js
git commit -m "feat(filters): use files icon for the contentTypeCategory breadcrumb chip"
```

---

## Task 4: Persisted setting default for expanded categories

**Files:**
- Modify: `src/store/modules/app.js`
- Test: `tests/unit/specs/composables/useContentTypeCategoryCollapse.spec.js` (created in Task 5; this task only adds the default)

- [ ] **Step 1: Add the setting default**

In `src/store/modules/app.js`, inside `SETTINGS.views.search`, add the `expandedContentTypeCategories` key. Find:

```js
        search: {
          layout: LAYOUTS.LIST,
          orderBy: ['_score', 'desc'],
          perPage: '25',
          properties: ['title', 'thumbnail', 'highlights', 'project'],
          searchOperator: SEARCH_OPERATORS.OR
        },
```

Replace with:

```js
        search: {
          layout: LAYOUTS.LIST,
          orderBy: ['_score', 'desc'],
          perPage: '25',
          properties: ['title', 'thumbnail', 'highlights', 'project'],
          searchOperator: SEARCH_OPERATORS.OR,
          expandedContentTypeCategories: []
        },
```

- [ ] **Step 2: Verify the default is readable**

Run:

```bash
yarn test:unit tests/unit/specs/store/modules/app.spec.js 2>/dev/null | tail -5 || echo "no app spec — default added structurally"
```

Expected: existing app-store tests still pass (or the file does not exist — the default is verified via Task 5).

- [ ] **Step 3: Commit**

```bash
git add src/store/modules/app.js
git commit -m "feat(settings): add expandedContentTypeCategories search setting default"
```

---

## Task 5: `useContentTypeCategoryCollapse` composable

**Files:**
- Create: `src/composables/useContentTypeCategoryCollapse.js`
- Test: `tests/unit/specs/composables/useContentTypeCategoryCollapse.spec.js`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/specs/composables/useContentTypeCategoryCollapse.spec.js`:

```js
import { createApp } from 'vue'

import CoreSetup from '~tests/unit/CoreSetup'
import { useContentTypeCategoryCollapse } from '@/composables/useContentTypeCategoryCollapse'
import { useAppStore } from '@/store/modules'

describe('useContentTypeCategoryCollapse', () => {
  // Mount the composable inside a throwaway app so inject()/Pinia work.
  function withSetup(plugins) {
    let result
    const app = createApp({
      setup() {
        result = useContentTypeCategoryCollapse()
        return {}
      }
    })
    plugins.forEach(plugin => app.use(plugin))
    app.mount(document.createElement('div'))
    return result
  }

  let core

  beforeEach(() => {
    core = CoreSetup.init().useAll()
  })

  it('reports every category as collapsed by default', () => {
    const { isCollapsed } = withSetup(core.plugins)
    expect(isCollapsed('DOCUMENT')).toBe(true)
    expect(isCollapsed('AUDIO')).toBe(true)
  })

  it('expands a category when toggleCollapse is called with false', () => {
    const { isCollapsed, toggleCollapse } = withSetup(core.plugins)
    toggleCollapse('DOCUMENT', false)
    expect(isCollapsed('DOCUMENT')).toBe(false)
    expect(isCollapsed('AUDIO')).toBe(true)
  })

  it('re-collapses an expanded category when toggleCollapse is called with true', () => {
    const { isCollapsed, toggleCollapse } = withSetup(core.plugins)
    toggleCollapse('DOCUMENT', false)
    toggleCollapse('DOCUMENT', true)
    expect(isCollapsed('DOCUMENT')).toBe(true)
  })

  it('persists the expanded keys to the search settings', () => {
    const { toggleCollapse } = withSetup(core.plugins)
    toggleCollapse('DOCUMENT', false)
    const appStore = useAppStore()
    expect(appStore.getSettings('search', 'expandedContentTypeCategories')).toContain('DOCUMENT')
  })

  it('reflects pre-existing persisted expanded state', () => {
    const appStore = useAppStore()
    appStore.setSettings('search', 'expandedContentTypeCategories', ['AUDIO'])
    const { isCollapsed } = withSetup(core.plugins)
    expect(isCollapsed('AUDIO')).toBe(false)
    expect(isCollapsed('DOCUMENT')).toBe(true)
  })

  it('does not add a duplicate key when expanding an already-expanded category', () => {
    const { toggleCollapse } = withSetup(core.plugins)
    toggleCollapse('DOCUMENT', false)
    toggleCollapse('DOCUMENT', false)
    const appStore = useAppStore()
    const expanded = appStore.getSettings('search', 'expandedContentTypeCategories')
    expect(expanded.filter(key => key === 'DOCUMENT')).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
yarn test:unit tests/unit/specs/composables/useContentTypeCategoryCollapse.spec.js
```

Expected: FAIL — module `@/composables/useContentTypeCategoryCollapse` does not exist.

- [ ] **Step 3: Implement the composable**

Create `src/composables/useContentTypeCategoryCollapse.js`:

```js
import { computed } from 'vue'
import { without } from 'lodash'

import { useAppStore } from '@/store/modules'

const SETTINGS_VIEW = 'search'
const SETTINGS_NAME = 'expandedContentTypeCategories'

/**
 * Per-category collapse state for the grouped file-types filter.
 *
 * Categories are collapsed by default. The persisted setting stores the
 * EXPANDED category keys (not the collapsed ones) so the empty default matches
 * the collapsed-by-default behavior and existing users need no migration.
 *
 * @returns {{
 *   isCollapsed: (category: string) => boolean,
 *   toggleCollapse: (category: string, collapsed: boolean) => void
 * }}
 */
export function useContentTypeCategoryCollapse() {
  const appStore = useAppStore()

  const expanded = computed(() => appStore.getSettings(SETTINGS_VIEW, SETTINGS_NAME) ?? [])

  const isCollapsed = category => !expanded.value.includes(category)

  const toggleCollapse = (category, collapsed) => {
    const current = expanded.value
    const next = collapsed
      ? without(current, category)
      : current.includes(category) ? current : [...current, category]
    appStore.setSettings(SETTINGS_VIEW, SETTINGS_NAME, next)
  }

  return { isCollapsed, toggleCollapse }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run:

```bash
yarn test:unit tests/unit/specs/composables/useContentTypeCategoryCollapse.spec.js
```

Expected: all 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/composables/useContentTypeCategoryCollapse.js tests/unit/specs/composables/useContentTypeCategoryCollapse.spec.js
git commit -m "feat(fileTypes): add useContentTypeCategoryCollapse composable"
```

---

## Task 6: Caret toggler in ContentTypesCategoryName

**Files:**
- Modify: `src/components/ContentTypes/ContentTypesCategories/ContentTypesCategoryName.vue`
- Test (create): `tests/unit/specs/components/ContentTypes/ContentTypesCategories/ContentTypesCategoryName.spec.js`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/specs/components/ContentTypes/ContentTypesCategories/ContentTypesCategoryName.spec.js`:

```js
import { mount } from '@vue/test-utils'
import { ButtonIcon } from '@icij/murmur-next'

import CoreSetup from '~tests/unit/CoreSetup'
import ContentTypesCategoryName from '@/components/ContentTypes/ContentTypesCategories/ContentTypesCategoryName'
import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'

describe('ContentTypesCategoryName.vue', () => {
  let core

  const factory = (props = {}) => {
    core = CoreSetup.init().useAll()
    return mount(ContentTypesCategoryName, {
      global: { plugins: core.plugins },
      props: { category: 'DOCUMENT', count: 3, ...props }
    })
  }

  it('renders a caret toggler button', () => {
    const wrapper = factory({ collapse: true })
    expect(wrapper.findComponent(ButtonIcon).exists()).toBe(true)
  })

  it('emits update:collapse with the inverted value when the caret is clicked', async () => {
    const wrapper = factory({ collapse: true })
    await wrapper.findComponent(ButtonIcon).trigger('click')
    expect(wrapper.emitted('update:collapse')).toStrictEqual([[false]])
  })

  it('emits update:modelValue (selection) without touching collapse when the checkbox changes', async () => {
    const wrapper = factory({ collapse: true, modelValue: false })
    const entry = wrapper.findComponent(FiltersPanelSectionFilterEntry)
    entry.vm.$emit('update:modelValue', true)
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')).toStrictEqual([[true]])
    expect(wrapper.emitted('update:collapse')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
yarn test:unit tests/unit/specs/components/ContentTypes/ContentTypesCategories/ContentTypesCategoryName.spec.js
```

Expected: FAIL — no `ButtonIcon` is rendered yet.

- [ ] **Step 3: Add the caret toggler to the component**

Replace the entire contents of `src/components/ContentTypes/ContentTypesCategories/ContentTypesCategoryName.vue` with:

```vue
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import IPhCaretRight from '~icons/ph/caret-right'
import IPhCaretDown from '~icons/ph/caret-down'

import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'
import { useContentTypeCategoryLabel } from '@/composables/useContentTypeCategoryLabel'

const modelValue = defineModel({ type: Boolean, default: false })
const collapse = defineModel('collapse', { type: Boolean, default: true })

const props = defineProps({
  category: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  },
  indeterminate: {
    type: Boolean
  }
})

const { t } = useI18n()
const categoryLabel = useContentTypeCategoryLabel()
const resolvedLabel = computed(() => categoryLabel(props.category))
const collapseIcon = computed(() => (collapse.value ? IPhCaretRight : IPhCaretDown))
</script>

<template>
  <div class="content-types-category-name d-flex align-items-center">
    <button-icon
      class="content-types-category-name__toggler"
      variant="link"
      size="sm"
      :icon-left="collapseIcon"
      icon-left-weight="bold"
      :label="t('filtersPanelSectionFilterTitleToggler.toggle')"
      hide-label
      hide-tooltip
      @click="collapse = !collapse"
    />
    <filters-panel-section-filter-entry
      v-model="modelValue"
      class="content-types-category-name__entry flex-grow-1"
      :label="resolvedLabel"
      :count="count"
      :indeterminate="indeterminate"
    />
  </div>
</template>

<style lang="scss" scoped>
.content-types-category-name {
  &__entry {
    min-width: 0;
  }
}
</style>
```

- [ ] **Step 4: Run the test to verify it passes**

Run:

```bash
yarn test:unit tests/unit/specs/components/ContentTypes/ContentTypesCategories/ContentTypesCategoryName.spec.js
```

Expected: all 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ContentTypes/ContentTypesCategories/ContentTypesCategoryName.vue tests/unit/specs/components/ContentTypes/ContentTypesCategories/ContentTypesCategoryName.spec.js
git commit -m "feat(fileTypes): add collapse caret to category name row"
```

---

## Task 7: Wire collapse into the grouped file-types view

**Files:**
- Modify: `src/components/Filter/FilterType/FilterTypeFileTypes.vue`
- Test: `tests/unit/specs/components/Filter/FilterType/FilterTypeFileTypes.spec.js`

- [ ] **Step 1: Write the failing tests**

Add this `describe` block inside the top-level `describe('FilterTypeFileTypes.vue', …)` in `tests/unit/specs/components/Filter/FilterType/FilterTypeFileTypes.spec.js`. It uses the file's existing `seedContentTypes`, `mountFactory`/mount pattern and `useSearchStore` — mirror the existing grouped tests (around the `'renders category groups…'` test) for how the wrapper is mounted and aggregated. Use the existing helper that the grouped tests use to populate buckets and force grouped mode:

```js
  describe('collapsible categories', () => {
    // Reuses the grouped-view mount used by the existing
    // 'renders category groups when entries are aggregated in grouped mode'
    // test: mount with grouped:true, seed content types, run aggregation.
    const mountGrouped = async (contentTypes) => {
      seedContentTypes(contentTypes)
      const filter = searchStore.getFilter({ name: 'contentType' })
      wrapper = mount(FilterTypeFileTypes, {
        global: { plugins: core.plugins },
        props: { filter, collapse: false, grouped: true }
      })
      await flushPromises()
      await wrapper.findComponent(FilterType).vm.aggregateOver?.()
      await flushPromises()
      return wrapper
    }

    it('hides category entries by default (collapsed)', async () => {
      await mountGrouped(['application/pdf', 'image/png'])
      // Entries live inside a b-collapse that is not shown when collapsed.
      const openCollapses = wrapper.findAll('.collapse.show')
      expect(openCollapses).toHaveLength(0)
      expect(wrapper.findComponent(ContentTypesEntry).exists()).toBe(false)
    })

    it('reveals a category\'s entries after its caret is toggled', async () => {
      await mountGrouped(['application/pdf'])
      const categoryName = wrapper.findComponent(ContentTypesCategoryName)
      categoryName.vm.$emit('update:collapse', false)
      await flushPromises()
      expect(wrapper.findComponent(ContentTypesEntry).exists()).toBe(true)
    })

    it('force-expands categories while a search query is active', async () => {
      await mountGrouped(['application/pdf'])
      // Drive the in-filter search query so matches must be visible.
      wrapper.findComponent(FilterType).vm.$emit('update:query', 'pdf')
      await flushPromises()
      expect(wrapper.findComponent(ContentTypesEntry).exists()).toBe(true)
    })
  })
```

> Note for the implementer: if the existing grouped tests use a different mount/aggregate helper than the `mountGrouped` sketch above, reuse **that** helper verbatim and keep only the three `it(...)` assertions. The assertions are the contract; the mount mechanics must match the file's established pattern.

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```bash
yarn test:unit tests/unit/specs/components/Filter/FilterType/FilterTypeFileTypes.spec.js -t "collapsible categories"
```

Expected: FAIL — entries currently render unconditionally (no collapse, no b-collapse wrapper).

- [ ] **Step 3: Wire the composable and b-collapse**

In `src/components/Filter/FilterType/FilterTypeFileTypes.vue`:

Add the import with the other composable imports:

```js
import { useContentTypeCategoryCollapse } from '@/composables/useContentTypeCategoryCollapse'
```

In `<script setup>`, after the existing `useContentTypeSort(...)` destructure block, add:

```js
const { isCollapsed, toggleCollapse } = useContentTypeCategoryCollapse()

// Search overrides collapse: a non-empty query narrows the grouped view, so
// matching categories must force-expand without mutating persisted state.
const isCategoryExpanded = category => !isCollapsed(category) || Boolean(query.value)
```

In the `<template>`, replace the grouped block:

```vue
          <content-types-category
            v-for="[category, types] in sortedCategoryEntries"
            :key="category"
          >
            <content-types-category-name
              :category="category"
              :count="categoryCount(types)"
              :model-value="categoryAllSelected(category, types)"
              :indeterminate="categoryIndeterminate(category, types)"
              @update:model-value="toggleCategory(category, types, $event)"
            />
            <content-types-entry
              v-for="contentType in sortedTypesFor(visibleTypesFor(category, types))"
              :key="contentType"
              :content-type="contentType"
              :count="entryCount(contentType)"
              :model-value="isEntrySelected(contentType)"
              @update:model-value="toggleEntry(contentType, $event)"
            />
          </content-types-category>
```

with:

```vue
          <content-types-category
            v-for="[category, types] in sortedCategoryEntries"
            :key="category"
          >
            <content-types-category-name
              :category="category"
              :count="categoryCount(types)"
              :model-value="categoryAllSelected(category, types)"
              :indeterminate="categoryIndeterminate(category, types)"
              :collapse="!isCategoryExpanded(category)"
              @update:model-value="toggleCategory(category, types, $event)"
              @update:collapse="toggleCollapse(category, $event)"
            />
            <b-collapse :model-value="isCategoryExpanded(category)">
              <content-types-entry
                v-for="contentType in sortedTypesFor(visibleTypesFor(category, types))"
                :key="contentType"
                :content-type="contentType"
                :count="entryCount(contentType)"
                :model-value="isEntrySelected(contentType)"
                @update:model-value="toggleEntry(contentType, $event)"
              />
            </b-collapse>
          </content-types-category>
```

Notes:
- `:collapse` is the visual collapse state passed to the caret (`true` = collapsed). Search-forced expansion flows through `isCategoryExpanded`, so the caret shows expanded while a query is active.
- `@update:collapse="toggleCollapse(category, $event)"` — the child emits the new collapse value (`true`/`false`); the composable maps it to add/remove from the persisted expanded set. While a query is active the persisted state is still toggled by an explicit caret click, but the visual state stays expanded until the query clears, which is acceptable.

- [ ] **Step 4: Run the tests to verify they pass**

Run:

```bash
yarn test:unit tests/unit/specs/components/Filter/FilterType/FilterTypeFileTypes.spec.js -t "collapsible categories"
```

Expected: all 3 tests PASS.

- [ ] **Step 5: Run the full file-types spec to check for regressions**

Run:

```bash
yarn test:unit tests/unit/specs/components/Filter/FilterType/FilterTypeFileTypes.spec.js
```

Expected: all tests PASS. If any pre-existing grouped test asserted that entries render immediately in grouped mode, update it to first expand the category (emit `update:collapse` `false` on the `ContentTypesCategoryName`, or set a persisted expanded value via `appStore.setSettings('search', 'expandedContentTypeCategories', [...])` before mounting) — the new default is collapsed.

- [ ] **Step 6: Commit**

```bash
git add src/components/Filter/FilterType/FilterTypeFileTypes.vue tests/unit/specs/components/Filter/FilterType/FilterTypeFileTypes.spec.js
git commit -m "feat(fileTypes): collapse categories by default with persisted state"
```

---

## Task 8: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the complete unit suite**

Run:

```bash
yarn test:unit
```

Expected: PASS. Pay attention to `SearchBreadcrumbForm*`, `FilterContentTypeCategory`, `FilterTypeFileTypes`, and any snapshot referencing the `contentTypeCategory` icon — update snapshots only if the sole diff is the `IPhStack` → `IPhFiles` icon.

- [ ] **Step 2: Lint the modified files**

Run:

```bash
yarn lint:modified
```

Expected: no errors. (Confirms no unused `IPhStack` import remains and the new files conform.)

- [ ] **Step 3: Final review commit (if lint auto-fixed anything)**

```bash
git add -A
git commit -m "chore(fileTypes): lint fixes for category filter improvements" || echo "nothing to commit"
```

---

## Self-Review Notes

- **Spec coverage:** Item 1 → Tasks 1–2; Item 2 → Task 3; Item 3 → Tasks 4–7; verification → Task 8. The search-overrides-collapse interaction note in the spec → Task 7 Step 1 (third test) and Step 3 (`isCategoryExpanded`).
- **Type/name consistency:** `useContentTypeCategoryCollapse` exposes `isCollapsed` / `toggleCollapse` — used identically in Tasks 5, 6 (model semantics), and 7. Setting key `expandedContentTypeCategories` is identical across Tasks 4, 5, 7. The component model is `collapse` (Boolean, default `true`) in Tasks 6 and 7.
- **No placeholders:** every code step contains complete code. The only deferred-to-implementer item is matching the existing grouped-test mount helper in Task 7 Step 1, which is explicitly flagged with the contract (assertions) spelled out.
