# Download markdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Download markdown" button to the document download popover that assembles a document's paginated markdown artifacts into a single `.md` file.

**Architecture:** Two new methods on the `Api` class talk to the artifact routes: a silent manifest probe (direct axios, `validateStatus: () => true`, so an expected 404 never raises a toast) and a plain text page fetch. `useDocumentDownload` holds the probe result, derives `hasMarkdown`, and assembles the pages into a blob download. `DocumentDownloadPopover` renders one button behind `v-if="hasMarkdown"`. No store changes.

**Tech Stack:** Vue 3 `<script setup>`, Pinia, axios, lodash, vitest + `@vue/test-utils`, vue-i18n.

**Spec:** `docs/superpowers/specs/2026-08-09-download-markdown-design.md`

## Global Constraints

- **Work in `~/Repositories/datashare-client` on `main`.** The `t3code-4b5aa495` worktree has a broken `.git` file (it points at a host path that does not exist in the container), so no git command works there. Committing on `main` is fine per the project conventions.
- **Backend requirement:** the artifact routes only exist on datashare's `feat/artifacts-resource` branch. A backend without them answers 404 everywhere, which the code treats as "no markdown" — the client degrades silently by design.
- **Backend contract (do not change these paths):**
  - `GET /api/:project/artifacts/structure/:id?routing=` → `200 {"pages": N, "formats": ["md", "xhtml"]}`
  - `GET /api/:project/artifacts/structure/:id/:page?routing=` → `200` one page as `text/markdown` (`format` defaults to `md` server-side, so the client never sends it)
- **No `isDownloadAllowed` gating on markdown.** It is derived text, like "Download text", which the popover already leaves ungated.
- **`md` only.** Never request or expose the `xhtml` format.
- **Page join separator is exactly `\n\n`** (one blank line between pages).
- **Downloaded filename is exactly `` `${title}.md` ``.**
- **Blob MIME type is exactly `text/markdown;charset=UTF-8`.**
- **TDD is mandatory:** every task shows the failing test output before any production code is written.
- Run tests with `yarn test:unit`. A single file: `yarn test:unit <path>`. Lint with `yarn lint`.

## File Structure

| File | Responsibility | Change |
| --- | --- | --- |
| `src/api/index.js` | HTTP surface for the two artifact routes | Modify: add `getStructureManifest`, `getStructurePage` |
| `src/composables/useDocumentDownload.js` | Markdown availability state and file assembly | Modify: add `structureManifest`, `hasMarkdown`, `fetchMarkdownStatus`, `downloadMarkdown` |
| `src/components/Document/DocumentDownloadPopover/DocumentDownloadPopover.vue` | Renders the button | Modify: one `button-icon` |
| `src/lang/en.json`, `src/lang/fr.json` | Button label | Modify: one key each |
| `tests/unit/specs/api/index.spec.js` | API-level tests | Modify |
| `tests/unit/specs/composables/useDocumentDownload.spec.js` | Composable tests | Modify |
| `tests/unit/specs/components/Document/DocumentDownloadPopover/DocumentDownloadPopover.spec.js` | Component tests | Modify |

Only two components consume `useDocumentDownload`: the popover, and `DocumentActionsGroupEntryDownload.vue`, which calls it with `{ immediate: false }` and only ever invokes `fetchDownloadStatus`. The results list therefore fires no extra requests.

---

### Task 1: API methods for the structure artifact routes

**Files:**
- Modify: `src/api/index.js` (add both methods next to `isDocumentDownloadable`, around line 346)
- Test: `tests/unit/specs/api/index.spec.js` (append inside the top-level `describe`, after the `isDocumentDownloadable` block that ends at line 643)

**Interfaces:**
- Consumes: nothing from earlier tasks. Uses the existing private helpers `Api.getFullUrl(url)`, `this.axios`, `this.eventBus`, `this.sendAction(url, config)`, and the frozen `Method` map at the top of the file.
- Produces:
  - `getStructureManifest(index: string, id: string, routing: string): Promise<{pages: number, formats: string[]} | null>`
  - `getStructurePage(index: string, id: string, page: number, routing: string): Promise<string>`

- [ ] **Step 1: Write the failing tests**

