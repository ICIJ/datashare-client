# Batch Download Deactivate Missing File Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Disable a batch-download's download link when its zip file no longer exists on disk, and show a terse muted message in place of (and in the same style as) the truncated-results message.

**Architecture:** The backend exposes `args.batchDownload.exists`. `RouterLinkBatchDownload` gains that signal so the link renders as a disabled `<span>` when the file is gone. A new thin presentational component `BatchDownloadUnavailableAlert` renders the message. `TaskBatchDownloadList` owns the decision logic (in `<script>` functions, not template expressions) and picks, for done tasks only, between the unavailable alert (priority) and the truncated alert.

**Tech Stack:** Vue 3 `<script setup>` SFCs, vue-i18n, Vitest + `@vue/test-utils`, `CoreSetup` test harness, lodash `get`.

## Global Constraints

- Message copy (en, verbatim): `This download is no longer available.`
- Message copy (fr, verbatim): `Ce téléchargement n'est plus disponible.`
- `args.batchDownload.exists` defaults to `true` when absent (backward compatible with older backends).
- Both alerts render only when the task is **done** — `item.state?.toLowerCase() === TASK_STATUS.DONE` (`TASK_STATUS.DONE === 'done'`).
- The unavailable alert applies only to a task that produced a file URI (`result.value.uri`) and whose file is now absent (`exists === false`); it takes priority over the truncated alert.
- Decision/precedence logic lives in `<script>` functions, not long template expressions.
- Reuse the existing `getBatchDownloadRecord(item, key, defaultValue)` helper in `TaskBatchDownloadList.vue` for reading `args.batchDownload.*`.
- Out of scope: `BatchDownloadActions.vue` is unchanged.
- No single-line `if` statements without braces.

---

### Task 1: `BatchDownloadUnavailableAlert` component + i18n strings

**Files:**
- Create: `src/components/BatchDownload/BatchDownloadUnavailableAlert.vue`
- Create: `tests/unit/specs/components/BatchDownload/BatchDownloadUnavailableAlert.spec.js`
- Modify: `src/lang/en.json` (add `task.batch-download.list.unavailableAlert`)
- Modify: `src/lang/fr.json` (add `task.batch-download.list.unavailableAlert`)

**Interfaces:**
- Consumes: nothing (vue-i18n global `t`).
- Produces: component `BatchDownloadUnavailableAlert` — no props, renders `<p class="batch-download-unavailable-alert text-muted small mb-0">` containing the translation of `task.batch-download.list.unavailableAlert`.

- [ ] **Step 1: Add the i18n source string (en)**

In `src/lang/en.json`, locate `task` → `batch-download` → `list` → `truncatedAlert` and add a sibling key `unavailableAlert` immediately before `truncatedAlert`:

```json
    "unavailableAlert": "This download is no longer available.",
    "truncatedAlert": {
```

- [ ] **Step 2: Add the i18n string (fr)**

In `src/lang/fr.json`, locate `task` → `batch-download` → `list`. After the `searchPlaceholder` entry, add:

```json
    "searchPlaceholder": "Rechercher des téléchargements en lot",
    "unavailableAlert": "Ce téléchargement n'est plus disponible.",
```

(Keep the existing `properties` object that follows.)

- [ ] **Step 3: Write the failing test**

Create `tests/unit/specs/components/BatchDownload/BatchDownloadUnavailableAlert.spec.js`:

```js
import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import BatchDownloadUnavailableAlert from '@/components/BatchDownload/BatchDownloadUnavailableAlert'

describe('BatchDownloadUnavailableAlert.vue', () => {
  let plugins

  beforeAll(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  it('renders the unavailable message with the muted style', () => {
    const wrapper = mount(BatchDownloadUnavailableAlert, { global: { plugins } })
    const alert = wrapper.find('.batch-download-unavailable-alert')
    expect(alert.exists()).toBe(true)
    expect(alert.classes()).toContain('text-muted')
    expect(alert.text()).toBe('This download is no longer available.')
  })
})
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `yarn vitest run tests/unit/specs/components/BatchDownload/BatchDownloadUnavailableAlert.spec.js`
Expected: FAIL — cannot resolve module `@/components/BatchDownload/BatchDownloadUnavailableAlert`.

- [ ] **Step 5: Implement the component**

Create `src/components/BatchDownload/BatchDownloadUnavailableAlert.vue`:

```vue
<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <p class="batch-download-unavailable-alert text-muted small mb-0">
    {{ t('task.batch-download.list.unavailableAlert') }}
  </p>
