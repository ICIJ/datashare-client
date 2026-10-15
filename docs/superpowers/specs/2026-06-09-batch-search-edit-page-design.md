# Batch search edit page — design

**Date:** 2026-06-09
**Status:** Approved (design), pending implementation
**Scope:** Add a page to edit an existing batch search. Visibility-only for now; title and description are shown but disabled until the backend supports editing them.

## Background

Datashare lets users create a batch search through a multi-step form
(`TaskBatchSearchForm.vue`, view `TaskBatchSearchNew.vue`). There is no edit
page. A stubbed edit path exists — `BatchSearchActionsEditModal.vue` plus a
hidden `BatchSearchActionsEdit` button in `BatchSearchActions.vue` whose handler
is `console.log('Not implemented yet')` — but it is non-functional and unused.

### Backend constraint (datashare 21.7.0)

Verified against the 21.7.0 OpenAPI spec and `BatchSearchResource.java`:

| Endpoint | Behaviour | Fields honoured |
|---|---|---|
| `PATCH /api/batch/search/{id}` (`updateBatch`) | In-place update, owner-only (404 otherwise) | **`published` only** — `name`/`description` are ignored |
| `POST /api/task/batchSearch/copy/{id}` (`copySearch`) | Creates a **new** batch search (a copy) and re-runs it | `name`, `description` |

`updateBatch` calls `batchSearchRepository.publish(user, batchId, published)`.
It does **not** persist name or description. Therefore the title and description
of an existing batch search **cannot be edited in place** at this version.

### Decision

Build the full edit page now, but make **only visibility editable**. Title and
description render (pre-filled, for context) in a **disabled** state. When the
backend later persists name/description, we flip the disabled flags off and pass
those values to the save call — no structural change required.

## Goals

- A dedicated, page-based UI to edit a batch search (not a modal).
- Edit visibility (Private / Shared, i.e. `published`) in place.
- Show title and description disabled, ready to enable when the backend supports them.
- Reuse the creation form's "General details" field component as the single source of truth.

## Non-goals

- Editing projects, queries, operators, or filters.
- Any backend changes (tracked separately; this spec assumes 21.7.0 behaviour).
- Editing title/description (blocked on backend; the UI is built ready for it).

## Approach

Reuse `TaskBatchSearchFormDetails.vue` (the creation form's general-details
step) by adding additive, default-off props that disable individual fields. A
new lean edit form component and view host it. Save goes through a new task-store
wrapper around the existing API method.

## Changes

### 1. API / store

- **API** (`src/api/index.js`): no change. `updateBatchSearch(batchId, published)`
  already issues `PATCH /api/batch/search/{batchId}` with `{ data: { published } }`.
- **Store** (`src/store/modules/task.js`): add and export an `updateBatchSearch(id, published)`
  wrapper, mirroring the existing `relaunchBatchSearch` wrapper:
  ```js
  const updateBatchSearch = async (id, published) => {
    await api.updateBatchSearch(id, published)
  }
  ```

### 2. Routing

Add a child route under `task.batch-search` in `src/router/index.js`:

```js
{
  path: ':indices/:uuid/edit',
  name: 'task.batch-search.edit',
  props: true,
  component: () => import('@/views/Task/TaskBatchSearch/TaskBatchSearchEdit'),
  meta: { title: 'task.batch-search.edit.title' }
}
```

The static `edit` segment outranks the existing `:indices/:uuid/:query` dynamic
route in Vue Router, so there is no matching conflict.

### 3. Entry point & cleanup (`BatchSearchActions.vue`)

- Remove `v-if="false"` on `<batch-search-actions-edit>` so the Edit button shows.
- Change its handler from the stubbed `editPromptModal()` to a router push to
  `task.batch-search.edit`, passing `indices` and `uuid` derived from the
  `batchSearch` prop.
- Delete the now-dead code: the `BatchSearchActionsEditModal` import, the
  `usePromptModal(BatchSearchActionsEditModal)` wiring, and the `edit()` /
  `editPromptModal()` functions.
