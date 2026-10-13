# Batch download: deactivate link when the file is no longer on disk

- **Issue:** [ICIJ/datashare#2232](https://github.com/ICIJ/datashare/issues/2232)
- **Date:** 2026-06-26
- **Type:** bug fix (frontend)

## Problem

A batch download task can complete successfully — so its result carries a file
URI (`result.value.uri`) — but the generated zip can later be removed from disk
(cleanup / retention). Today `RouterLinkBatchDownload.vue` decides whether the
download link is active purely from `result.value.uri`, so the link stays
clickable and resolves to `/api/task/{id}/result`, which 404s because the file
is gone.

The backend now exposes whether the file is still present on disk at
`args.batchDownload.exists`.

## Goal

In the batch-download task list:

1. Disable the download link when the file no longer exists on disk.
2. Render a muted message below the link — in the same fashion as, and **in
   replacement of**, the truncated-results message.

## Constraints & decisions

- **Message is inform-only and terse**, matching the truncated-results style:
  _"This download is no longer available."_ No call to action.
- **Both alerts (unavailable and truncated) only render when the task is done.**
- **The "unavailable" message replaces the "truncated" message** when both would
  otherwise apply (missing > truncated).
- **The unavailable message only applies to a download that *was* available and
  is now gone** — i.e. a done task that produced a file URI but whose file is
  absent. Running / errored / never-completed tasks never show it.
- **Backward compatible:** when `args.batchDownload.exists` is absent (older
  backend), default it to `true`, preserving current behaviour.
- **Precedence logic lives in `<script>` functions, not in long template
  expressions.**
- **Out of scope:** `BatchDownloadActions.vue` is unchanged — Relaunch stays
  available so a user can regenerate a deleted file.

## Data shape (reference)

```jsonc
{
  "id": "…",
  "state": "DONE",
  "result": { "value": { "@type": "UriResult", "uri": "file:///…/archive.zip", "size": 78398589 } },
  "args": {
    "batchDownload": {
      "filename": "file:///…/archive.zip",
      "uri": "/?q=&…",          // search URI (used by Relaunch / Search action)
      "exists": false,          // NEW: is the zip still on disk?
      "…": "…"
    }
  }
}
```

`result.value.uri` = the produced zip's URI (present once the task is done).
`args.batchDownload.uri` = the originating search URI (unrelated to this fix).

## Implementation

### 1. `src/components/RouterLink/RouterLinkBatchDownload.vue`

Today `exists` is `get(item, 'result.value.uri', false)`. Make the link active
only when the task produced a file **and** that file still exists:

```js
const hasResult = computed(() => !!get(props, 'item.result.value.uri', false))
// default true so tasks from older backends (field absent) behave as today
const fileExists = computed(() => get(props, 'item.args.batchDownload.exists', true))
const exists = computed(() => hasResult.value && fileExists.value)
```

`tag` / `attrs` / `classList` already key off `exists`, so a missing file
automatically renders the disabled `<span>` with the existing
`--disabled` styling. No template change. No explicit "done" check is needed
here — `result.value.uri` only exists once the task is done.

### 2. New `src/components/BatchDownload/BatchDownloadUnavailableAlert.vue`

Thin presentational component, parallel to `BatchDownloadTruncatedAlert`. It owns
the styling and the message only; visibility is decided by the parent.

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

### 3. `src/views/Task/TaskBatchDownload/TaskBatchDownloadList.vue`

Add the import and decision functions (reusing the existing
`getBatchDownloadRecord` helper for the `exists` field):

```js
import { TASK_STATUS } from '@/enums/taskStatus'
import BatchDownloadUnavailableAlert from '@/components/BatchDownload/BatchDownloadUnavailableAlert'

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

Update the `name` cell — short expressions, precedence via `v-if` / `v-else-if`:

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

### 4. i18n

Add one source string to `src/lang/en.json` under `task.batch-download.list`:

```json
"unavailableAlert": "This download is no longer available."
```

Also add the French equivalent in `src/lang/fr.json` (primary maintained
locale): `"Ce téléchargement n'est plus disponible."` Other locales are handled
by Crowdin from the `en.json` source.

## Behaviour matrix

| Task state | has result URI | `exists` | Link    | Message shown        |
|------------|----------------|----------|---------|----------------------|
| done       | yes            | true     | active  | (truncated if any)   |
| done       | yes            | false    | disabled| **unavailable**      |
| done       | yes            | absent   | active  | (truncated if any)   |
| done       | yes (truncated)| false    | disabled| **unavailable** (replaces truncated) |
| running    | no             | —        | disabled| none                 |
| error      | no             | —        | disabled| none                 |

## Testing

- **New** `tests/unit/specs/components/BatchDownload/BatchDownloadUnavailableAlert.spec.js`
  — renders the `.batch-download-unavailable-alert` paragraph with the expected text.
- **New** `tests/unit/specs/components/RouterLink/RouterLinkBatchDownload.spec.js`
  (none exists today):
  - renders an `<a>` with `href="/api/task/{id}/result"` when result URI present and `exists: true`;
  - renders a disabled `<span>` (`.router-link-batch-download--disabled`) when `exists: false`;
  - renders an `<a>` (backward compatible) when `exists` is absent.
- **Update** `tests/unit/specs/views/Task/TaskBatchDownload/TaskBatchDownloadList.spec.js`:
  - a done task with `exists: false` shows the disabled link + unavailable alert and **no** truncated alert;
  - a done task that is both truncated and missing shows **only** the unavailable alert (precedence);
  - a non-done task shows neither alert.

## Files touched

- `src/components/RouterLink/RouterLinkBatchDownload.vue` (modify)
- `src/components/BatchDownload/BatchDownloadUnavailableAlert.vue` (new)
- `src/views/Task/TaskBatchDownload/TaskBatchDownloadList.vue` (modify)
- `src/lang/en.json`, `src/lang/fr.json` (modify)
- 2 new spec files + 1 updated spec (see Testing)