</template>
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `yarn vitest run tests/unit/specs/components/BatchDownload/BatchDownloadUnavailableAlert.spec.js`
Expected: PASS (1 test).

- [ ] **Step 7: Commit**

```bash
git add src/components/BatchDownload/BatchDownloadUnavailableAlert.vue \
        tests/unit/specs/components/BatchDownload/BatchDownloadUnavailableAlert.spec.js \
        src/lang/en.json src/lang/fr.json
git commit -m "feat(batch-download): add unavailable alert component and strings"
```

---

### Task 2: `RouterLinkBatchDownload` honours `args.batchDownload.exists`

**Files:**
- Modify: `src/components/RouterLink/RouterLinkBatchDownload.vue:14-20`
- Create: `tests/unit/specs/components/RouterLink/RouterLinkBatchDownload.spec.js`

**Interfaces:**
- Consumes: prop `item` (task object) with `item.id`, `item.result.value.uri`, `item.args.batchDownload.exists`.
- Produces: renders `<a href="/api/task/{item.id}/result" target="_blank">` when the task has a result URI **and** `exists !== false`; otherwise renders `<span class="router-link-batch-download--disabled">`.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/specs/components/RouterLink/RouterLinkBatchDownload.spec.js`:

```js
import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import RouterLinkBatchDownload from '@/components/RouterLink/RouterLinkBatchDownload'

function itemWith({ uri = 'file:///tmp/archive.zip', exists } = {}) {
  const batchDownload = { filename: 'file:///tmp/archive.zip' }
  if (exists !== undefined) {
    batchDownload.exists = exists
  }
  return {
    id: 'task-1',
    result: uri ? { value: { uri } } : undefined,
    args: { batchDownload }
  }
}