Append to `tests/unit/specs/api/index.spec.js`, immediately before the final closing `})` of the top-level `describe` (currently line 644):

```js
  describe('getStructureManifest', () => {
    it('should send a GET request on the structure artifact url', async () => {
      axios.request.mockResolvedValue({ status: 200, data: { pages: 2, formats: ['md'] } })
      await api.getStructureManifest('foo', 'doc-id', 'root-id')
      expect(axios.request).toBeCalledWith(
        expect.objectContaining({
          url: Api.getFullUrl('/api/foo/artifacts/structure/doc-id'),
          method: 'GET',
          params: { routing: 'root-id' },
          validateStatus: expect.any(Function)
        })
      )
    })

    it('should return the manifest when the backend answers 200', async () => {
      axios.request.mockResolvedValue({ status: 200, data: { pages: 2, formats: ['md', 'xhtml'] } })
      const manifest = await api.getStructureManifest('foo', 'doc-id', 'root-id')
      expect(manifest).toEqual({ pages: 2, formats: ['md', 'xhtml'] })
    })

    it('should return null when the backend answers 404', async () => {
      axios.request.mockResolvedValue({ status: 404, data: {} })
      expect(await api.getStructureManifest('foo', 'doc-id', 'root-id')).toBeNull()
    })

    it('should return null when the backend answers 403', async () => {
      axios.request.mockResolvedValue({ status: 403, data: {} })
      expect(await api.getStructureManifest('foo', 'doc-id', 'root-id')).toBeNull()
    })

    it('should return null when the backend answers 500', async () => {
      axios.request.mockResolvedValue({ status: 500, data: {} })
      expect(await api.getStructureManifest('foo', 'doc-id', 'root-id')).toBeNull()
    })

    it('should return null when the request fails', async () => {
      axios.request.mockRejectedValue(new Error('Network Error'))
      expect(await api.getStructureManifest('foo', 'doc-id', 'root-id')).toBeNull()
    })

    it('should not emit an http error when the artifact is missing', async () => {
      axios.request.mockResolvedValue({ status: 404, data: {} })
      const mockCallback = vi.fn()
      EventBus.on('http::error', mockCallback)
      await api.getStructureManifest('foo', 'doc-id', 'root-id')
      EventBus.off('http::error', mockCallback)
      expect(mockCallback).not.toBeCalled()
    })

    it('should return null and emit an http error when the session expired', async () => {
      axios.request.mockResolvedValue({ status: 401, data: {} })
      const mockCallback = vi.fn()
      EventBus.on('http::error', mockCallback)
      const manifest = await api.getStructureManifest('foo', 'doc-id', 'root-id')
      EventBus.off('http::error', mockCallback)
      expect(manifest).toBeNull()
      expect(mockCallback).toBeCalledTimes(1)
    })
  })

  describe('getStructurePage', () => {
    it('should request a single page as text', async () => {
      axios.request.mockResolvedValue({ data: '# Page three' })
      await api.getStructurePage('foo', 'doc-id', 3, 'root-id')
      expect(axios.request).toBeCalledWith(
        expect.objectContaining({
          url: Api.getFullUrl('/api/foo/artifacts/structure/doc-id/3'),
          method: 'GET',
          params: { routing: 'root-id' },
          responseType: 'text'
        })
      )
    })

    it('should return the page content', async () => {
      axios.request.mockResolvedValue({ data: '# Page three' })
      expect(await api.getStructurePage('foo', 'doc-id', 3, 'root-id')).toBe('# Page three')
    })
  })
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn test:unit tests/unit/specs/api/index.spec.js`

Expected: FAIL — `api.getStructureManifest is not a function` and `api.getStructurePage is not a function`.

- [ ] **Step 3: Write the implementation**

In `src/api/index.js`, insert both methods directly after the closing brace of `isDocumentDownloadable`:

