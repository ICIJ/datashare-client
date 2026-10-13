# Task Type Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the frontend's class-name regex task filter with the backend's first-class `type` filter (`GET /api/task?type=scan|index`).

**Architecture:** Introduce a `TASK_TYPE` enum mirroring the backend `TaskType` names. Thread a `types` array from each task list view → `TaskPage` (`taskTypes` prop) → `useTaskPolling` → the task store → the API layer, which sends a `|`-joined `type` query param. Delete the old `name`-from-classnames regex path. Display code (icons, human-readable names) is untouched because it keys off `task.name` returned by the API.

**Tech Stack:** Vue 3 (`<script setup>`), Pinia, Vitest, Vue Test Utils, axios.

## Global Constraints

- **Clean swap, no fallback.** Client always ships against a `type`-aware server. Do not retain the class-name regex as a fallback.
- **Never send an empty `type`.** axios sends empty strings verbatim (`type=`), and the backend rejects an empty/unknown type with `400`. When there are no types, send `type: null` (axios omits null params). Guard on `types.length`.
- **`TASK_TYPE` names must match the backend `TaskType` enum exactly** (uppercase, snake case): `BATCH_SEARCH`, `BATCH_DOWNLOAD`, `INDEX`, `SCAN`, `EXTRACT_NLP`, `ENQUEUE_FROM_INDEX`.
- **Do not touch `TASK_NAME`** (`src/enums/taskNames.js`) or any icon / human-name display code. It stays keyed on the class name the API returns.
- **No single-line `if` statements without braces** (project style).

---

### Task 1: `TASK_TYPE` enum

**Files:**
- Create: `src/enums/taskTypes.js`
- Test: `tests/unit/specs/enums/taskTypes.spec.js`

**Interfaces:**
- Produces: `TASK_TYPE` (frozen object), `TASK_TYPE_LIST` (array of values), `taskTypeValidator(v) => boolean`. Values: `BATCH_SEARCH='BATCH_SEARCH'`, `BATCH_DOWNLOAD='BATCH_DOWNLOAD'`, `INDEX='INDEX'`, `SCAN='SCAN'`, `EXTRACT_NLP='EXTRACT_NLP'`, `ENQUEUE_FROM_INDEX='ENQUEUE_FROM_INDEX'`.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/specs/enums/taskTypes.spec.js`:

```js
import { TASK_TYPE, TASK_TYPE_LIST, taskTypeValidator } from '@/enums/taskTypes'

