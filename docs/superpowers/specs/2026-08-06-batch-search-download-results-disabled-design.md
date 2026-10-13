# Failed batch searches with results must allow downloading them

## Problem

When a batch search fails after having saved some results, the "Download results (CSV)"
button on the batch search card is disabled. The results exist in the database and the
CSV endpoint serves them, so the button should be enabled.

## Root cause

The button is not state-driven. `BatchSearchCardDetails.vue:148` binds
`:disabled="hasNoResults"`, and `hasNoResults` is `nbResults === 0`
(`BatchSearchCardDetails.vue:65`). The bug is that `nbResults` is computed as `0` for a
failed batch search.

`TaskBatchSearch/TaskBatchSearchQueryList.vue:93-94` builds the card's `batchSearch`
object by spreading the record fetched from `GET /api/batch/search/:uuid` and then
overriding the counts with the *task* result:

```js
nbResults: task.result?.value.nbResults ?? 0,
nbQueriesWithoutResults: task.result?.value.nbQueriesWithoutResults ?? 0,
```

That override lands on `0` in two distinct shapes:

1. **Live failed task.** The runner throws, so the task carries `error` and no `result`,
   and `?? 0` applies.
2. **Task no longer held by the task manager.** The backend synthesizes a task from the
   DB record with `TaskResult<Integer>(nbResults)` (`datashare`,
   `datashare-app/src/main/java/org/icij/datashare/tasks/TaskFinder.java:117`), so
   `result.value` is a bare integer and `result.value.nbResults` is `undefined`. This
   path is broken for *successful* searches too, once the task ages out of the manager.

The count is already available and correct on the record: `nbResults` maps to
`BATCH_SEARCH.BATCH_RESULTS`
(`datashare-db/src/main/java/org/icij/datashare/db/JooqBatchSearchRepository.java:534`),
which is incremented for every saved batch of documents while the search runs
(`JooqBatchSearchRepository.java:97`). A search that failed halfway therefore reports
exactly what it managed to save, which is exactly what
`GET /api/batch/search/result/csv/:uuid` returns. `nbQueriesWithoutResults` is likewise
decremented live at `JooqBatchSearchRepository.java:98`.

The same 0-instead-of-real-count affects the Documents column of the batch search list
(`TaskBatchSearchList.vue:39-41`), which reads the same two broken task-result shapes.

## Design

### Change 1: fall back to the record in the query list view

`src/views/Task/TaskBatchSearch/TaskBatchSearchQueryList.vue`, in `fetchBatchSearch()`:

```js
const taskResult = task.result?.value

batchSearch.value = {
  ...batchSearchRecord,
  nbResults: taskResult?.nbResults ?? batchSearchRecord.nbResults ?? 0,
  nbQueriesWithoutResults: taskResult?.nbQueriesWithoutResults ?? batchSearchRecord.nbQueriesWithoutResults ?? 0,
  userId: task?.args?.user?.id,
  state: task.state,
  errorMessage: batchSearchRecord.errorMessage ?? task.error?.message ?? null,
  errorQuery: batchSearchRecord.errorQuery ?? null
}
```

The task result keeps priority when it has the object shape; otherwise the record's own
counts are used. Extracting `taskResult` also removes the latent `TypeError` in
`task.result?.value.nbResults`, where the optional chain guards `result` but not
`result.value`.

This single change re-enables the download button and fixes the "0 documents" entry on
the same card.

### Change 2: last-resort count in the list view

`src/views/Task/TaskBatchSearch/TaskBatchSearchList.vue`:

```js
function getBatchSearchResult(item, defaultValue = 0) {
  return get(item, 'result.value.nbResults', get(item, 'result.value', get(item, 'args.batchRecord.nbResults', defaultValue)))
}
```

**Correction found while implementing: this fallback is a no-op against today's
backend.** `TaskFinder.findVisibleTasksFor` synthesizes a task per batch search record
and `taskify` sets `result` to `TaskResult<Integer>(nbResults)`
(`TaskFinder.java:107-118`), so record-derived rows already resolve through the
`result.value`-as-number branch. Manager-held tasks win the dedup
(`TaskFinder.java:59-67`), and their `args.batchRecord` is the snapshot serialized at
task creation (`TaskResource.java:290`) whose `nbResults` is `0`. So every shape that
reaches the new third branch carries `0` anyway.

The consequence: the list column shows `0` for a failed batch search only while its task
is still held by the task manager, and self-heals to the real count once the task ages
out. Closing that window needs a per-row record fetch, which was explicitly rejected as
too costly. The fallback is kept as a guard for the "no result, fresh record" shape, and
it is covered by a test, but it changes nothing today.

### Not changing: BatchSearchCardDetails.vue

`disabled = nbResults === 0` is the correct rule once the count is accurate. A batch
search that failed before saving anything genuinely has no results and would download an
empty CSV, so it stays disabled. No `state`-based special case is added.

## Behavior changes

Every change in behavior this diff introduces:

1. Failed batch search with saved results: download button becomes enabled; the card
   shows the real document count instead of 0. **This is the fix.**
2. Successful batch search whose task has left the task manager: the card now shows the
   real count instead of 0, and the download button becomes enabled. Pre-existing bug,
   fixed by the same line.
3. Batch search list, Documents column: no observable change against today's backend,
   see the correction under Change 2.
4. **`nbQueriesWithoutResults === -1` reaches the card.** The record uses `-1` to mean
   "never computed" (`JooqBatchSearchRepository.java:523`). Today the missing task value
   collapses to `0`, which disables the small "Download no-match queries" button. After
   the fix, `-1` makes `hasNoQueriesWithoutResults` false, so that button becomes
   enabled and shows the generic label (`hasQueriesWithoutResultsNumber` is already
   false for `-1`, so no "-1 queries" text is ever rendered). Accepted: `-1` means
   unknown, not zero, and the queries CSV endpoint works regardless.
5. No change for a running or successful batch search whose task is still managed: the
   task result has the object shape and keeps priority.

## Testing

TDD, failing output shown before any production change.

`tests/unit/specs/views/Task/TaskBatchSearch/TaskBatchSearchList.spec.js` (extend the
existing `apiInstance.getTasks` fixture):

- A `FAILURE` task with `result: null` and `args.batchRecord.nbResults: 5` renders `5`
  in the Documents column.

`tests/unit/specs/views/Task/TaskBatchSearch/TaskBatchSearchQueryList.spec.js` (new;
mock `@/api/apiInstance` for `getBatchSearch` and the task fetch, following the style of
`TaskBatchSearchList.spec.js`):

- Failed task, no `result`, record `nbResults: 2` → card shows 2 documents and the
  download button is not disabled.
- Task with integer `result: { value: 7 }` and record `nbResults: 7` → card shows 7 and
  the button is enabled.
- Successful live task with `result: { value: { nbResults: 3 } }` and a stale record
  count → the task value (3) wins.
- Failed task with record `nbResults: 0` → button stays disabled.

## Out of scope

- Making the list Documents column accurate for live failed tasks (needs a per-row
  record fetch).
- Any backend change. The API already exposes everything needed.
