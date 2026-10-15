# Batch Search Edit Breadcrumb Name Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Batch Search Edit page breadcrumb read `Tasks › Batch searches › ‹name› › Edit`, where ‹name› is the batch search's name (matching the sibling Queries/Results pages).

**Architecture:** The Edit view (`TaskBatchSearchEdit.vue`) fetches the batch search via `core.api.getBatchSearch(uuid)`, declares an explicit `breadcrumbRoutes` array, and overrides the `#entry-label(task.batch-search-queries.list)` slot on `<page-header>` to render the name (with an `app-spinner` while loading). This mirrors `TaskBatchSearchQueryList.vue`. No other files change.

**Tech Stack:** Vue 3 (`<script setup>`), Vue Router, Vitest + @vue/test-utils, CoreSetup test harness.

---

## File Structure

- **Modify:** `src/views/Task/TaskBatchSearch/TaskBatchSearchEdit.vue` — fetch the batch search, declare breadcrumb routes, render the name slot.
- **Create:** `tests/unit/specs/views/Task/TaskBatchSearch/TaskBatchSearchEdit.spec.js` — view test asserting the breadcrumb shows the name.

The current `TaskBatchSearchEdit.vue` (for reference):

```vue
<script setup>
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import TaskBatchSearchFormEdit from '@/components/Task/TaskBatchSearch/TaskBatchSearchFormEdit'

defineProps({
  indices: {
    type: String,
    required: true
  },
  uuid: {
    type: String,
    required: true
  }
})
</script>

<template>
  <page-header no-toggle-settings />
  <page-container fluid>
    <task-batch-search-form-edit
      :indices="indices"
      :uuid="uuid"
    />
  </page-container>
</template>
```

---

## Task 1: Edit view fetches the batch search and shows its name in the breadcrumb

**Files:**
- Modify: `src/views/Task/TaskBatchSearch/TaskBatchSearchEdit.vue`
- Test: `tests/unit/specs/views/Task/TaskBatchSearch/TaskBatchSearchEdit.spec.js`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/specs/views/Task/TaskBatchSearch/TaskBatchSearchEdit.spec.js`:

```js
import { flushPromises, mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import TaskBatchSearchEdit from '@/views/Task/TaskBatchSearch/TaskBatchSearchEdit'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: {
    getBatchSearch: vi.fn(),
    updateBatchSearch: vi.fn()
  }
}))