describe('taskTypes enum', () => {
  it('exposes the backend TaskType names the UI needs', () => {
    expect(TASK_TYPE).toEqual({
      BATCH_SEARCH: 'BATCH_SEARCH',
      BATCH_DOWNLOAD: 'BATCH_DOWNLOAD',
      INDEX: 'INDEX',
      SCAN: 'SCAN',
      EXTRACT_NLP: 'EXTRACT_NLP',
      ENQUEUE_FROM_INDEX: 'ENQUEUE_FROM_INDEX'
    })
  })

  it('is frozen', () => {
    expect(Object.isFrozen(TASK_TYPE)).toBe(true)
  })

  it('lists all type values', () => {
    expect(TASK_TYPE_LIST).toEqual([
      'BATCH_SEARCH',
      'BATCH_DOWNLOAD',
      'INDEX',
      'SCAN',
      'EXTRACT_NLP',
      'ENQUEUE_FROM_INDEX'
    ])
  })

  it('validates known and unknown types', () => {
    expect(taskTypeValidator('SCAN')).toBe(true)
    expect(taskTypeValidator('NOPE')).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:unit tests/unit/specs/enums/taskTypes.spec.js`
Expected: FAIL — cannot resolve `@/enums/taskTypes`.

- [ ] **Step 3: Write minimal implementation**

Create `src/enums/taskTypes.js`:

```js
const BATCH_SEARCH = 'BATCH_SEARCH'
const BATCH_DOWNLOAD = 'BATCH_DOWNLOAD'
const INDEX = 'INDEX'
const SCAN = 'SCAN'
const EXTRACT_NLP = 'EXTRACT_NLP'
const ENQUEUE_FROM_INDEX = 'ENQUEUE_FROM_INDEX'

export const TASK_TYPE = Object.freeze({
  BATCH_SEARCH,
  BATCH_DOWNLOAD,
  INDEX,
  SCAN,
  EXTRACT_NLP,
  ENQUEUE_FROM_INDEX
})

export const TASK_TYPE_LIST = Object.values(TASK_TYPE)

export const taskTypeValidator = v => TASK_TYPE_LIST.includes(v)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test:unit tests/unit/specs/enums/taskTypes.spec.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/enums/taskTypes.js tests/unit/specs/enums/taskTypes.spec.js
git commit -m "feat(tasks): add TASK_TYPE enum mirroring backend TaskType"
```

---

### Task 2: API layer sends `type` instead of `name`

**Files:**
- Modify: `src/api/index.js:46-49` (`stopPendingTasks`), `:59-62` (`removeDoneTasks`), `:64-67` (`getTasks`)
- Test: `tests/unit/specs/api/index.spec.js:139-142` (`getTasks`)

**Interfaces:**
- Consumes: nothing new.
- Produces:
  - `getTasks({ type = null, from = 0, size = 10, order = 'asc', sort, ...filters })` → sends `params: { ...filters, type, from, size, order, sort }`.
  - `stopPendingTasks({ type = null, ...filters })` → PUT `/api/task/stop`, `params: { ...filters, type }`.
  - `removeDoneTasks({ type = null, ...filters })` → POST `/api/task/clean`, `params: { ...filters, type }`.
  - `name` is removed from all three signatures. axios omits `type: null`, so no filter param is sent when the caller passes null.

- [ ] **Step 1: Write the failing test**

Replace the `getTasks` test in `tests/unit/specs/api/index.spec.js` (currently lines 139-142) with:

```js
  it('should call getTasks with a type param and no name param', async () => {
    json = await api.getTasks({ type: 'SCAN|INDEX', from: 0, size: 10 })
    expect(axios.request).toBeCalledWith(
      expect.objectContaining({
        url: Api.getFullUrl('/api/task'),
        params: expect.objectContaining({ type: 'SCAN|INDEX' })
      })
    )
    const params = axios.request.mock.calls[0][0].params
    expect(params).not.toHaveProperty('name')
    expect(json).toEqual({})
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:unit tests/unit/specs/api/index.spec.js -t "getTasks with a type"`
Expected: FAIL — `params` contains `name`, not `type`.

- [ ] **Step 3: Write minimal implementation**

In `src/api/index.js`, change the three methods.

`stopPendingTasks` (lines 46-49):

```js
  stopPendingTasks({ type = null, ...filters } = {}) {
    const params = { ...filters, type }
    return this.sendAction('/api/task/stop', { method: Method.PUT, params })
  }
```

`removeDoneTasks` (lines 59-62):

```js
  removeDoneTasks({ type = null, ...filters } = {}) {
    const params = { ...filters, type }
    return this.sendAction('/api/task/clean', { method: Method.POST, params })
  }
```

`getTasks` (lines 64-67):

```js
  getTasks({ type = null, from = 0, size = 10, order = 'asc', sort, ...filters } = {}) {
    const params = { ...filters, type, from, size, order, sort }
    return this.sendAction('/api/task', { params })
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/api/index.spec.js`
Expected: PASS (all api tests, including the new getTasks assertion).

- [ ] **Step 5: Commit**

```bash
git add src/api/index.js tests/unit/specs/api/index.spec.js
git commit -m "feat(tasks): send type filter to task API endpoints"
```

---

### Task 3: Store threads `types` and builds the `type` param

**Files:**
- Modify: `src/store/modules/task.js:28-32` (`stopPendingTasks`), `:57-61` (`removeDoneTasks`), `:111-115` (`fetchTasks`)
- Test: `tests/unit/specs/store/modules/task.spec.js`

**Interfaces:**
- Consumes: `api.getTasks/stopPendingTasks/removeDoneTasks({ type, ...params })` from Task 2.
- Produces:
  - `store.fetchTasks({ types = [], ...params })` — calls `api.getTasks({ type, ...params })` where `type = types.length ? types.join('|') : null`.
  - `store.stopPendingTasks({ types = [], ...params })` and `store.removeDoneTasks({ types = [], ...params })` follow the same `type` construction.

- [ ] **Step 1: Write the failing test**

Add to `tests/unit/specs/store/modules/task.spec.js` inside the `describe('TaskStore', ...)` block:

```js
  it('should send a joined type param when fetching with types', async () => {
    await store.fetchTasks({ types: ['INDEX', 'SCAN'] })
    expect(api.getTasks).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'INDEX|SCAN' })
    )
  })

  it('should send type: null when fetching with no types', async () => {
    await store.fetchTasks()
    expect(api.getTasks).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: null })
    )
  })

  it('should send a joined type param when stopping pending tasks', async () => {
    await store.stopPendingTasks({ types: ['BATCH_SEARCH'] })
    expect(api.stopPendingTasks).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'BATCH_SEARCH' })
    )
  })

  it('should send a joined type param when removing done tasks', async () => {
    await store.removeDoneTasks({ types: ['BATCH_DOWNLOAD'] })
    expect(api.removeDoneTasks).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'BATCH_DOWNLOAD' })
    )
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:unit tests/unit/specs/store/modules/task.spec.js -t "type param"`
Expected: FAIL — store still calls the api with `name`, not `type`.

- [ ] **Step 3: Write minimal implementation**

In `src/store/modules/task.js`, replace the three `names.join('|')` methods.

`stopPendingTasks` (lines 28-32):

```js
  const stopPendingTasks = async ({ types = [], ...params } = {}) => {
    const type = types.length ? types.join('|') : null
    await api.stopPendingTasks({ type, ...params })
    setTasks(tasks.value.filter(({ id }) => isPending(id)))
  }
