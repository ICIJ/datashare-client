# Per-Document Download Probe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Decide whether a document's source can be downloaded by probing `HEAD /api/:project/documents/src/:id` lazily and memoizing the answer per document, replacing both the project-level download flag and the client-side root-size rule.

**Architecture:** A new `Api#isDocumentDownloadable(index, id, routing)` sends a HEAD request that resolves for every HTTP status and returns `status === 200`. The existing `documentDownload` Pinia store is rekeyed from index to document and memoizes the in-flight promise, so several components probing the same document produce one request. `useDocumentDownload` reads that store through its existing `isDownloadAllowed` computed; `isRootTooBig` and everything supporting it is deleted.

**Tech Stack:** Vue 3 (`<script setup>`, Composition API), Pinia, axios, Vitest + `@vue/test-utils`, Storybook.

Spec: `docs/superpowers/specs/2026-07-28-document-download-head-probe-design.md`
Backend counterpart: [ICIJ/datashare#2288](https://github.com/ICIJ/datashare/pull/2288)

## Global Constraints

- Code style: no semicolons, 2-space indent, `catch {` on its own line (see `src/store/modules/documentDownload.js` for the house style). Run `yarn lint` if unsure.
- Never use single-line `if` statements without braces.
- Prefer intermediary variables and small helpers over dense one-liners.
- Tests run with `yarn test:unit` (`vitest --run`). Target a single file with `yarn test:unit <path>`.
- No new i18n keys. No new dependencies.
- Do not credit Claude in commit messages.
- `document.routing` is never undefined: `EsDoc#routing` falls back to `this.id` (`src/api/resources/EsDoc.js:32-34`). The memo key can rely on that.
- Verification caveat: the Datashare on `0.0.0.0:8080` does not yet run #2288 (`HEAD` on an unknown id answers 500 where the PR specifies 404). Unit tests are the only verification available; do not block on manual testing.

---

### Task 1: HEAD probe in the API client

Adds the endpoint call. Nothing consumes it yet, so the suite stays green.

**Files:**
- Modify: `src/api/index.js:5-11` (the `Method` enum) and `src/api/index.js:323-325` (next to the existing `isDownloadAllowed`, which stays for now and is deleted in Task 2)
- Test: `tests/unit/specs/api/index.spec.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `Api#isDocumentDownloadable(index: string, id: string, routing: string): Promise<boolean>` — `true` only for HTTP 200; `false` for any other status and for transport failures. Never throws, never emits `http::error`.

- [ ] **Step 1: Write the failing tests**

Append to `tests/unit/specs/api/index.spec.js`, inside the top-level `describe('Datashare backend client', ...)` block:

```js
  describe('isDocumentDownloadable', () => {
    it('should send a HEAD request on the document source url', async () => {
      axios.request.mockResolvedValue({ status: 200 })
      await api.isDocumentDownloadable('foo', 'doc-id', 'root-id')
      expect(axios.request).toBeCalledWith(
        expect.objectContaining({
          url: Api.getFullUrl('/api/foo/documents/src/doc-id'),
          method: 'HEAD',
          params: { routing: 'root-id' },
          validateStatus: expect.any(Function)
        })
      )
    })

    it('should be downloadable when the backend answers 200', async () => {
      axios.request.mockResolvedValue({ status: 200 })
      expect(await api.isDocumentDownloadable('foo', 'doc-id', 'root-id')).toBe(true)
    })

    it('should not be downloadable when the backend answers 403', async () => {
      axios.request.mockResolvedValue({ status: 403 })
      expect(await api.isDocumentDownloadable('foo', 'doc-id', 'root-id')).toBe(false)
    })

    it('should not be downloadable when the backend answers 413', async () => {
      axios.request.mockResolvedValue({ status: 413 })
      expect(await api.isDocumentDownloadable('foo', 'doc-id', 'root-id')).toBe(false)
    })

    it('should not be downloadable when the backend answers 404', async () => {
      axios.request.mockResolvedValue({ status: 404 })
      expect(await api.isDocumentDownloadable('foo', 'doc-id', 'root-id')).toBe(false)
    })

    it('should not be downloadable when the request fails', async () => {
      axios.request.mockRejectedValue(new Error('Network Error'))
      expect(await api.isDocumentDownloadable('foo', 'doc-id', 'root-id')).toBe(false)
    })

    it('should not emit an http error when the document is not downloadable', async () => {
      axios.request.mockResolvedValue({ status: 403 })
      const mockCallback = vi.fn()
      EventBus.on('http::error', mockCallback)
      await api.isDocumentDownloadable('foo', 'doc-id', 'root-id')
      EventBus.off('http::error', mockCallback)
      expect(mockCallback).not.toBeCalled()
    })
  })
```

`axios`, `Api`, `api` and `EventBus` are already imported at the top of that file.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn test:unit tests/unit/specs/api/index.spec.js -t isDocumentDownloadable`
Expected: FAIL — `api.isDocumentDownloadable is not a function`.

- [ ] **Step 3: Add `HEAD` to the `Method` enum**

In `src/api/index.js`, the enum currently reads:

```js
const Method = Object.freeze({
  POST: 'POST',
  PUT: 'PUT',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  GET: 'GET'
})
```

Add the new verb:

```js
const Method = Object.freeze({
  POST: 'POST',
  PUT: 'PUT',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  GET: 'GET',
  HEAD: 'HEAD'
})
```

- [ ] **Step 4: Write the probe method**

In `src/api/index.js`, directly below the existing `isDownloadAllowed(project)` method:

```js
  /**
   * Probe whether a document's source can be downloaded.
   *
   * This deliberately bypasses `sendAction`: 403, 413 and 404 are expected
   * answers from this endpoint, and `sendAction` would emit an `http::error`
   * on the event bus for each one, spraying error notifications across a
   * results page. Any non-200 status, and any transport failure, means the
   * document cannot be downloaded.
   *
   * @param {string} index - The project index of the document
   * @param {string} id - The document id
   * @param {string} routing - The routing (the root document id)
   * @returns {Promise<boolean>} True when the backend answers 200
   */
  async isDocumentDownloadable(index, id, routing) {
    const url = Api.getFullUrl(`/api/${index}/documents/src/${id}`)
    const validateStatus = () => true
    try {
      const { status } = await this.axios.request({ url, method: Method.HEAD, params: { routing }, validateStatus })
      return status === 200
    }
    catch {
      return false
    }
  }
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/api/index.spec.js`
Expected: PASS, including the pre-existing tests in that file.

- [ ] **Step 6: Commit**

```bash
git add src/api/index.js tests/unit/specs/api/index.spec.js
git commit -m "feat(api): probe document download state with HEAD /documents/src/:id"
```

---

### Task 2: Rekey the store to documents and switch the composable over

Store and composable move together: the store's old surface (`allow`, `fetchIndexStatus`, `fetchIndicesStatus`, `isAllowed`) disappears and the composable is its only caller, so splitting them would leave the suite red between commits. This task also deletes the now-orphaned `Api#isDownloadAllowed` and repairs the four specs that mock it.

**Files:**
- Modify: `src/store/modules/documentDownload.js` (full rewrite)
- Modify: `src/composables/useDocumentDownload.js`
- Modify: `src/api/index.js` (delete `isDownloadAllowed`)
- Test: `tests/unit/specs/store/modules/documentDownload.spec.js` (full rewrite)
- Test: `tests/unit/specs/composables/useDocumentDownload.spec.js`
- Test: `tests/unit/specs/core/Core.spec.js:10`, `tests/unit/specs/core/FiltersMixin.spec.js:8`, `tests/unit/specs/views/Search/SearchHistory/SearchHistoryList/SearchHistoryList.spec.js:16`, `tests/unit/specs/views/Task/TaskBatchDownload/TaskBatchDownloadList.spec.js:12`

**Interfaces:**
- Consumes: `Api#isDocumentDownloadable(index, id, routing)` from Task 1.
- Produces:
  - `useDocumentDownloadStore()` exposing exactly two members:
    - `fetchDocumentStatus(document: {index, id, routing}): Promise<void>`
    - `isDownloadable: ComputedRef<(document: {index, id, routing}) => boolean>` — call it as `store.isDownloadable(document)`.
  - `useDocumentDownload(document, options)` keeps returning `isDownloadAllowed: ComputedRef<boolean>` (same name as today, new per-document meaning) and `fetchStatuses(): Promise<void>`. It no longer returns `isRootTooBig`, `rootContentLength`, `maxRootContentLength` or `embeddedDocumentDownloadMaxSize`.

- [ ] **Step 1: Write the failing store test**

Replace the whole content of `tests/unit/specs/store/modules/documentDownload.spec.js` with:

```js
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'

import { useDocumentDownloadStore } from '@/store/modules'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      isDocumentDownloadable: vi.fn().mockResolvedValue(true)
    }
  }
})

describe('DocumentDownloadStore', () => {
  const index = 'downloadStoreFoo'
  const document = { index, id: 'doc-one', routing: 'doc-one' }
  const anotherDocument = { index, id: 'doc-two', routing: 'doc-one' }
  let documentDownloadStore

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    documentDownloadStore = useDocumentDownloadStore()
  })

  describe('initial state', () => {
    it('should be downloadable by default, before the status is known', () => {
      expect(documentDownloadStore.isDownloadable(document)).toBe(true)
    })

    it('should not send any request until the status is fetched', () => {
      documentDownloadStore.isDownloadable(document)
      expect(api.isDocumentDownloadable).not.toBeCalled()
    })
  })

  describe('downloadable document', () => {
    beforeEach(() => {
      api.isDocumentDownloadable.mockResolvedValue(true)
    })

    it('should probe the document with its index, id and routing', async () => {
      await documentDownloadStore.fetchDocumentStatus(document)
      expect(api.isDocumentDownloadable).toBeCalledWith(index, 'doc-one', 'doc-one')
    })

    it('should stay downloadable once the status is fetched', async () => {
      await documentDownloadStore.fetchDocumentStatus(document)
      expect(documentDownloadStore.isDownloadable(document)).toBe(true)
    })
  })

  describe('not downloadable document', () => {
    beforeEach(() => {
      api.isDocumentDownloadable.mockResolvedValue(false)
    })

    it('should not be downloadable once the status is fetched', async () => {
      await documentDownloadStore.fetchDocumentStatus(document)
      expect(documentDownloadStore.isDownloadable(document)).toBe(false)
    })

    it('should not affect another document of the same index', async () => {
      await documentDownloadStore.fetchDocumentStatus(document)
      expect(documentDownloadStore.isDownloadable(anotherDocument)).toBe(true)
    })
  })

  describe('memoization', () => {
    beforeEach(() => {
      api.isDocumentDownloadable.mockResolvedValue(true)
    })

    it('should probe the same document only once', async () => {
      documentDownloadStore.fetchDocumentStatus(document)
      documentDownloadStore.fetchDocumentStatus(document)
      await flushPromises()
      expect(api.isDocumentDownloadable).toBeCalledTimes(1)
    })

    it('should probe two different documents twice', async () => {
      documentDownloadStore.fetchDocumentStatus(document)
      documentDownloadStore.fetchDocumentStatus(anotherDocument)
      await flushPromises()
      expect(api.isDocumentDownloadable).toBeCalledTimes(2)
    })

    it('should probe the same id in two different indices twice', async () => {
      const sameIdOtherIndex = { index: 'downloadStoreBar', id: 'doc-one', routing: 'doc-one' }
      documentDownloadStore.fetchDocumentStatus(document)
      documentDownloadStore.fetchDocumentStatus(sameIdOtherIndex)
      await flushPromises()
      expect(api.isDocumentDownloadable).toBeCalledTimes(2)
    })
  })
})
```

- [ ] **Step 2: Run the store test to verify it fails**

Run: `yarn test:unit tests/unit/specs/store/modules/documentDownload.spec.js`
Expected: FAIL — `documentDownloadStore.isDownloadable is not a function`.

- [ ] **Step 3: Rewrite the store**

Replace the whole content of `src/store/modules/documentDownload.js` with:

```js
import { reactive, computed } from 'vue'
import { defineStore } from 'pinia'

import { apiInstance as api } from '@/api/apiInstance'

export const useDocumentDownloadStore = defineStore('documentDownload', () => {
  const downloadableFor = reactive({})
  const fetchPromises = {} // this doesnt need to be reactive

  /**
   * Build the memoization key of a document
   *
   * @param {Object} document - The document to key
   * @returns {string} The memoization key
   */
  const documentKey = ({ index, id, routing }) => {
    return `${index}/${id}/${routing}`
  }

  /**
   * Fetch the download status of a given document.
   *
   * The in-flight promise is memoized so several components probing the same
   * document produce a single request.
   *
   * @param {Object} document - The document to probe
   * @returns {Promise<void>}
   */
  const fetchDocumentStatus = async (document) => {
    const { index, id, routing } = document
    const key = documentKey(document)
    fetchPromises[key] ??= api.isDocumentDownloadable(index, id, routing)
    downloadableFor[key] = await fetchPromises[key]
  }

  /**
   * Check if a given document can be downloaded.
   *
   * Optimistic: a document whose status is not known yet is considered
   * downloadable, so a results page doesn't render with every download
   * button greyed out while the probes are in flight.
   *
   * @returns {Function<boolean>} The function to check if a document is downloadable
   */
  const isDownloadable = computed(() => {
    return (document) => {
      const key = documentKey(document)
      return !(key in downloadableFor) || downloadableFor[key]
    }
  })

  return { fetchDocumentStatus, isDownloadable }
})
```

- [ ] **Step 4: Run the store test to verify it passes**

Run: `yarn test:unit tests/unit/specs/store/modules/documentDownload.spec.js`
Expected: PASS.

- [ ] **Step 5: Write the failing composable test**

In `tests/unit/specs/composables/useDocumentDownload.spec.js`, replace the whole `describe('fetchStatuses', ...)` block (lines 37-70) with:

```js
  describe('fetchStatuses', () => {
    it('should not fetch download status when immediate is false', async () => {
      apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(true)
      mockGetSource({ content_translated: [] })
      const doc = new Document({
        _id: 'doc1',
        _index: 'test-index',
        _source: { title: 'test' }
      })
      mountComposable(doc, { immediate: false })
      await flushPromises()
      expect(apiInstance.isDocumentDownloadable).not.toHaveBeenCalled()
    })

    it('should fetch download status and translations when fetchStatuses is called', async () => {
      apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(true)
      mockGetSource({ content_translated: [{ target_language: 'ENGLISH' }] })
      const doc = new Document({
        _id: 'doc1',
        _index: 'test-index',
        _source: { title: 'test' }
      })
      const { fetchStatuses, hasTranslations } = mountComposable(doc, { immediate: false })
      await flushPromises()
      expect(apiInstance.isDocumentDownloadable).not.toHaveBeenCalled()
      expect(hasTranslations.value).toBe(false)

      await fetchStatuses()
      await flushPromises()
      expect(apiInstance.isDocumentDownloadable).toHaveBeenCalledWith('test-index', 'doc1', 'doc1')
      expect(hasTranslations.value).toBe(true)
    })

    it('should not fetch download status when the document has no id', async () => {
      apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(true)
      mockGetSource({ content_translated: [] })
      const doc = new Document({ _index: 'test-index', _source: { title: 'test' } })
      const { fetchStatuses } = mountComposable(doc, { immediate: false })
      await fetchStatuses()
      await flushPromises()
      expect(apiInstance.isDocumentDownloadable).not.toHaveBeenCalled()
    })
  })

  describe('isDownloadAllowed', () => {
    it('should be true before the status is fetched', async () => {
      apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(false)
      mockGetSource({ content_translated: [] })
      const doc = new Document({
        _id: 'doc1',
        _index: 'test-index',
        _source: { title: 'test' }
      })
      const { isDownloadAllowed } = mountComposable(doc, { immediate: false })
      expect(isDownloadAllowed.value).toBe(true)
    })

    it('should be false once the backend refuses the download', async () => {
      apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(false)
      mockGetSource({ content_translated: [] })
      const doc = new Document({
        _id: 'doc1',
        _index: 'test-index',
        _source: { title: 'test' }
      })
      const { isDownloadAllowed, fetchStatuses } = mountComposable(doc, { immediate: false })
      await fetchStatuses()
      await flushPromises()
      expect(isDownloadAllowed.value).toBe(false)
    })

    it('should stay true when the backend allows the download', async () => {
      apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(true)
      mockGetSource({ content_translated: [] })
      const doc = new Document({
        _id: 'doc1',
        _index: 'test-index',
        _source: { title: 'test' }
      })
      const { isDownloadAllowed, fetchStatuses } = mountComposable(doc, { immediate: false })
      await fetchStatuses()
      await flushPromises()
      expect(isDownloadAllowed.value).toBe(true)
    })
  })
```

Note: `CoreSetup.init().useAll()` installs a real Pinia, and each `beforeEach` builds a fresh one, so store state does not leak between these tests.

- [ ] **Step 6: Run the composable test to verify it fails**

Run: `yarn test:unit tests/unit/specs/composables/useDocumentDownload.spec.js`
Expected: FAIL — the composable still calls `documentDownloadStore.fetchIndexStatus`, which no longer exists.

- [ ] **Step 7: Update the composable**

In `src/composables/useDocumentDownload.js`:

a. Delete the `byteSize` import (line 7): `import byteSize from '@/utils/byteSize'`.

b. Delete these four computeds entirely — `embeddedDocumentDownloadMaxSize` (lines 57-59), `isRootTooBig` (lines 61-63), `rootContentLength` (lines 70-72) and `maxRootContentLength` (lines 74-76).

c. Replace the `isDownloadAllowed` computed with:

```js
  const isDownloadAllowed = computed(() => {
    return documentDownloadStore.isDownloadable(documentRef.value)
  })
```

d. Replace `fetchDownloadStatus` with:

```js
  async function fetchDownloadStatus() {
    const { index = null, id = null } = documentRef.value
    // If the index or the id is null, this means the document is not loaded
    // yet and therefore, we should not probe its download status
    if (index && id) {
      await documentDownloadStore.fetchDocumentStatus(documentRef.value)
    }
  }
```

e. In the returned object, delete the `embeddedDocumentDownloadMaxSize`, `isRootTooBig`, `rootContentLength` and `maxRootContentLength` entries. `isDownloadAllowed` stays.

f. Keep the `useCore()` call: `embeddedDocumentDownloadMaxSize` was one of its two consumers, but `fetchTranslationStatus` still calls `core.api.elasticsearch.getSource`.

- [ ] **Step 8: Run the composable test to verify it passes**

Run: `yarn test:unit tests/unit/specs/composables/useDocumentDownload.spec.js`
Expected: PASS.

- [ ] **Step 9: Delete the orphaned API method**

In `src/api/index.js`, delete:

```js
  isDownloadAllowed(project) {
    return this.sendActionAsText(`/api/project/isDownloadAllowed/${project}`)
  }
```

Confirm nothing else calls it:

```bash
grep -rn "isDownloadAllowed" src/
```

Expected: only `isDownloadAllowed` as the composable's computed / the components' prop — no `api.isDownloadAllowed` call site.

- [ ] **Step 10: Repair the four stale API mocks**

These specs mount components that reach `useDocumentDownload`, so the mock must expose the new method or the probe hits `undefined`. In each file, rename the mocked member:

- `tests/unit/specs/core/Core.spec.js:10` — `isDownloadAllowed: vi.fn(),` becomes `isDocumentDownloadable: vi.fn().mockResolvedValue(true),`
- `tests/unit/specs/core/FiltersMixin.spec.js:8` — `isDownloadAllowed: vi.fn(),` becomes `isDocumentDownloadable: vi.fn().mockResolvedValue(true),`
- `tests/unit/specs/views/Search/SearchHistory/SearchHistoryList/SearchHistoryList.spec.js:16` — `isDownloadAllowed: vi.fn().mockResolvedValue(),` becomes `isDocumentDownloadable: vi.fn().mockResolvedValue(true),`
- `tests/unit/specs/views/Task/TaskBatchDownload/TaskBatchDownloadList.spec.js:12` — `isDownloadAllowed: vi.fn().mockResolvedValue(),` becomes `isDocumentDownloadable: vi.fn().mockResolvedValue(true),`

- [ ] **Step 11: Run the full suite**

Run: `yarn test:unit`
Expected: PASS. If a spec fails because a component still destructures `isRootTooBig`, that is Task 3's work — note it and continue only if the failure is confined to `DocumentDownloadPopover` / `DocumentActionsGroupEntryDownload`; otherwise fix it here.

- [ ] **Step 12: Commit**

```bash
git add src/store/modules/documentDownload.js src/composables/useDocumentDownload.js src/api/index.js tests/unit/specs/store/modules/documentDownload.spec.js tests/unit/specs/composables/useDocumentDownload.spec.js tests/unit/specs/core/Core.spec.js tests/unit/specs/core/FiltersMixin.spec.js tests/unit/specs/views/Search/SearchHistory/SearchHistoryList/SearchHistoryList.spec.js tests/unit/specs/views/Task/TaskBatchDownload/TaskBatchDownloadList.spec.js
git commit -m "refactor(document): memoize download state per document instead of per project"
```

---

### Task 3: Point the download buttons at the new state

**Files:**
- Modify: `src/components/Document/DocumentActionsGroup/DocumentActionsGroupEntryDownload.vue:44-47,69`
- Modify: `src/components/Document/DocumentDownloadPopover/DocumentDownloadPopover.vue:42-56,97`
- Test: `tests/unit/specs/components/Document/DocumentDownloadPopover/DocumentDownloadPopover.spec.js`

**Interfaces:**
- Consumes: `isDownloadAllowed` and `fetchStatuses` from `useDocumentDownload` (Task 2).
- Produces: no new exports.

- [ ] **Step 1: Write the failing popover test**

Add to `tests/unit/specs/components/Document/DocumentDownloadPopover/DocumentDownloadPopover.spec.js`, inside the top-level `describe`:

```js
  it('should enable the download button while the download status is unknown', async () => {
    apiInstance.elasticsearch.getSource = vi.fn().mockResolvedValue({ content_translated: [] })
    apiInstance.isDocumentDownloadable = vi.fn(() => new Promise(() => {}))
    const wrapper = mountPopover(createDocument())
    const buttons = wrapper.findAll('.document-download-popover__body__button')
    const downloadButton = buttons.find(btn => btn.attributes('label') === 'Download')
    expect(downloadButton.attributes('disabled')).toBeFalsy()
  })

  it('should disable the download button when the backend refuses the download', async () => {
    apiInstance.elasticsearch.getSource = vi.fn().mockResolvedValue({ content_translated: [] })
    apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(false)
    const wrapper = mountPopover(createDocument())
    await flushPromises()
    const buttons = wrapper.findAll('.document-download-popover__body__button')
    const downloadButton = buttons.find(btn => btn.attributes('label') === 'Download')
    expect(downloadButton.attributes('disabled')).toBeTruthy()
  })

  it('should keep the download button enabled when the backend allows the download', async () => {
    apiInstance.elasticsearch.getSource = vi.fn().mockResolvedValue({ content_translated: [] })
    apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(true)
    const wrapper = mountPopover(createDocument())
    await flushPromises()
    const buttons = wrapper.findAll('.document-download-popover__body__button')
    const downloadButton = buttons.find(btn => btn.attributes('label') === 'Download')
    expect(downloadButton.attributes('disabled')).toBeFalsy()
  })
```

The popover is mounted without `lazy`, so `useDocumentDownload` runs with `immediate: true` and probes on mount.

Also add a mock at the top of the three pre-existing tests in this file so they stop hitting the network — insert `apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(true)` right after each existing `apiInstance.elasticsearch.getSource = ...` assignment (three places, lines 53, 65 and 77 in the current file).

- [ ] **Step 2: Run the popover test to verify it fails**

Run: `yarn test:unit tests/unit/specs/components/Document/DocumentDownloadPopover/DocumentDownloadPopover.spec.js`
Expected: FAIL — the download button is never disabled, because `:disabled="isRootTooBig"` is computed from the root size and `isRootTooBig` no longer exists (it resolves to `undefined`).

- [ ] **Step 3: Update the popover**

In `src/components/Document/DocumentDownloadPopover/DocumentDownloadPopover.vue`, in the destructuring at line 42, replace `isRootTooBig,` with `isDownloadAllowed,`. The block becomes:

```js
const {
  description,
  executionWarning,
  documentFullUrl,
  documentFullUrlWithoutMetadata,
  rootDocumentFullUrl,
  hasRoot,
  hasCleanableContentType,
  isDownloadAllowed,
  downloadTextContent,
  hasTextContent,
  hasTranslations,
  downloadTranslatedContent,
  fetchStatuses
} = useDocumentDownload(props.document, { immediate: !props.lazy })
```

In the template, line 97, replace:

```html
        :disabled="isRootTooBig"
```

with:

```html
        :disabled="!isDownloadAllowed"
```

- [ ] **Step 4: Run the popover test to verify it passes**

Run: `yarn test:unit tests/unit/specs/components/Document/DocumentDownloadPopover/DocumentDownloadPopover.spec.js`
Expected: PASS.

- [ ] **Step 5: Update the row download button**

In `src/components/Document/DocumentActionsGroup/DocumentActionsGroupEntryDownload.vue`, replace lines 44-47:

```js
const { isDownloadAllowed, isRootTooBig, documentFullUrl, fetchStatuses } = useDocumentDownload(document, { immediate: false })
whenever(isVisible, fetchStatuses, { once: true })
const hasDownload = computed(() => isDownloadAllowed.value && !isRootTooBig.value)
const href = computed(() => (hasDownload.value ? documentFullUrl.value : null))
```

with:

```js
const { isDownloadAllowed, documentFullUrl, fetchStatuses } = useDocumentDownload(document, { immediate: false })
whenever(isVisible, fetchStatuses, { once: true })
const href = computed(() => (isDownloadAllowed.value ? documentFullUrl.value : null))
```

`:disabled="!isDownloadAllowed"` at line 69 is already correct and stays. `computed` is still imported and used by `href`, so leave the import alone. The `useElementVisibilityOnce` trigger stays: probing happens when a row scrolls into view.

- [ ] **Step 6: Verify no consumer still references the deleted computeds**

```bash
grep -rn "isRootTooBig\|maxRootContentLength\|rootContentLength\|embeddedDocumentDownloadMaxSize" src/ tests/
```

Expected: no output.

- [ ] **Step 7: Run the full suite and the linter**

Run: `yarn test:unit && yarn lint`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/Document/DocumentActionsGroup/DocumentActionsGroupEntryDownload.vue src/components/Document/DocumentDownloadPopover/DocumentDownloadPopover.vue tests/unit/specs/components/Document/DocumentDownloadPopover/DocumentDownloadPopover.spec.js
git commit -m "fix(document): disable download buttons from the per-document probe"
```

---

### Task 4: Remove the dead `isDownloadAllowed` prop drilling

`DocumentCard` and `DocumentCardGrid` declare an `isDownloadAllowed` prop and forward it to `DocumentActionsGroup`, which never declared it — the value has always been discarded. Now that the state comes from the store, delete the whole path.

**Files:**
- Modify: `src/components/Document/DocumentCard/DocumentCard.vue:35-37,135`
- Modify: `src/components/Document/DocumentCard/DocumentCardGrid.vue:32-34,114`
- Modify: `src/stories/components/Document/DocumentRow/DocumentRow.stories.js:62`
- Modify: `src/stories/components/Document/DocumentCard/DocumentCard.stories.js:52`
- Modify: `src/stories/components/Document/DocumentCard/DocumentCardGrid.stories.js:57`
- Test: `tests/unit/specs/components/Document/DocumentCard/DocumentCardGrid.spec.js` (run only; no change expected)

**Interfaces:**
- Consumes: nothing.
- Produces: nothing. `DocumentCard` and `DocumentCardGrid` lose their `isDownloadAllowed` prop from their public API.

- [ ] **Step 1: Confirm the prop is genuinely unused**

```bash
grep -rn "isDownloadAllowed\|is-download-allowed" src/components/Document/DocumentActionsGroup/DocumentActionsGroup.vue
```

Expected: no output — `DocumentActionsGroup` does not declare or use the prop.

- [ ] **Step 2: Delete the prop from `DocumentCard.vue`**

Remove the declaration:

```js
  isDownloadAllowed: {
    type: Boolean
  },
```

and the binding at line 135:

```html
          :is-download-allowed="isDownloadAllowed"
```

- [ ] **Step 3: Delete the prop from `DocumentCardGrid.vue`**

Remove the declaration:

```js
  isDownloadAllowed: {
    type: Boolean
  },
```

and the binding at line 114:

```html
      :is-download-allowed="isDownloadAllowed"
```

- [ ] **Step 4: Delete the story args**

Remove the line `isDownloadAllowed: true,` from each of:

- `src/stories/components/Document/DocumentRow/DocumentRow.stories.js`
- `src/stories/components/Document/DocumentCard/DocumentCard.stories.js`
- `src/stories/components/Document/DocumentCard/DocumentCardGrid.stories.js`

- [ ] **Step 5: Verify nothing references it anymore**

```bash
grep -rn "isDownloadAllowed\|is-download-allowed" src/ tests/
```

Expected: only `src/composables/useDocumentDownload.js`, `src/components/Document/DocumentActionsGroup/DocumentActionsGroupEntryDownload.vue`, `src/components/Document/DocumentDownloadPopover/DocumentDownloadPopover.vue` and their specs.

- [ ] **Step 6: Run the full suite, the linter and the Storybook smoke test**

Run: `yarn test:unit && yarn lint && yarn test-storybook`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/Document/DocumentCard/DocumentCard.vue src/components/Document/DocumentCard/DocumentCardGrid.vue src/stories/components/Document/DocumentRow/DocumentRow.stories.js src/stories/components/Document/DocumentCard/DocumentCard.stories.js src/stories/components/Document/DocumentCard/DocumentCardGrid.stories.js
git commit -m "refactor(document): drop the unused isDownloadAllowed prop on document cards"
```

---

## Deferred / out of scope

- The popover's "Download root" button (`rootDocumentFullUrl`) is not probed. It points at a different document id, and probing it would double the request count for every embedded document. Spec decision, not an oversight.
- No explanatory message is shown for a refused download; the buttons stay silently disabled, exactly as before. Distinguishing 403 / 413 / 404 in the UI would need the numeric status plus three new i18n keys — a separate change.
- Manual verification against a real backend is blocked until an instance runs #2288.