```js
  /**
   * Probe the structure artifact manifest of a document.
   *
   * A document with no structure artifact is the common case, and the backend
   * says so with a 404. That is not an error worth a toast, so this probe goes
   * straight to axios with a permissive `validateStatus` instead of through
   * `sendAction`, which would push every 404 onto the `http::error` bus.
   *
   * Unlike `isDocumentDownloadable`, a probe we cannot read fails closed: a
   * button that 404s on click is worse than no button at all.
   *
   * @param {string} index - The project index of the document
   * @param {string} id - The document id
   * @param {string} routing - The routing (the root document id)
   * @returns {Promise<Object|null>} The manifest, or null when there is none
   */
  async getStructureManifest(index, id, routing) {
    const url = Api.getFullUrl(`/api/${index}/artifacts/structure/${id}`)
    const validateStatus = () => true
    try {
      const response = await this.axios.request({ url, method: Method.GET, params: { routing }, validateStatus })
      const { status, data } = response
      // An expired session says nothing about the artifact. Report it so the
      // app can offer to log back in, and hide the button either way.
      if (status === 401) {
        this.eventBus?.emit('http::error', { response })
        return null
      }
      return status === 200 ? data : null
    }
    catch {
      return null
    }
  }

  /**
   * Fetch one page of a document's structure artifact, as Markdown.
   *
   * The `format` parameter is omitted on purpose: `md` is the server-side
   * default, and it is the only format this client asks for.
   *
   * @param {string} index - The project index of the document
   * @param {string} id - The document id
   * @param {number} page - The 1-based page number
   * @param {string} routing - The routing (the root document id)
   * @returns {Promise<string>} The page content
   */
  getStructurePage(index, id, page, routing) {
    const url = `/api/${index}/artifacts/structure/${id}/${page}`
    return this.sendAction(url, { method: Method.GET, params: { routing }, responseType: 'text' })
  }
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/api/index.spec.js`

Expected: PASS, including every pre-existing test in the file.

- [ ] **Step 5: Commit**

```bash
cd ~/Repositories/datashare-client
git add src/api/index.js tests/unit/specs/api/index.spec.js
git commit -m "feat(api): read the structure artifact manifest and pages icij/datashare#2192"
```

---

### Task 2: Markdown availability in the composable

**Files:**
- Modify: `src/composables/useDocumentDownload.js`
- Test: `tests/unit/specs/composables/useDocumentDownload.spec.js`

**Interfaces:**
- Consumes: `apiInstance.getStructureManifest(index, id, routing)` from Task 1.
- Produces, from `useDocumentDownload(document, { immediate })`:
  - `structureManifest: Ref<Object|null>`
  - `hasMarkdown: ComputedRef<boolean>` — true only when `pages > 0` and `formats` includes `'md'`
  - `fetchMarkdownStatus: () => Promise<void>`
  - `fetchStatuses` now also awaits `fetchMarkdownStatus`

- [ ] **Step 1: Write the failing tests**

First, in `tests/unit/specs/composables/useDocumentDownload.spec.js`, add a default stub to the existing `beforeEach` (currently ends at line 19) so tests that don't care about markdown never reach the network. Add this as the last line of the `beforeEach` body:

```js
    apiInstance.getStructureManifest = vi.fn().mockResolvedValue(null)
```

Then append these two `describe` blocks before the final closing `})` of the file (currently line 210):

