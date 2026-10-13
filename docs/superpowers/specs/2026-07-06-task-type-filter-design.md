# Task type filter — design

Date: 2026-07-06

## Context

The task list pages (Batch Search, Batch Download, Documents, Entities) filter
tasks by passing an array of fully-qualified task class names to `TaskPage`. The
store joins those names with `|` and sends them as the `name` query param, which
the backend interprets as a regular expression matched against `task.name`.

Datashare server PR [#2252](https://github.com/ICIJ/datashare/pull/2252) (merged
2026-07-06) adds a first-class `type` filter to `GET /api/task`:

- Values are `TaskType` enum names, joined with `|`, matched case-insensitively:
  `?type=scan|index`.
- One type can cover several class names. `BATCH_SEARCH` matches both
  `BatchSearchRunner` and `BatchSearchRunnerProxy` server-side.
- An unknown type returns `400 Bad Request`.
- The same filter builder (`taskFiltersFromContext`) backs `/api/task/stop` and
  `/api/task/clean`, so `type` works for those endpoints too.

This design replaces the frontend class-name regex with the `type` filter.

## Decisions

- **Clean swap, no fallback.** The client always ships against a server that
  supports `type`. The class-name regex path is deleted, not retained as a
  fallback for older servers.
- **New `TASK_TYPE` enum.** Filtering uses the backend's type vocabulary. The
  existing `TASK_NAME` enum and all display code (icons, human-readable names)
  stay untouched, since they are keyed on the class name the API returns in
  `task.name`.
- **`TaskPage` prop renamed** `taskFilter` → `taskTypes`, and the plumbing param
  renamed `names` → `types` end to end.

## Type mapping

| Page           | Old class-name filter                     | New `TASK_TYPE`                       |
|----------------|-------------------------------------------|---------------------------------------|
| Batch Search   | `BATCH_SEARCH`, `BATCH_SEARCH_PROXY`      | `BATCH_SEARCH`                        |
| Batch Download | `BATCH_DOWNLOAD`                          | `BATCH_DOWNLOAD`                      |
| Documents      | `INDEX`, `SCAN`                           | `INDEX`, `SCAN`                       |
| Entities       | `EXTRACT_NLP`, `ENQUEUE_FROM_INDEX`       | `EXTRACT_NLP`, `ENQUEUE_FROM_INDEX`   |

The Batch Search page collapses from two entries to one: `BATCH_SEARCH` covers
the proxy server-side.

## Changes

### New file: `src/enums/taskTypes.js`

Export a frozen `TASK_TYPE` object with the enum names the UI needs
(`BATCH_SEARCH`, `BATCH_DOWNLOAD`, `INDEX`, `SCAN`, `EXTRACT_NLP`,
`ENQUEUE_FROM_INDEX`), a `TASK_TYPE_LIST`, and a `taskTypeValidator`. Names match
the backend `TaskType` enum exactly.

### `src/api/index.js`

`getTasks`, `stopPendingTasks`, `removeDoneTasks` accept a `type` param (a
`|`-joined string) and forward it in `params`. The `name` param is dropped from
these three methods: nothing else passes it (the search box uses
`args.batchRecord.name`), so it was only ever carrying the class-name regex.

### `src/store/modules/task.js`

`fetchTasks`, `stopPendingTasks`, `removeDoneTasks` take `types = []` and build
`type: types.join('|')`. The `const name = names.join('|')` lines are removed.

### `src/composables/useTaskPolling.js`

Rename the `names` option to `types`; forward it to the store methods as `types`.
The separate `args.batchRecord.name` search filter (driven by `searchQuery`) is
unchanged.

### `src/views/Task/TaskPage.vue`

Rename the `taskFilter` prop to `taskTypes`; pass it to `useTaskPolling` as
`types`.

### Four list views

Swap the class-name arrays for `TASK_TYPE` arrays and update the prop name:

- `TaskBatchSearch/TaskBatchSearchList.vue`: `:task-types="[TASK_TYPE.BATCH_SEARCH]"`
- `TaskBatchDownload/TaskBatchDownloadList.vue`: `:task-types="[TASK_TYPE.BATCH_DOWNLOAD]"`
- `TaskDocuments/TaskDocumentsList.vue`: `:task-types="[TASK_TYPE.INDEX, TASK_TYPE.SCAN]"`
- `TaskEntities/TaskEntitiesList.vue`: `:task-types="[TASK_TYPE.EXTRACT_NLP, TASK_TYPE.ENQUEUE_FROM_INDEX]"`

### Unchanged

`TASK_NAME`, `TASK_NAME_ICON`, `HUMAN_TASK_NAME`, `getTaskName`,
`getHumanTaskName`, and every component that renders a task's name or icon. These
consume `task.name` (the class name) from API responses, which is still returned.

## Testing

- `tests/unit/specs/api/index.spec.js`: assert `type` is sent (not `name`) for the
  three methods.
- `tests/unit/specs/store/modules/task.spec.js`: assert `types.join('|')` becomes
  the `type` param.
- `tests/unit/specs/composables/useTaskPolling.spec.js`: update the `names` →
  `types` option; the `args.batchRecord.name` search-filter assertions are
  unchanged.
- `tests/unit/specs/components/Task/TaskEntities/TaskEntitiesList.spec.js`: its
  `getTasks` mock currently destructures `{ name }` and splits it to synthesize
  rows. Rewrite it to read `type`, split on `|`, and map each `TASK_TYPE` back to
  a representative class name for `task.name` (`EXTRACT_NLP` →
  `...ExtractNlpTask`, `ENQUEUE_FROM_INDEX` → `...EnqueueFromIndexTask`) so the
  two rows still render and icons/human names resolve. Update the
  `toBeCalledWith` assertion to expect `type: 'EXTRACT_NLP|ENQUEUE_FROM_INDEX'`.
- Verify each list view still shows only its own task types against a
  `type`-aware server.

## Out of scope

- Exposing the broader `TaskType` set now available (e.g. `SCAN_INDEX`,
  `BATCH_NLP`, `DEDUPLICATE`). Page behavior stays identical to today.
- Any fallback for servers predating #2252.
