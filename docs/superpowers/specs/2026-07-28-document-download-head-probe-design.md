# Per-document download probe via `HEAD /api/:project/documents/src/:id`

Date: 2026-07-28
Backend counterpart: [ICIJ/datashare#2288](https://github.com/ICIJ/datashare/pull/2288)

## Problem

The client decides whether a document's source can be downloaded from two
independent, both-wrong signals:

1. `GET /api/project/isDownloadAllowed/:index` — a project-level flag, memoized
   per index in the `documentDownload` Pinia store. It says nothing about the
   individual document.
2. `isRootTooBig` — a client-side reimplementation of the backend size rule,
   comparing `document.root.contentLength` against the
   `embeddedDocumentDownloadMaxSize` config value.

Rule (2) is now wrong: after #2288, an embedded document whose `raw` artifact is
already cached is downloadable whatever its root's size. The client cannot
reproduce that decision, because it cannot see the artifact cache.

#2288 adds `HEAD /api/:project/documents/src/:id`, which answers from the same
decision path as `GET` — 200, 403, 404 or 413. That is the single authority the
client should read.

## Goal

Get each document's download state lazily and memoized, from the HEAD endpoint
only. Drop the project-level download status and the client-side size rule.

## Decisions

| Question | Decision |
|---|---|
| When to probe | On visibility, as today: the row download button probes when it scrolls into view, the popover probes on activation. One HEAD per visible document, deduped by the store. |
| How much status detail to keep | A single boolean, `status === 200`. Disabled states stay silent, exactly as today. No new i18n. |
| Where to memoize | The existing `useDocumentDownload` Pinia store, rekeyed from index to document. |
| State while a probe is in flight | Optimistic: enabled until a non-200 comes back. Matches today's default-allow behaviour and avoids a results page of greyed-out buttons. |

## Design

### 1. API layer — `src/api/index.js`

Add `HEAD` to the frozen `Method` enum, and one method returning a boolean:

```js
async isDocumentDownloadable(index, id, routing) {
  const url = Api.getFullUrl(`/api/${index}/documents/src/${id}`)
  const config = { url, method: Method.HEAD, params: { routing }, validateStatus: () => true }
  try {
    const { status } = await this.axios.request(config)
    return status === 200
  }
  catch {
    return false
  }
}
```

It deliberately bypasses `sendAction`. 403, 413 and 404 are expected answers
here, and `sendAction` emits `http::error` on the event bus for every rejected
request — on a results page that would spray error notifications. `validateStatus`
makes every HTTP response resolve; the `catch` covers network failure. Any
non-200, and any transport error, means "cannot download".

Delete `isDownloadAllowed(project)`.

### 2. Store — `src/store/modules/documentDownload.js`

Same shape as today, rekeyed from index to document:

- key: `` `${index}/${id}/${routing ?? ''}` ``
- `fetchDocumentStatus(document)` — memoizes the in-flight promise per key, so
  several components probing the same document produce one HEAD request. This is
  the existing `fetchPromises[k] ??= …` pattern, unchanged.
- `isDownloadable` — getter returning `key not in map || map[key] === true`,
  i.e. optimistic while the probe is pending.
- Remove `allow`, `fetchIndicesStatus` and `isAllowed`.

### 3. Composable — `src/composables/useDocumentDownload.js`

`isDownloadAllowed` keeps its exported name but now reads
`documentDownloadStore.isDownloadable(documentRef.value)`, so consumers change as
little as possible.

Deleted outright: `isRootTooBig`, `rootContentLength`, `maxRootContentLength`,
`embeddedDocumentDownloadMaxSize`, and the now-unused `byteSize` import. The
client stops reading that config value entirely.

`fetchDownloadStatus` guards on both `index` and `id` before probing — a document
that is not loaded yet must not fire a request. Trigger points are otherwise
unchanged: the `immediate` `watchEffect`, plus the exported `fetchStatuses`.

### 4. Consumers

- `DocumentActionsGroupEntryDownload.vue` — `hasDownload` disappears; both `href`
  and `:disabled` key off `isDownloadAllowed`. The `useElementVisibilityOnce`
  trigger stays, so probing remains one HEAD per visible row.
- `DocumentDownloadPopover.vue` — `:disabled="isRootTooBig"` becomes
  `:disabled="!isDownloadAllowed"`; pull `isDownloadAllowed` from the composable
  and drop `isRootTooBig`.
- Dead code removal: the `isDownloadAllowed` prop declared on `DocumentCard.vue`
  and `DocumentCardGrid.vue`, their `:is-download-allowed` bindings to
  `DocumentActionsGroup` (which never declared the prop, so the value was
  discarded), and the three stories that set it — `DocumentRow.stories.js`,
  `DocumentCard.stories.js`, `DocumentCardGrid.stories.js`.

### Out of scope

The popover's "Download root" button points at a different document id
(`fullRootUrl`) and stays unprobed. #2288's contract is per-id; probing the root
separately would double the request count for every embedded document. Noted, not
fixed.

## Testing

Written first, TDD.

- `tests/unit/specs/store/modules/documentDownload.spec.js` — rewritten:
  concurrent probes of the same document produce one API call; two different
  documents in the same index produce two; the getter is `true` before the probe
  resolves; `false` once a non-200 lands.
- `tests/unit/specs/composables/useDocumentDownload.spec.js` — swap the
  `apiInstance.isDownloadAllowed` mocks for `isDocumentDownloadable`, assert it
  receives index, id and routing, assert no probe fires when `immediate: false`
  or when the document has no id.
- Four specs mock `api.isDownloadAllowed` and need the mock renamed:
  `core/Core.spec.js`, `core/FiltersMixin.spec.js`,
  `views/Search/SearchHistory/SearchHistoryList/SearchHistoryList.spec.js`,
  `views/Task/TaskBatchDownload/TaskBatchDownloadList.spec.js`.
- No test asserts on `isRootTooBig` today, so nothing else is orphaned.

## Amendments after code review (commit 5f937c2)

Three decisions above turned out to be wrong and were corrected before merge:

1. **"Both collapse into it" was too broad.** The two replaced signals fed
   different things: the project flag disabled the row download button, while
   `isRootTooBig` only withheld its href. Collapsing both into one boolean
   disabled the button that *opens* the popover, putting the extracted text,
   the translations and the root document out of reach for exactly the
   documents that need them. The row button is now never disabled by the
   probe; only its direct-download href is withheld.
2. **`status === 200` was the wrong test.** Only 403, 404 and 413 count as a
   refusal. Anything the probe cannot interpret — a server or proxy that does
   not route HEAD, a 5xx, a transport failure — leaves the document
   downloadable, so an unreadable probe never hides a working download. A 401
   is additionally reported on the `http::error` bus, so an expired session
   raises the re-login toast instead of silently greying out the page.
3. **"Download without metadata" needed the same gate.** It targets the same
   source endpoint with `filter_metadata=true`, so it is disabled alongside
   the main download button.

The composable also reads its document through a getter now, so a row recycled
onto another document re-probes and re-targets instead of answering for the
document it first rendered.

## Risks

**Request volume.** A results page goes from 1 download-status request to one per
visible document row. They are HEAD requests with no body, deduped per document,
and fired only on visibility — but on a 100-row page that is a real change in
load. If it bites, the fallback is to move the row button to interaction-only
probing; the store and API layer do not change.

**Verification is blocked.** The Datashare on `0.0.0.0:8080` reports branch
`refactor/remove-poison-pill`, and `HEAD /api/bar/documents/src/nonexistent`
answers 500 — the pre-#2288 NPE, where the PR specifies 404. The endpoint cannot
be exercised for real until that instance runs the PR branch. Unit tests cover
the contract in the meantime.