```

`removeDoneTasks` (lines 57-61):

```js
  const removeDoneTasks = async ({ types = [], ...params } = {}) => {
    const type = types.length ? types.join('|') : null
    await api.removeDoneTasks({ type, ...params })
    setTasks(tasks.value.filter(({ id }) => !isOver(id)))
  }
```

`fetchTasks` (lines 111-115):

```js
  const fetchTasks = async ({ types = [], ...params } = {}) => {
    const type = types.length ? types.join('|') : null
    const { items = [], pagination = DEFAULT_PAGINATION } = await api.getTasks({ type, ...params })
    return setTasks(items, pagination)
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/store/modules/task.spec.js`
Expected: PASS (existing tests plus the four new ones).

- [ ] **Step 5: Commit**

```bash
git add src/store/modules/task.js tests/unit/specs/store/modules/task.spec.js
git commit -m "feat(tasks): thread types through the task store"
```

---

### Task 4: `useTaskPolling` renames `names` → `types`

**Files:**
- Modify: `src/composables/useTaskPolling.js`
- Test: `tests/unit/specs/composables/useTaskPolling.spec.js`

**Interfaces:**
- Consumes: `store.fetchTasks/stopPendingTasks/removeDoneTasks({ types, ... })` from Task 3.
- Produces: `useTaskPolling({ types = [], sortBy = [], perPage = null, page = 1, searchQuery = null })`. Forwards `types` to the store methods as `types`. The `args.batchRecord.name` search filter (driven by `searchQuery`) is unchanged.

- [ ] **Step 1: Update the existing tests to the new option name (they will fail)**

In `tests/unit/specs/composables/useTaskPolling.spec.js`, replace every `names: [...]` option with `types: [...]`. Use type values so intent is clear. The three existing tests become (only the option line changes):

```js
    mountComposable({
      types: ['BATCH_SEARCH'],
      searchQuery,
      sortBy: ref(['createdAt', 'desc']),
      perPage: ref(10),
      page: ref(1)
    })
```

Then add a test asserting the type param reaches the api:

```js
  it('should forward types to the store as a joined type param', async () => {
    mountComposable({
      types: ['INDEX', 'SCAN'],
      searchQuery: ref(''),
      sortBy: ref(['createdAt', 'desc']),
      perPage: ref(10),
      page: ref(1)
    })
    await flushPromises()

    expect(api.getTasks).toHaveBeenCalled()
    const callArgs = api.getTasks.mock.calls[0][0]
    expect(callArgs.type).toBe('INDEX|SCAN')
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:unit tests/unit/specs/composables/useTaskPolling.spec.js`
Expected: FAIL — `useTaskPolling` still reads `names`, so `types` is ignored and `callArgs.type` is `null`.

- [ ] **Step 3: Write minimal implementation**

In `src/composables/useTaskPolling.js`:

Change the signature (line 8):

```js
export function useTaskPolling({ types = [], sortBy = [], perPage = null, page = 1, searchQuery = null } = {}) {
```

Change `stopPendingTasks` (lines 23-26):

```js
  async function stopPendingTasks() {
    await taskStore.stopPendingTasks({ types: toValue(types) })
    await fetchTasks()
  }
```

Change `removeDoneTasks` (lines 28-31):

```js
  async function removeDoneTasks() {
    await taskStore.removeDoneTasks({ types: toValue(types) })
    await fetchTasks()
  }
```

Change `fetchTasks` (line 36 inside the store call):

```js
    await taskStore.fetchTasks({
      types: toValue(types),
      sort: toValue(sortBy)?.[0],
      order: toValue(sortBy)?.[1] ?? 'asc',
      // Only include the search filter when query is non-empty to avoid
      // sending an invalid pattern to the backend (which treats it as regex)
      ...(query ? { 'args.batchRecord.name': query } : {}),
      // The tasks API endpoint has limited support for pagination so we get all tasks at once
      size: toValue(perPage),
      from: (toValue(page) - 1) * toValue(perPage)
    })
```

Change the watch source (line 60) from `names` to `types`:

```js
  watch(() => [types, sortBy, searchQuery, page, perPage], startPollingTasksWithLoader, { immediate: true, deep: true })
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/composables/useTaskPolling.spec.js`
Expected: PASS (three renamed tests plus the new forwarding test).

- [ ] **Step 5: Commit**

```bash
git add src/composables/useTaskPolling.js tests/unit/specs/composables/useTaskPolling.spec.js
git commit -m "feat(tasks): rename useTaskPolling names option to types"
```

---

### Task 5: `TaskPage` renames the `taskFilter` prop to `taskTypes`

**Files:**
- Modify: `src/views/Task/TaskPage.vue:13-17` (prop), `:46-47` (composable call)

**Interfaces:**
- Consumes: `useTaskPolling({ types })` from Task 4.
- Produces: `TaskPage` prop `taskTypes: { type: Array, default: () => [] }`, forwarded to `useTaskPolling` as `types: props.taskTypes`.

> Note: there is no dedicated `TaskPage.spec.js`; this task is validated by the list-view tests in Task 6 and the full suite. Its own step is the code change plus a compile/lint check.

- [ ] **Step 1: Rename the prop**

In `src/views/Task/TaskPage.vue`, replace the `taskFilter` prop (lines 14-17) with:

```js
  taskTypes: {
    type: Array,
    default: () => []
  },
```

- [ ] **Step 2: Update the composable call**

Change lines 46-47:

```js
const { noTasks, fetchTasks, hasPendingTasks, hasDoneTasks, stopPendingTasks, removeDoneTasks, isLoading }
  = useTaskPolling({ types: props.taskTypes, searchQuery, sortBy, page, perPage })
```

- [ ] **Step 3: Verify it compiles and lints**

Run: `yarn lint src/views/Task/TaskPage.vue`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/views/Task/TaskPage.vue
git commit -m "feat(tasks): rename TaskPage taskFilter prop to taskTypes"
```

---

### Task 6: List views pass `TASK_TYPE` values

**Files:**
- Modify: `src/views/Task/TaskBatchSearch/TaskBatchSearchList.vue:20,54`
- Modify: `src/views/Task/TaskBatchDownload/TaskBatchDownloadList.vue:21,53`
- Modify: `src/views/Task/TaskDocuments/TaskDocumentsList.vue:15,58`
- Modify: `src/views/Task/TaskEntities/TaskEntitiesList.vue:14,57`
- Test: `tests/unit/specs/components/Task/TaskEntities/TaskEntitiesList.spec.js`

**Interfaces:**
- Consumes: `TASK_TYPE` from Task 1; `TaskPage` `taskTypes` prop from Task 5.
- Produces: each view binds `:task-types="[...]"` with `TASK_TYPE` values.

Mapping:
- Batch Search: `[TASK_TYPE.BATCH_SEARCH]` (covers the proxy server-side).
- Batch Download: `[TASK_TYPE.BATCH_DOWNLOAD]`.
- Documents: `[TASK_TYPE.INDEX, TASK_TYPE.SCAN]`.
- Entities: `[TASK_TYPE.EXTRACT_NLP, TASK_TYPE.ENQUEUE_FROM_INDEX]`.

- [ ] **Step 1: Rewrite the failing `TaskEntitiesList` test**

The current mock destructures `{ name }` and splits it into class names. Rewrite it to read `type`, split on `|`, and map each `TASK_TYPE` back to a representative class name so rows still render and icons/human names resolve.

Replace the `beforeEach` mock implementation and the `renders correctly` assertion in `tests/unit/specs/components/Task/TaskEntities/TaskEntitiesList.spec.js`:

```js
  beforeEach(() => {
    const CLASS_NAME_BY_TYPE = {
      EXTRACT_NLP: 'org.icij.datashare.tasks.ExtractNlpTask',
      ENQUEUE_FROM_INDEX: 'org.icij.datashare.tasks.EnqueueFromIndexTask'
    }

    api.getTasks.mockImplementation(({ type }) => {
      const items = type.split('|').map((taskType) => {
        return {
          name: CLASS_NAME_BY_TYPE[taskType],
          id: '6a32bb59-8a23-491c-a441-8447ff7517dc',
          state: 'RUNNING',
          progress: 0,
          args: {
            defaultProject: 'local-datashare',
            nlpPipeline: 'EMAIL'
          },
          createdAt: new Date()
        }
      })

      return { items }
    })

    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    plugins = core.plugins
  })

  it('renders correctly', () => {
    const wrapper = mount(TaskEntitiesList, { global: { plugins } })
    expect(wrapper.exists()).toBe(true)
    expect(api.getTasks).toBeCalled()
    expect(api.getTasks).toBeCalledWith(
      expect.objectContaining({
        type: 'EXTRACT_NLP|ENQUEUE_FROM_INDEX'
      })
    )
  })
```

Leave the `should display 1 ExtractNlpTask and 1 EnqueueFromIndexTask task` and column tests unchanged.

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:unit tests/unit/specs/components/Task/TaskEntities/TaskEntitiesList.spec.js`
Expected: FAIL — the view still binds `:task-filter` with class names, so `getTasks` receives `name`, and `type` is `null` (the mock's `type.split` throws / assertion fails).

- [ ] **Step 3: Update the four list views**

`TaskEntities/TaskEntitiesList.vue` — change the import (line 14) and the binding (line 57):

```js
import { TASK_TYPE } from '@/enums/taskTypes'
```

```html
    :task-types="[TASK_TYPE.EXTRACT_NLP, TASK_TYPE.ENQUEUE_FROM_INDEX]"
```

`TaskBatchSearch/TaskBatchSearchList.vue` — change the import (line 20) and the binding (line 54):

```js
import { TASK_TYPE } from '@/enums/taskTypes'
```

```html
    :task-types="[TASK_TYPE.BATCH_SEARCH]"
```

`TaskBatchDownload/TaskBatchDownloadList.vue` — change the import (line 21) and the binding (line 53):

```js
import { TASK_TYPE } from '@/enums/taskTypes'
```

```html
    :task-types="[TASK_TYPE.BATCH_DOWNLOAD]"
```

`TaskDocuments/TaskDocumentsList.vue` — this view also uses `getHumanTaskName` for display, so keep that import and add the new one. Change line 15 to keep `getHumanTaskName` from `taskNames` and import `TASK_TYPE` separately, then change the binding (line 58):

```js
import { getHumanTaskName } from '@/enums/taskNames'
import { TASK_TYPE } from '@/enums/taskTypes'
```

```html
    :task-types="[TASK_TYPE.INDEX, TASK_TYPE.SCAN]"
```

- [ ] **Step 4: Run the affected tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/components/Task/TaskEntities/TaskEntitiesList.spec.js`
Expected: PASS (all three tests).

- [ ] **Step 5: Run the full task-related suite and lint**

Run: `yarn test:unit tests/unit/specs/store/modules/task.spec.js tests/unit/specs/composables/useTaskPolling.spec.js tests/unit/specs/api/index.spec.js tests/unit/specs/components/Task`
Expected: PASS.

Run: `yarn lint src/views/Task src/enums/taskTypes.js src/store/modules/task.js src/composables/useTaskPolling.js src/api/index.js`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/views/Task tests/unit/specs/components/Task/TaskEntities/TaskEntitiesList.spec.js
git commit -m "feat(tasks): filter task lists by type instead of class-name regex"
```

---

## Verification

After all tasks, confirm the swap end to end against a `type`-aware server:

1. `yarn test:unit` — full suite green.
2. Run the app; open each task page (Batch Search, Batch Download, Documents, Entities). Each shows only its own task types.
3. In the network panel, confirm requests hit `/api/task?...&type=<VALUE>` and no longer send a `name=<classnames>` param. Confirm the Batch Search page still lists proxy batch searches (`type=BATCH_SEARCH` covers `BatchSearchRunnerProxy`).
4. Confirm "Stop pending" and "Clear done" on each page send the same `type` param and act only on that page's tasks.
5. Confirm the search box still filters by `args.batchRecord.name` (unchanged).

## Notes for the implementer

- `yarn test:unit` is the Vitest runner; pass a path to scope it, `-t "<name>"` to scope by test title.
- axios omits `null` params but sends empty strings verbatim — this is why the store sends `type: null` (not `''`) when there are no types. Never remove that guard.
- Do not modify `src/enums/taskNames.js`; `TASK_NAME`, `TASK_NAME_ICON`, `HUMAN_TASK_NAME`, `getTaskName`, and `getHumanTaskName` are still used to render each task by its returned class name.