- Delete the component file
  `src/components/BatchSearch/BatchSearchActions/BatchSearchActionsEditModal.vue`.

### 4. `TaskBatchSearchFormDetails.vue` — additive disable props

Add four optional props, all defaulting to `false` (so the creation form is
unaffected):

| Prop | Effect |
|---|---|
| `disabledName` | binds `:disabled` on the name `b-form-input` |
| `disabledDescription` | binds `:disabled` on the description `b-form-textarea` |
| `disabledProjects` | binds `:disabled` on `ProjectDropdownSelector` (already supports it) |
| `hideVisibilityHint` | on the visibility `FormFieldsetI18n`, bind `:description-key="hideVisibilityHint ? '' : undefined"` |

`hideVisibilityHint` suppresses the "This option can be changed later (either way)"
line (i18n key `task.batch-search.form.visibility.description`). Passing an empty
string makes `te('')` return `false`, so `FormFieldsetI18n` renders no
description; `undefined` falls back to the default key (creation-form behaviour).
Visibility itself is always editable.

### 5. New components

**`src/components/Task/TaskBatchSearch/TaskBatchSearchFormEdit.vue`**

- Props: `indices` (String), `uuid` (String).
- On mount, fetches the batch via `core.api.getBatchSearch(uuid)` and seeds refs:
  `name`, `description`, `visibility` (from `published`), `selectedProjects`
  (from the batch's projects).
- Wraps `FormCreation` with a single `TaskBatchSearchFormDetails` step bound with
  `disabled-name`, `disabled-description`, `disabled-projects`, and
  `hide-visibility-hint` all set.
- `:valid` is always `true` (the visibility radio always holds a boolean).
- `@submit`: `await taskStore.updateBatchSearch(uuid, visibility)`, then
  `toast.success(t('task.batch-search.form.editSuccess'))` and
  `router.push({ name: 'task.batch-search-results.list', params: { indices, uuid } })`.
  On error: `toast.error(t('task.batch-search.form.editError'))`.
- `@reset`: restores the values fetched on mount.

**`src/views/Task/TaskBatchSearch/TaskBatchSearchEdit.vue`**

Mirrors `TaskBatchSearchNew.vue`: `PageHeader` + `PageContainer` hosting
`<task-batch-search-form-edit :indices="indices" :uuid="uuid" />`. Receives
`indices` / `uuid` as route props.

### 6. i18n

Add to each locale file (`en`, `de`, `ja`, `zh`) alongside existing
`task.batch-search.*` keys:

- `task.batch-search.edit.title` — page/breadcrumb title (e.g. "Edit batch search").
- `task.batch-search.form.editSuccess` — e.g. "Batch search updated successfully."
- `task.batch-search.form.editError` — e.g. "Something went wrong, unable to update the batch search."

The Edit button label reuses the existing `buttonRowAction.edit` key.

## Testing

Vitest, `shallowMount`, `CoreSetup.init().useAll().useRouterWithoutGuards()`,
following existing batch-search specs.

1. **`TaskBatchSearchFormDetails.spec`** (extend): each `disabled*` prop disables
   the corresponding input; defaults leave inputs enabled; `hideVisibilityHint`
   suppresses the visibility description while leaving the radios enabled.
2. **`TaskBatchSearchFormEdit.spec`** (new): pre-fills from a mocked
   `getBatchSearch`; submit calls `taskStore.updateBatchSearch(uuid, visibility)`
   and shows the success toast; error path shows the error toast; reset restores
   fetched values.
3. **`BatchSearchActions.spec`** (extend): the Edit button is visible and
   navigates to `task.batch-search.edit` with the right params; the modal path is
   gone.

## Future work

When the backend extends `updateBatch` (or a new endpoint) to persist `name` and
`description`:

- Drop `disabled-name` / `disabled-description` on the edit form.
- Extend `api.updateBatchSearch` and the store wrapper to send `name` and
  `description`, and include them in the form's submit call.