```js
  describe('hasMarkdown', () => {
    function markdownDocument(id) {
      return new Document({
        _id: id,
        _index: 'test-index',
        _source: { title: 'test' }
      })
    }

    it('should be false before the manifest is fetched', () => {
      mockGetSource({ content_translated: [] })
      apiInstance.getStructureManifest = vi.fn(() => new Promise(() => {}))
      const { hasMarkdown } = mountComposable(markdownDocument('md-pending'))
      expect(hasMarkdown.value).toBe(false)
    })

    it('should be false when the document has no structure artifact', async () => {
      mockGetSource({ content_translated: [] })
      apiInstance.getStructureManifest = vi.fn().mockResolvedValue(null)
      const { hasMarkdown } = mountComposable(markdownDocument('md-none'))
      await flushPromises()
      expect(hasMarkdown.value).toBe(false)
    })

    it('should be false when the manifest reports zero pages', async () => {
      mockGetSource({ content_translated: [] })
      apiInstance.getStructureManifest = vi.fn().mockResolvedValue({ pages: 0, formats: ['md'] })
      const { hasMarkdown } = mountComposable(markdownDocument('md-empty'))
      await flushPromises()
      expect(hasMarkdown.value).toBe(false)
    })

    it('should be false when markdown is not among the available formats', async () => {
      mockGetSource({ content_translated: [] })
      apiInstance.getStructureManifest = vi.fn().mockResolvedValue({ pages: 3, formats: ['xhtml'] })
      const { hasMarkdown } = mountComposable(markdownDocument('md-xhtml-only'))
      await flushPromises()
      expect(hasMarkdown.value).toBe(false)
    })

    it('should be true when the manifest reports markdown pages', async () => {
      mockGetSource({ content_translated: [] })
      apiInstance.getStructureManifest = vi.fn().mockResolvedValue({ pages: 3, formats: ['md', 'xhtml'] })
      const { hasMarkdown } = mountComposable(markdownDocument('md-available'))
      await flushPromises()
      expect(hasMarkdown.value).toBe(true)
    })
  })

  describe('fetchMarkdownStatus', () => {
    it('should not probe the manifest when immediate is false', async () => {
      mockGetSource({ content_translated: [] })
      apiInstance.getStructureManifest = vi.fn().mockResolvedValue(null)
      const doc = new Document({ _id: 'md-lazy', _index: 'test-index', _source: { title: 'test' } })
      mountComposable(doc, { immediate: false })
      await flushPromises()
      expect(apiInstance.getStructureManifest).not.toHaveBeenCalled()
    })

    it('should probe the manifest when fetchStatuses is called', async () => {
      mockGetSource({ content_translated: [] })
      apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(true)
      apiInstance.getStructureManifest = vi.fn().mockResolvedValue({ pages: 1, formats: ['md'] })
      const doc = new Document({ _id: 'md-explicit', _index: 'test-index', _source: { title: 'test' } })
      const { fetchStatuses, hasMarkdown } = mountComposable(doc, { immediate: false })
      await fetchStatuses()
      await flushPromises()
      expect(apiInstance.getStructureManifest).toHaveBeenCalledWith('test-index', 'md-explicit', 'md-explicit')
      expect(hasMarkdown.value).toBe(true)
    })

    it('should not probe the manifest when the document has no id', async () => {
      mockGetSource({ content_translated: [] })
      apiInstance.getStructureManifest = vi.fn().mockResolvedValue(null)
      const doc = new Document({ _index: 'test-index', _source: { title: 'test' } })
      const { fetchStatuses } = mountComposable(doc, { immediate: false })
      await fetchStatuses()
      await flushPromises()
      expect(apiInstance.getStructureManifest).not.toHaveBeenCalled()
    })
  })
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn test:unit tests/unit/specs/composables/useDocumentDownload.spec.js`

Expected: FAIL — `hasMarkdown` is `undefined`, so reading `.value` throws, and `getStructureManifest` is never called.

- [ ] **Step 3: Write the implementation**

In `src/composables/useDocumentDownload.js`, add the api import as the **first** `@/` import, above `@/store/modules`. That matches the convention in `src/composables/useContentTypeCategoryAvailability.js:5`, where external packages come first, then a blank line, then `@/api/apiInstance` ahead of the store imports:

```js
import { computed, ref, toRef, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'

import { apiInstance as api } from '@/api/apiInstance'
import { useDocumentDownloadStore, useDocumentStore } from '@/store/modules'
import settings from '@/utils/settings'
```

Add the state and the probe after `fetchTranslationStatus` (which ends at line 93):

```js
  const structureManifest = ref(null)

  const hasMarkdown = computed(() => {
    const { pages = 0, formats = [] } = structureManifest.value ?? {}
    return pages > 0 && formats.includes('md')
  })

  async function fetchMarkdownStatus() {
    const { index, id, routing } = documentRef.value
    if (!index || !id) return
    structureManifest.value = await api.getStructureManifest(index, id, routing)
  }
```

Extend `fetchStatuses`:

```js
  async function fetchStatuses() {
    await Promise.all([fetchDownloadStatus(), fetchTranslationStatus(), fetchMarkdownStatus()])
  }
```

Add a third `watchEffect` inside the `if (immediate)` block:

```js
    watchEffect(fetchMarkdownStatus)
```