describe('RouterLinkBatchDownload.vue', () => {
  let plugins

  beforeAll(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  it('renders an active link when the file exists', () => {
    const wrapper = mount(RouterLinkBatchDownload, {
      global: { plugins },
      props: { item: itemWith({ exists: true }) }
    })
    const link = wrapper.find('a.router-link-batch-download')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('/api/task/task-1/result')
    expect(wrapper.find('.router-link-batch-download--disabled').exists()).toBe(false)
  })

  it('renders a disabled span when the file no longer exists', () => {
    const wrapper = mount(RouterLinkBatchDownload, {
      global: { plugins },
      props: { item: itemWith({ exists: false }) }
    })
    expect(wrapper.find('a').exists()).toBe(false)
    const span = wrapper.find('span.router-link-batch-download')
    expect(span.exists()).toBe(true)
    expect(span.classes()).toContain('router-link-batch-download--disabled')
  })

  it('renders an active link when the exists field is absent (backward compatible)', () => {
    const wrapper = mount(RouterLinkBatchDownload, {
      global: { plugins },
      props: { item: itemWith() }
    })
    expect(wrapper.find('a.router-link-batch-download').exists()).toBe(true)
  })

  it('renders a disabled span when there is no result', () => {
    const wrapper = mount(RouterLinkBatchDownload, {
      global: { plugins },
      props: { item: itemWith({ uri: null, exists: true }) }
    })
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.find('.router-link-batch-download--disabled').exists()).toBe(true)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn vitest run tests/unit/specs/components/RouterLink/RouterLinkBatchDownload.spec.js`
Expected: FAIL — the "disabled span when the file no longer exists" case currently renders an `<a>` because `exists` is derived only from `result.value.uri`.

- [ ] **Step 3: Update the component logic**

In `src/components/RouterLink/RouterLinkBatchDownload.vue`, replace the existing `exists` computed (line 17) with three computeds:

Current:

```js
const exists = computed(() => get(props, 'item.result.value.uri', false))
```

Replace with:

```js
const hasResult = computed(() => !!get(props, 'item.result.value.uri', false))
const fileExists = computed(() => get(props, 'item.args.batchDownload.exists', true))
const exists = computed(() => hasResult.value && fileExists.value)
```

Leave `tag`, `attrs`, and `classList` unchanged — they already key off `exists`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `yarn vitest run tests/unit/specs/components/RouterLink/RouterLinkBatchDownload.spec.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/RouterLink/RouterLinkBatchDownload.vue \
        tests/unit/specs/components/RouterLink/RouterLinkBatchDownload.spec.js
git commit -m "fix(batch-download): disable download link when file is missing from disk"
```

---

### Task 3: `TaskBatchDownloadList` wires the alerts with done-gating and precedence

**Files:**
- Modify: `src/views/Task/TaskBatchDownload/TaskBatchDownloadList.vue` (imports, `<script>` functions, `#cell(name)` template)
- Modify: `tests/unit/specs/views/Task/TaskBatchDownload/TaskBatchDownloadList.spec.js`

**Interfaces:**
- Consumes: `BatchDownloadUnavailableAlert` (Task 1), `RouterLinkBatchDownload` (Task 2, updated), existing `BatchDownloadTruncatedAlert`, `TASK_STATUS` from `@/enums/taskStatus`, existing `getBatchDownloadRecord` helper.
- Produces: per-row name cell that renders the download link plus exactly one of: the unavailable alert (when `isUnavailable(item)`), the truncated alert (when `isTruncated(item)`), or neither.

- [ ] **Step 1: Write the failing tests**

In `tests/unit/specs/views/Task/TaskBatchDownload/TaskBatchDownloadList.spec.js`, add the import at the top alongside the existing imports:

```js
import BatchDownloadUnavailableAlert from '@/components/BatchDownload/BatchDownloadUnavailableAlert'
```

Then add these tests inside the `describe('TaskBatchDownloadList.vue', ...)` block (a `doneTask` helper keeps fixtures small; place it just above the new `it` blocks):

```js
function doneTask(overrides = {}) {
  const { exists = true, truncationReason, state = 'DONE', uri = 'file:///tmp/archive.zip' } = overrides
  const resultValue = { '@type': 'UriResult', 'uri': uri, 'size': 78398589 }
  if (truncationReason) {
    resultValue.truncationReason = truncationReason
  }
  return {
    id: 'fixture-task',
    name: 'org.icij.datashare.tasks.BatchDownloadRunner',
    state,
    progress: 1.0,
    result: uri ? { value: resultValue } : undefined,
    args: {
      batchDownload: {
        '@type': 'org.icij.datashare.batch.BatchDownload',
        'uuid': '1fff1f1d-5881-4bb3-9d47-207a99878298',
        'projects': [{ name: 'notnot', sourcePath: 'file:///vault/notnot', label: 'notnot' }],
        'filename': 'file:///tmp/archive.zip',
        'query': { query: '{"bool":{"must":[]}}' },
        'uri': '/?q=&from=0&size=25&indices=notnot',
        'user': { id: 'local', name: null, email: null, provider: 'local' },
        'encrypted': false,
        exists
      },
      user: { id: 'local', name: null, email: null, provider: 'local' },
      group: { id: 'Java' }
    },
    retriesLeft: 3,
    createdAt: new Date()
  }
}

it('shows the unavailable alert and a disabled link for a done task whose file is gone', async () => {
  api.getTasks.mockResolvedValue({ items: [doneTask({ exists: false })] })
  const wrapper = mount(TaskBatchDownloadList, { global: { plugins } })
  await flushPromises()
  expect(wrapper.findComponent(BatchDownloadUnavailableAlert).exists()).toBe(true)
  expect(wrapper.findComponent(BatchDownloadTruncatedAlert).exists()).toBe(false)
  expect(wrapper.find('.router-link-batch-download--disabled').exists()).toBe(true)
})

it('shows only the unavailable alert when a done task is both truncated and missing', async () => {
  api.getTasks.mockResolvedValue({ items: [doneTask({ exists: false, truncationReason: 'SIZE_LIMIT' })] })
  const wrapper = mount(TaskBatchDownloadList, { global: { plugins } })
  await flushPromises()
  expect(wrapper.findComponent(BatchDownloadUnavailableAlert).exists()).toBe(true)
  expect(wrapper.findComponent(BatchDownloadTruncatedAlert).exists()).toBe(false)
})

it('shows neither alert for a non-done task', async () => {
  api.getTasks.mockResolvedValue({ items: [doneTask({ state: 'RUNNING', exists: false, uri: null })] })
  const wrapper = mount(TaskBatchDownloadList, { global: { plugins } })
  await flushPromises()
  expect(wrapper.findComponent(BatchDownloadUnavailableAlert).exists()).toBe(false)
  expect(wrapper.findComponent(BatchDownloadTruncatedAlert).exists()).toBe(false)
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn vitest run tests/unit/specs/views/Task/TaskBatchDownload/TaskBatchDownloadList.spec.js`
Expected: FAIL — `BatchDownloadUnavailableAlert` is never rendered (component not yet wired into the view), so the first two new tests fail.

- [ ] **Step 3: Add imports and decision functions**

In `src/views/Task/TaskBatchDownload/TaskBatchDownloadList.vue`, add to the imports block:

```js
import BatchDownloadUnavailableAlert from '@/components/BatchDownload/BatchDownloadUnavailableAlert'
import { TASK_STATUS } from '@/enums/taskStatus'
```

(`TASK_NAME` is already imported from `@/enums/taskNames` — keep it.)

Then, below the existing `getBatchDownloadRecord` function, add:

```js
function isDone(item) {
  return item.state?.toLowerCase() === TASK_STATUS.DONE
}

function isUnavailable(item) {
  return isDone(item) && !!item.result?.value?.uri && getBatchDownloadRecord(item, 'exists', true) === false
}

function isTruncated(item) {
  return isDone(item) && !isUnavailable(item) && !!item.result?.value?.truncationReason
}
```

- [ ] **Step 4: Update the `#cell(name)` template**

Replace the existing `#cell(name)` template (currently lines 75-78):

```html
        <template #cell(name)="{ item }">
          <router-link-batch-download :item="item" />
          <batch-download-truncated-alert :truncation-reason="item.result?.value?.truncationReason" />
        </template>
```

with:

```html
        <template #cell(name)="{ item }">
          <router-link-batch-download :item="item" />
          <batch-download-unavailable-alert v-if="isUnavailable(item)" />
          <batch-download-truncated-alert
            v-else-if="isTruncated(item)"
            :truncation-reason="item.result?.value?.truncationReason"
          />
        </template>
```

- [ ] **Step 5: Run the full view spec to verify it passes**

Run: `yarn vitest run tests/unit/specs/views/Task/TaskBatchDownload/TaskBatchDownloadList.spec.js`
Expected: PASS — the 3 new tests plus all pre-existing tests (the existing truncated-alert tests use `exists: true`, so they are unaffected).

- [ ] **Step 6: Run lint**

Run: `yarn lint`
Expected: no errors in the touched files.

- [ ] **Step 7: Commit**

```bash
git add src/views/Task/TaskBatchDownload/TaskBatchDownloadList.vue \
        tests/unit/specs/views/Task/TaskBatchDownload/TaskBatchDownloadList.spec.js
git commit -m "fix(batch-download): show unavailable alert in place of truncated alert for missing files"
```

---

## Final verification

- [ ] Run the three affected spec files together:

Run:
```bash
yarn vitest run \
  tests/unit/specs/components/BatchDownload/BatchDownloadUnavailableAlert.spec.js \
  tests/unit/specs/components/RouterLink/RouterLinkBatchDownload.spec.js \
  tests/unit/specs/views/Task/TaskBatchDownload/TaskBatchDownloadList.spec.js
```
Expected: all PASS.

- [ ] Confirm against the behaviour matrix in the spec: done + missing → disabled link + unavailable message; done + missing + truncated → unavailable only; done + present → active link (+ truncated if any); running/error → no message.