describe('TaskBatchSearchEdit', () => {
  let plugins
  let router

  beforeEach(async () => {
    vi.clearAllMocks()
    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    plugins = core.plugins
    router = core.router
    core.config.set('projects', [{ name: 'local-datashare' }])
    api.getBatchSearch.mockResolvedValue({
      uuid: 'uuid-1',
      name: 'My batch',
      description: 'A description',
      published: true,
      projects: ['local-datashare']
    })
    // The breadcrumb resolves sibling routes (queries list) by name and
    // inherits the indices/uuid params from the current route, so we must be
    // on the edit route before mounting.
    await router.push({
      name: 'task.batch-search.edit',
      params: { indices: 'local-datashare', uuid: 'uuid-1' }
    })
    await router.isReady()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  async function mountEdit() {
    const wrapper = mount(TaskBatchSearchEdit, {
      global: { plugins },
      props: { indices: 'local-datashare', uuid: 'uuid-1' }
    })
    await flushPromises()
    return wrapper
  }

  it('fetches the batch search on mount', async () => {
    await mountEdit()
    expect(api.getBatchSearch).toHaveBeenCalledWith('uuid-1')
  })

  it('renders the batch search name in the breadcrumb', async () => {
    const wrapper = await mountEdit()
    expect(wrapper.find('.navigation-breadcrumb').text()).toContain('My batch')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn test:unit tests/unit/specs/views/Task/TaskBatchSearch/TaskBatchSearchEdit.spec.js`
Expected: FAIL — `getBatchSearch` is never called (the view does not fetch yet) and the breadcrumb text does not contain `My batch`.

- [ ] **Step 3: Implement the view changes**

Replace the entire contents of `src/views/Task/TaskBatchSearch/TaskBatchSearchEdit.vue` with:

```vue
<script setup>
import { onBeforeMount, ref } from 'vue'

import AppSpinner from '@/components/AppSpinner/AppSpinner'
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import TaskBatchSearchFormEdit from '@/components/Task/TaskBatchSearch/TaskBatchSearchFormEdit'
import { useCore } from '@/composables/useCore'

const { indices, uuid } = defineProps({
  indices: {
    type: String,
    required: true
  },
  uuid: {
    type: String,
    required: true
  }
})

const core = useCore()
const batchSearch = ref(null)

const breadcrumbRoutes = [
  { name: 'task' },
  { name: 'task.batch-search.list' },
  { name: 'task.batch-search-queries.list' },
  { name: 'task.batch-search.edit' }
]

async function fetchBatchSearch() {
  batchSearch.value = await core.api.getBatchSearch(uuid)
}

onBeforeMount(fetchBatchSearch)
</script>

<template>
  <!-- eslint-disable vue/valid-v-slot -->
  <page-header
    no-toggle-settings
    :breadcrumb-routes="breadcrumbRoutes"
  >
    <template #entry-label(task.batch-search-queries.list)>
      <template v-if="batchSearch">
        {{ batchSearch.name }}
      </template>
      <app-spinner v-else />
    </template>
  </page-header>
  <page-container fluid>
    <task-batch-search-form-edit
      :indices="indices"
      :uuid="uuid"
    />
  </page-container>
</template>
```

Notes:
- `indices` is still passed to the form even though the script destructures props; destructured prop access (`indices`, `uuid`) is reactive in Vue 3.5+ and matches the pattern already used in `TaskBatchSearchFormEdit.vue`.
- `core.api` is the same instance as `@/api/apiInstance`, so the test's mock applies.

- [ ] **Step 4: Run the test to verify it passes**

Run: `yarn test:unit tests/unit/specs/views/Task/TaskBatchSearch/TaskBatchSearchEdit.spec.js`
Expected: PASS (both tests green).

- [ ] **Step 5: Run lint on the changed files**

Run: `yarn lint src/views/Task/TaskBatchSearch/TaskBatchSearchEdit.vue tests/unit/specs/views/Task/TaskBatchSearch/TaskBatchSearchEdit.spec.js`
Expected: no errors (`yarn lint` runs `eslint`; add `--fix` only if you want autofix).

- [ ] **Step 6: Commit**

```bash
git add src/views/Task/TaskBatchSearch/TaskBatchSearchEdit.vue tests/unit/specs/views/Task/TaskBatchSearch/TaskBatchSearchEdit.spec.js
git commit -m "feat(batch-search): show batch search name in edit breadcrumb"
```

---

## Self-Review

**Spec coverage:**
- Breadcrumb shape `Tasks › Batch searches › ‹name› › Edit` → Task 1 (`breadcrumbRoutes` array + name slot; `task.batch-search.list` is filtered out by `breadcrumb: false`, `task.batch-search.edit` resolves its own title leaf). ✓
- ‹name› links to queries list → the overridden entry is the `task.batch-search-queries.list` route, which links there with inherited params. ✓
- Spinner while loading → `<app-spinner v-else />`. ✓
- Independent fetch, form untouched → view adds its own `fetchBatchSearch`; `TaskBatchSearchFormEdit` unchanged. ✓
- No router changes, `core.pageTitle` untouched → confirmed, not modified. ✓
- Test asserting the name renders → Task 1 view spec. ✓

**Placeholder scan:** No TBD/TODO; all code blocks complete. ✓

**Type/name consistency:** `breadcrumbRoutes`, `batchSearch`, `fetchBatchSearch` used consistently; route names match `src/router/index.js` (`task`, `task.batch-search.list`, `task.batch-search-queries.list`, `task.batch-search.edit`); slot name `entry-label(task.batch-search-queries.list)` matches `TaskBatchSearchQueryList.vue`. ✓