Add `structureManifest`, `hasMarkdown` and `fetchMarkdownStatus` to the returned object.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/composables/useDocumentDownload.spec.js`

Expected: PASS, including every pre-existing test in the file.

- [ ] **Step 5: Commit**

```bash
cd ~/Repositories/datashare-client
git add src/composables/useDocumentDownload.js tests/unit/specs/composables/useDocumentDownload.spec.js
git commit -m "feat(document): detect the markdown artifact of a document icij/datashare#2192"
```

---

### Task 3: Assemble and download the markdown file

**Files:**
- Modify: `src/composables/useDocumentDownload.js`
- Test: `tests/unit/specs/composables/useDocumentDownload.spec.js`

**Interfaces:**
- Consumes: `hasMarkdown` and `structureManifest` from Task 2; `apiInstance.getStructurePage(index, id, page, routing)` from Task 1.
- Produces: `downloadMarkdown: () => Promise<void>` on the composable's return value.

- [ ] **Step 1: Write the failing tests**

Append this `describe` block before the final closing `})` of `tests/unit/specs/composables/useDocumentDownload.spec.js`:

```js
  describe('downloadMarkdown', () => {
    function stubAnchor() {
      const anchor = { href: '', download: '', click: vi.fn() }
      const originalCreateElement = window.document.createElement.bind(window.document)
      vi.spyOn(window.document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') return anchor
        return originalCreateElement(tag)
      })
      return anchor
    }

    it('should request every page of the artifact', async () => {
      mockGetSource({ content_translated: [] })
      apiInstance.getStructureManifest = vi.fn().mockResolvedValue({ pages: 3, formats: ['md'] })
      apiInstance.getStructurePage = vi.fn().mockResolvedValue('page')
      stubAnchor()
      const doc = new Document({ _id: 'md-pages', _index: 'test-index', _source: { title: 'test' } })
      const { downloadMarkdown } = mountComposable(doc)
      await flushPromises()
      await downloadMarkdown()
      expect(apiInstance.getStructurePage).toHaveBeenCalledTimes(3)
      expect(apiInstance.getStructurePage).toHaveBeenCalledWith('test-index', 'md-pages', 1, 'md-pages')
      expect(apiInstance.getStructurePage).toHaveBeenCalledWith('test-index', 'md-pages', 2, 'md-pages')
      expect(apiInstance.getStructurePage).toHaveBeenCalledWith('test-index', 'md-pages', 3, 'md-pages')
    })

    it('should join the pages with a blank line', async () => {
      mockGetSource({ content_translated: [] })
      apiInstance.getStructureManifest = vi.fn().mockResolvedValue({ pages: 2, formats: ['md'] })
      apiInstance.getStructurePage = vi.fn((index, id, page) => Promise.resolve(`# Page ${page}`))
      stubAnchor()
      const doc = new Document({ _id: 'md-join', _index: 'test-index', _source: { title: 'test' } })
      const { downloadMarkdown } = mountComposable(doc)
      await flushPromises()
      await downloadMarkdown()
      const [blob] = URL.createObjectURL.mock.calls.at(-1)
      expect(blob.type).toBe('text/markdown;charset=utf-8')
      await expect(blob.text()).resolves.toBe('# Page 1\n\n# Page 2')
    })

    it('should name the file after the document title', async () => {
      mockGetSource({ content_translated: [] })
      apiInstance.getStructureManifest = vi.fn().mockResolvedValue({ pages: 1, formats: ['md'] })
      apiInstance.getStructurePage = vi.fn().mockResolvedValue('# Only page')
      const anchor = stubAnchor()
      const doc = new Document({ _id: 'md-name', _index: 'test-index', _source: { title: 'my-doc' } })
      const { downloadMarkdown } = mountComposable(doc)
      await flushPromises()
      await downloadMarkdown()
      expect(anchor.download).toBe('my-doc.md')
      expect(anchor.click).toHaveBeenCalled()
    })

    it('should do nothing when the document has no markdown', async () => {
      mockGetSource({ content_translated: [] })
      apiInstance.getStructureManifest = vi.fn().mockResolvedValue(null)
      apiInstance.getStructurePage = vi.fn().mockResolvedValue('# Nope')
      const anchor = stubAnchor()
      const doc = new Document({ _id: 'md-absent', _index: 'test-index', _source: { title: 'test' } })
      const { downloadMarkdown } = mountComposable(doc)
      await flushPromises()
      await downloadMarkdown()
      expect(apiInstance.getStructurePage).not.toHaveBeenCalled()
      expect(anchor.click).not.toHaveBeenCalled()
    })
  })
