# Batch Search Edit breadcrumb shows the batch search name

## Problem

The Batch Search **Edit** page renders a bare `<page-header no-toggle-settings />`, so its
breadcrumb falls back to the route hierarchy's static titles:

```
Tasks › Batch searches › Edit
```

The sibling sub-pages (Queries list, Query results) instead show the batch search's **name** in
the breadcrumb. The Edit page should be consistent with them.

## Goal

Make the Edit breadcrumb read:

```
Tasks › Batch searches › ‹name› › Edit
```

where ‹name› links to the batch search's queries list (matching the sibling pages) and **Edit** is
the final, active leaf.

## How the existing pattern works

- `NavigationBreadcrumb` builds breadcrumb entries from either the route's matched chain or an
  explicit `routes` array. Each entry is rendered by `NavigationBreadcrumbLink`, which resolves its
  label from the route's `meta.title` via `DisplayRoute`.
- An entry's label can be overridden with the `#entry-label(<routeName>)` slot on `<page-header>`.
- The sibling views (`TaskBatchSearchQueryList`, `TaskBatchSearchQueryResultList`) fetch the record
  with `core.api.getBatchSearch(uuid)` and override the
  `#entry-label(task.batch-search-queries.list)` slot to render `batchSearch.name`, showing an
  `app-spinner` while loading.
- Bare `{ name }` route objects resolve correctly because the required `indices`/`uuid` params are
  inherited from the current route (the Edit route carries the same params).

## Design

The change is confined to a single file:
`src/views/Task/TaskBatchSearch/TaskBatchSearchEdit.vue`.

1. **Fetch the batch search name.** In `<script setup>`, add a `batchSearch` ref and an
   `onBeforeMount` hook that calls `core.api.getBatchSearch(uuid)` (via `useCore`). This is an
   independent fetch from the one inside `TaskBatchSearchFormEdit`: the view owns the breadcrumb,
   the form owns the form fields. The minor duplicate request keeps the two components decoupled and
   matches the existing "page view owns its breadcrumb" pattern.

2. **Declare explicit `breadcrumbRoutes`:**

   ```js
   const breadcrumbRoutes = [
     { name: 'task' },
     { name: 'task.batch-search.list' },
     { name: 'task.batch-search-queries.list' },
     { name: 'task.batch-search.edit' }
   ]
   ```

   `task.batch-search.list` has `breadcrumb: false` and is filtered out by `NavigationBreadcrumb`; it
   is included to mirror the sibling pages' arrays. The `task.batch-search.edit` entry resolves its
   own `task.batch-search.edit.title` label automatically, so it needs no slot.

3. **Wire up `<page-header>`** with the existing `no-toggle-settings`, the new
   `:breadcrumb-routes`, and the name slot (mirroring `TaskBatchSearchQueryList`):

   ```html
   <page-header no-toggle-settings :breadcrumb-routes="breadcrumbRoutes">
     <template #entry-label(task.batch-search-queries.list)>
       <template v-if="batchSearch">{{ batchSearch.name }}</template>
       <app-spinner v-else />
     </template>
   </page-header>
   ```

## Out of scope

- `TaskBatchSearchFormEdit` is untouched (it keeps its own `load()` for the form fields).
- No router changes.
- `core.pageTitle` (document/tab title) is not changed — the request is specifically the breadcrumb.
- No unrelated refactoring.

## Testing

There is currently no unit test for the `TaskBatchSearchEdit` view (only for
`TaskBatchSearchFormEdit`). Add a view test that mounts `TaskBatchSearchEdit`, stubs
`core.api.getBatchSearch` to return a known name, and asserts the breadcrumb renders that name in the
`task.batch-search-queries.list` slot. Match the mounting/stubbing conventions used by the existing
`tests/unit/specs/views/Task/TaskBatchSearch/TaskBatchSearchList.spec.js` and the sibling view tests.