```

Note: `Blob` normalizes its `type` to lower case, hence `text/markdown;charset=utf-8` in the assertion while the source passes `text/markdown;charset=UTF-8`.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn test:unit tests/unit/specs/composables/useDocumentDownload.spec.js`

Expected: FAIL — `downloadMarkdown is not a function`.

- [ ] **Step 3: Write the implementation**

In `src/composables/useDocumentDownload.js`, import `range` from lodash in the external-package group, above the `vue` import (same position lodash takes in `src/api/index.js:1`):

```js
import { range } from 'lodash'
import { computed, ref, toRef, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
```

Add the function after `fetchMarkdownStatus`:

```js
  async function downloadMarkdown() {
    if (!hasMarkdown.value) return
    const { index, id, routing, title } = documentRef.value
    const { pages } = structureManifest.value
    // No hand-rolled concurrency limit: the browser's per-host connection cap
    // already throttles these, and a document rarely has more than a few pages.
    const numbers = range(1, pages + 1)
    const contents = await Promise.all(numbers.map(page => api.getStructurePage(index, id, page, routing)))
    const a = window.document.createElement('a')
    a.href = URL.createObjectURL(new Blob([contents.join('\n\n')], { type: 'text/markdown;charset=UTF-8' }))
    a.download = `${title}.md`
    a.click()
  }
```

Add `downloadMarkdown` to the returned object.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/composables/useDocumentDownload.spec.js`

Expected: PASS, including every pre-existing test in the file.

- [ ] **Step 5: Commit**

```bash
cd ~/Repositories/datashare-client
git add src/composables/useDocumentDownload.js tests/unit/specs/composables/useDocumentDownload.spec.js
git commit -m "feat(document): download a document's markdown as a single file icij/datashare#2192"
```

---

### Task 4: The button in the download popover

**Files:**
- Modify: `src/components/Document/DocumentDownloadPopover/DocumentDownloadPopover.vue`
- Modify: `src/lang/en.json` (inside `documentDownloadPopover`, line 170-180)
- Modify: `src/lang/fr.json` (inside `documentDownloadPopover`, line 170-180)
- Test: `tests/unit/specs/components/Document/DocumentDownloadPopover/DocumentDownloadPopover.spec.js`

**Interfaces:**
- Consumes: `hasMarkdown` and `downloadMarkdown` from `useDocumentDownload` (Tasks 2 and 3), and the i18n key `documentDownloadPopover.downloadMarkdown`.
- Produces: nothing consumed by later tasks. This is the last task.

- [ ] **Step 1: Write the failing tests**

First, add a default stub to the spec's existing `beforeEach` (currently ends at line 16), as its last line, so the tests that predate this feature never reach the network:

```js
    apiInstance.getStructureManifest = vi.fn().mockResolvedValue(null)
```

Then append these tests before the final closing `})` of the file (currently line 147):

```js
  it('should show the markdown download button when the document has a markdown artifact', async () => {
    apiInstance.elasticsearch.getSource = vi.fn().mockResolvedValue({ content_translated: [] })
    apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(true)
    apiInstance.getStructureManifest = vi.fn().mockResolvedValue({ pages: 1, formats: ['md'] })
    const wrapper = mountPopover(createDocument({}, 'test-doc-id-with-markdown'))
    await flushPromises()
    const buttons = wrapper.findAll('.document-download-popover__body__button')
    const labels = buttons.map(btn => btn.attributes('label'))
    expect(labels).toContain('Download markdown')
  })

  it('should not show the markdown download button when the document has no markdown artifact', async () => {
    apiInstance.elasticsearch.getSource = vi.fn().mockResolvedValue({ content_translated: [] })
    apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(true)
    apiInstance.getStructureManifest = vi.fn().mockResolvedValue(null)
    const wrapper = mountPopover(createDocument({}, 'test-doc-id-without-markdown'))
    await flushPromises()
    const buttons = wrapper.findAll('.document-download-popover__body__button')
    const labels = buttons.map(btn => btn.attributes('label'))
    expect(labels).not.toContain('Download markdown')
  })

  it('should trigger a download when the markdown button is clicked', async () => {
    apiInstance.elasticsearch.getSource = vi.fn().mockResolvedValue({ content_translated: [] })
    apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(true)
    apiInstance.getStructureManifest = vi.fn().mockResolvedValue({ pages: 1, formats: ['md'] })
    apiInstance.getStructurePage = vi.fn().mockResolvedValue('# Hello')

    const fakeAnchor = { href: '', download: '', click: vi.fn() }
    const originalCreateElement = window.document.createElement.bind(window.document)
    vi.spyOn(window.document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') return fakeAnchor
      return originalCreateElement(tag)
    })

    const wrapper = mountPopover(createDocument({}, 'test-doc-id-markdown-click'))
    await flushPromises()
    const buttons = wrapper.findAll('.document-download-popover__body__button')
    const markdownButton = buttons.find(btn => btn.attributes('label') === 'Download markdown')
    expect(markdownButton.exists()).toBe(true)
    await markdownButton.trigger('click')
    await flushPromises()
    expect(fakeAnchor.click).toHaveBeenCalled()
  })
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn test:unit tests/unit/specs/components/Document/DocumentDownloadPopover/DocumentDownloadPopover.spec.js`

Expected: FAIL — the label `Download markdown` is not among the rendered buttons.

- [ ] **Step 3: Write the implementation**

Add the key to `src/lang/en.json`, after `"downloadExtractText"` (line 174):

```json
    "downloadMarkdown": "Download markdown",
```

Add the key to `src/lang/fr.json`, at the same position:

```json
    "downloadMarkdown": "Télécharger le markdown",
```

In `DocumentDownloadPopover.vue`, add `hasMarkdown` and `downloadMarkdown` to the destructured `useDocumentDownload(...)` result (the block at lines 42-56).

Add the button in the template, directly after the `downloadExtractText` button (which closes at line 121) and before the translation button:

```html
      <button-icon
        v-if="hasMarkdown"
        :icon-left="IPhDownloadSimple"
        :label="t('documentDownloadPopover.downloadMarkdown')"
        variant="outline-action"
        class="document-download-popover__body__button"
        @click="downloadMarkdown"
      />
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/components/Document/DocumentDownloadPopover/DocumentDownloadPopover.spec.js`

Expected: PASS, including every pre-existing test in the file.

- [ ] **Step 5: Run the full suite and the linter**

Run: `yarn test:unit` then `yarn lint`

Expected: PASS on both. Any failure elsewhere means a component mounting `useDocumentDownload` with `immediate: true` now hits the unstubbed `getStructureManifest`; stub it in that spec's `beforeEach` the same way.

- [ ] **Step 6: Commit**

```bash
cd ~/Repositories/datashare-client
git add src/components/Document/DocumentDownloadPopover/DocumentDownloadPopover.vue src/lang/en.json src/lang/fr.json tests/unit/specs/components/Document/DocumentDownloadPopover/DocumentDownloadPopover.spec.js
git commit -m "feat(document): add a markdown download button to the download popover icij/datashare#2192"
```

---

## Manual verification

With datashare running on `feat/artifacts-resource` and `artifactDir` configured:

1. Open a document that has been through structure extraction. The popover shows "Download markdown"; clicking it saves `<title>.md` with every page concatenated.
2. Open a document with no structure artifact. The button is absent, and the browser console shows no error toast.
3. Open a multi-page PDF and confirm the saved file contains all pages in order, separated by a blank line.

## Out of scope

- The XHTML format.
- The Text-tab markdown viewer and "Copy markdown" button (the second bullet of the issue comment). Note that `docs/superpowers/specs/2026-06-23-safe-markdown-view-tab-design.md` already designs safe markdown rendering for the View tab and is the natural home for that work.
- Migrating `Api#getPages` off the deprecated `/documents/pages` route to `artifacts/page`.
