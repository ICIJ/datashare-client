# Markdown Text Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render a document's Text tab as markdown from the structure artifacts, with artifact-driven pagination and markdown-native in-document search, falling back to the untouched plain-text view whenever markdown is unavailable.

**Architecture:** A manifest probe (`useStructureArtifact`) decides per document whether markdown mode is possible; `DocumentContent.vue` gains an `isMarkdownMode` computed that branches pagination, body rendering and search between the existing offset machinery (untouched) and a new `DocumentContentMarkdown` component fed by the artifacts API. Search in markdown mode consumes the backend `structure/search` endpoint and marks matches in the rendered DOM with diacritic folding.

**Tech Stack:** Vue 3 `<script setup>`, Pinia, bootstrap-vue-next, remark/rehype (already installed, via `renderMarkdown`), Vitest + Vue Test Utils (jsdom). No new dependencies.

**Spec:** `docs/superpowers/specs/2026-08-10-markdown-text-tab-design.md`

## Global Constraints

- Backend prerequisite: the endpoints exist on ICIJ/datashare `main` (PR #2306, merged) except `structure/search`, which lives on branch `feat/artifacts-structure-search`. Run manual QA against a local build of that branch.
- Code style: match the repo ESLint (2-space indent, single quotes, no semicolons); always brace `if`/`else`, Stroustrup style (`else` on its own line); verbose intention-revealing names; small functions; comments only for non-obvious "why", placed before the block; trailing newline in every file.
- Every user-visible string gets a key in BOTH `src/lang/en.json` and `src/lang/fr.json`.
- TDD is mandatory: run the failing test and show RED output before writing production code.
- Commit messages are semantic (`feat(...)`, `test(...)`); NO co-author trailers, no AI credits.
- Test runner: `yarn test:unit <path>` (vitest single run), lint: `yarn lint`.
- Code exploration (subagents included): run `graphify query "<question>"` BEFORE reading source files; read raw files only after orientation or to modify specific lines.
- The existing plain-text code path in `DocumentContent.vue` must keep working unchanged: every current test in `tests/unit/specs/components/Document/DocumentContent.spec.js` must still pass after every task.

---

### Task 1: API client methods for structure artifacts

**Files:**
- Modify: `src/api/index.js` (after `getDocumentSlice`/`searchDocument`, around line 226)
- Test: `tests/unit/specs/api/index.spec.js`

**Interfaces:**
- Consumes: existing `Api.getFullUrl(path)`, `this.axios`, `Method.GET`, `this.eventBus` (all already in `src/api/index.js`).
- Produces:
  - `api.getStructureManifest(index, id, routing)` → `Promise<{ pages, formats } | null>` (null on 404/403/5xx/network; 401 also emits `http::error`)
  - `api.getStructurePage(index, id, page, routing)` → `Promise<string>` (rejects on failure, never emits on the bus)
  - `api.searchStructurePages(index, id, query, routing)` → `Promise<{ count, pages, scanned, hits: [{ page, count }] }>` (rejects on failure, never emits on the bus)

The first two methods and their specs come verbatim from branch `feat/markdown-download` (commit `13303e9e9`). Copy the code below rather than cherry-picking, so this task does not depend on that branch's state. When the download-button PR lands later, the methods will already be identical.

- [ ] **Step 1: Write the failing tests**

Append inside the top-level `describe('Datashare backend client', ...)` block of `tests/unit/specs/api/index.spec.js`:

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

  // A page fetch runs once per navigated page: pushing each failure onto the
  // bus would stack one notification per attempt for a single broken artifact.
  it('should not emit an http error when the page request fails', async () => {
    axios.request.mockRejectedValue(new Error('Network Error'))
    const mockCallback = vi.fn()
    EventBus.on('http::error', mockCallback)
    await expect(api.getStructurePage('foo', 'doc-id', 3, 'root-id')).rejects.toThrow('Network Error')
    EventBus.off('http::error', mockCallback)
    expect(mockCallback).not.toBeCalled()
  })
})

describe('searchStructurePages', () => {
  it('should send a GET request on the structure search url with the query', async () => {
    axios.request.mockResolvedValue({ data: { count: 0, pages: 2, scanned: 2, hits: [] } })
    await api.searchStructurePages('foo', 'doc-id', 'needle', 'root-id')
    expect(axios.request).toBeCalledWith(
      expect.objectContaining({
        url: Api.getFullUrl('/api/foo/artifacts/structure/search/doc-id'),
        method: 'GET',
        params: { query: 'needle', routing: 'root-id' }
      })
    )
  })

  it('should return the hits payload', async () => {
    const data = { count: 3, pages: 4, scanned: 4, hits: [{ page: 2, count: 1 }, { page: 3, count: 2 }] }
    axios.request.mockResolvedValue({ data })
    expect(await api.searchStructurePages('foo', 'doc-id', 'needle', 'root-id')).toEqual(data)
  })

  // The search runs on every (throttled) keystroke: a transient failure must degrade
  // silently in the caller instead of stacking one error toast per keystroke.
  it('should not emit an http error when the search fails', async () => {
    axios.request.mockRejectedValue(new Error('Network Error'))
    const mockCallback = vi.fn()
    EventBus.on('http::error', mockCallback)
    await expect(api.searchStructurePages('foo', 'doc-id', 'needle', 'root-id')).rejects.toThrow('Network Error')
    EventBus.off('http::error', mockCallback)
    expect(mockCallback).not.toBeCalled()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn test:unit tests/unit/specs/api/index.spec.js`
Expected: FAIL with `api.getStructureManifest is not a function` (and the same for the two other methods).

- [ ] **Step 3: Write the implementation**

In `src/api/index.js`, after the `searchDocument` method (line ~230):

```js
/**
 * Probe the structure artifact manifest of a document, or null when there is
 * none.
 *
 * The structure endpoints bypass `sendAction`, which pushes every rejection
 * onto the `http::error` bus: a document with no artifact answers 404, which
 * is the common case and not an error worth a toast. Unlike
 * `isDocumentDownloadable`, a probe we cannot read fails closed, because a
 * markdown view that 404s page after page is worse than no markdown at all.
 */
async getStructureManifest(index, id, routing) {
  const url = Api.getFullUrl(`/api/${index}/artifacts/structure/${id}`)
  const validateStatus = () => true
  try {
    const response = await this.axios.request({ url, method: Method.GET, params: { routing }, validateStatus })
    const { status, data } = response
    // An expired session says nothing about the artifact. Report it so the
    // app can offer to log back in, and fall back to plain text either way.
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
 * Fetch one page (1-based) of a document's structure artifact, as Markdown.
 * Bypasses `sendAction` for the reason given on `getStructureManifest`. The
 * `format` parameter is omitted because `md` is the server-side default.
 */
async getStructurePage(index, id, page, routing) {
  const url = Api.getFullUrl(`/api/${index}/artifacts/structure/${id}/${page}`)
  const { data } = await this.axios.request({ url, method: Method.GET, params: { routing }, responseType: 'text' })
  return data
}

/**
 * Count a query's occurrences in a document's markdown structure pages,
 * per page. Bypasses `sendAction` because it runs on every (throttled)
 * keystroke: the caller degrades a failure to zero occurrences instead of
 * toasting it.
 */
async searchStructurePages(index, id, query, routing) {
  const url = Api.getFullUrl(`/api/${index}/artifacts/structure/search/${id}`)
  const { data } = await this.axios.request({ url, method: Method.GET, params: { query, routing } })
  return data
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/api/index.spec.js`
Expected: PASS (all pre-existing tests in the file included).

- [ ] **Step 5: Commit**

```bash
git add src/api/index.js tests/unit/specs/api/index.spec.js
git commit -m "feat(api): add structure artifact manifest, page and search methods"
```

---

### Task 2: Folded term marking inside rendered HTML

**Files:**
- Modify: `src/utils/strings.js` (after `addLocalSearchMarksClassByOffsets`, line ~63)
- Test: `tests/unit/specs/utils/strings.spec.js` (append; the file already tests this module)

**Interfaces:**
- Consumes: nothing new (`DOMParser`, `NodeFilter` are jsdom/browser globals).
- Produces:
  - `foldWithSourceIndexes(value)` → `{ folded: string, sourceIndexes: number[] }`
  - `addLocalSearchMarksClassInHtml(html, term)` → `string` (same `<mark class="local-search-term">` wrapping as the offset-based variant, but located by folded text match inside HTML text nodes)

Why a new function instead of `addLocalSearchMarksClass` (strings.js:74): that one is regex-over-HTML-string with no diacritic folding, so searching `societe` would never mark `société` while the backend counts it. Folding changes string length (ligatures), hence the source-index map.

- [ ] **Step 1: Write the failing tests**

Append to `tests/unit/specs/utils/strings.spec.js` (add the two functions to the existing import from `@/utils/strings`):

```js
describe('foldWithSourceIndexes', () => {
  it('lowercases and strips diacritics', () => {
    expect(foldWithSourceIndexes('Société').folded).toBe('societe')
  })

  it('maps every folded char back to its source index', () => {
    const { folded, sourceIndexes } = foldWithSourceIndexes('Où')
    expect(folded).toBe('ou')
    expect(sourceIndexes).toEqual([0, 1])
  })

  it('keeps the map aligned when the fold expands a ligature', () => {
    const { folded, sourceIndexes } = foldWithSourceIndexes('aﬀb')
    expect(folded).toBe('affb')
    expect(sourceIndexes).toEqual([0, 1, 1, 2])
  })
})

describe('addLocalSearchMarksClassInHtml', () => {
  it('wraps a case-insensitive match in a mark tag', () => {
    const html = '<p>Hello World</p>'
    const marked = addLocalSearchMarksClassInHtml(html, 'world')
    expect(marked).toBe('<p>Hello <mark class="local-search-term">World</mark></p>')
  })

  it('marks a diacritic variant of the term', () => {
    const html = '<p>La société écran</p>'
    const marked = addLocalSearchMarksClassInHtml(html, 'societe')
    expect(marked).toContain('<mark class="local-search-term">société</mark>')
  })

  it('marks every occurrence across elements', () => {
    const html = '<h1>data</h1><p>data and data</p>'
    const marked = addLocalSearchMarksClassInHtml(html, 'data')
    expect(marked.match(/<mark class="local-search-term">/g)).toHaveLength(3)
  })

  it('never matches across element boundaries or inside attributes', () => {
    const html = '<p><a href="https://data.example.org" title="data">a link</a></p>'
    const marked = addLocalSearchMarksClassInHtml(html, 'data')
    expect(marked).toBe(html)
  })

  it('returns the html untouched for a blank term', () => {
    const html = '<p>Hello</p>'
    expect(addLocalSearchMarksClassInHtml(html, '  ')).toBe(html)
    expect(addLocalSearchMarksClassInHtml(html, '')).toBe(html)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn test:unit tests/unit/specs/utils/strings.spec.js`
Expected: FAIL with `foldWithSourceIndexes is not a function` (import error).

- [ ] **Step 3: Write the implementation**

In `src/utils/strings.js`, after `addLocalSearchMarksClassByOffsets`:

```js
/**
 * Fold a string roughly the way the backend artifact search does: lowercase,
 * NFKD-decompose and strip combining marks. Returns the folded string plus, for
 * each folded char, the index of the source char it came from, so a match found
 * in folded text can be mapped back to the original string even when the fold
 * changes its length (a ligature expands, a combining mark disappears).
 *
 * @param {string} [value=''] - The string to fold.
 * @return {Object} - An object with the `folded` string and its `sourceIndexes` map.
 */
export function foldWithSourceIndexes(value = '') {
  const folded = []
  const sourceIndexes = []
  for (let index = 0; index < value.length; index++) {
    const decomposed = value[index].toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '')
    for (const character of decomposed) {
      folded.push(character)
      sourceIndexes.push(index)
    }
  }
  return { folded: folded.join(''), sourceIndexes }
}

/**
 * Find every folded-term match in a text string, mapped back to source offsets.
 *
 * @param {string} text - The source text to search in.
 * @param {string} foldedTerm - The already-folded term to search for.
 * @return {Object[]} - A list of `{ start, end }` source ranges.
 */
function findFoldedMatches(text, foldedTerm) {
  const { folded, sourceIndexes } = foldWithSourceIndexes(text)
  const matches = []
  let at = folded.indexOf(foldedTerm)
  while (at !== -1) {
    const start = sourceIndexes[at]
    const end = sourceIndexes[at + foldedTerm.length - 1] + 1
    matches.push({ start, end })
    at = folded.indexOf(foldedTerm, at + foldedTerm.length)
  }
  return matches
}

/**
 * Wrap each matched range of a text node in a mark tag. Ranges are applied last
 * to first so earlier offsets stay valid while the node is being split.
 *
 * @param {Text} node - The text node to mark.
 * @param {Object[]} matches - The `{ start, end }` ranges to wrap.
 */
function wrapTextNodeMatches(node, matches) {
  for (const { start, end } of [...matches].reverse()) {
    const range = node.ownerDocument.createRange()
    range.setStart(node, start)
    range.setEnd(node, end)
    const mark = node.ownerDocument.createElement('mark')
    mark.className = 'local-search-term'
    range.surroundContents(mark)
  }
}

/**
 * Highlight term occurrences inside an HTML string, matching text nodes only
 * (never attributes, never across element boundaries), with the same case and
 * diacritic folding as the backend artifact search.
 *
 * @param {string} [html=''] - The HTML content to mark.
 * @param {string} [term=''] - The search term.
 * @return {string} - The HTML with `<mark class="local-search-term">` around matches.
 */
export function addLocalSearchMarksClassInHtml(html = '', term = '') {
  const trimmedTerm = term.trim()
  if (!trimmedTerm) {
    return html
  }
  const { folded: foldedTerm } = foldWithSourceIndexes(trimmedTerm)
  const parsed = new DOMParser().parseFromString(html, 'text/html')
  const walker = parsed.createTreeWalker(parsed.body, NodeFilter.SHOW_TEXT)
  // Collect first: wrapping mutates the tree and would derail a live walker
  const textNodes = []
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode)
  }
  for (const node of textNodes) {
    wrapTextNodeMatches(node, findFoldedMatches(node.nodeValue, foldedTerm))
  }
  return parsed.body.innerHTML
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/utils/strings.spec.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/strings.js tests/unit/specs/utils/strings.spec.js
git commit -m "feat(utils): mark folded term matches inside rendered html"
```

---

### Task 3: `useStructureArtifact` composable

**Files:**
- Create: `src/composables/useStructureArtifact.js`
- Test: `tests/unit/specs/composables/useStructureArtifact.spec.js`

**Interfaces:**
- Consumes: `api.getStructureManifest(index, id, routing)` from Task 1.
- Produces: `useStructureArtifact(document)` → `{ manifest, hasMarkdown, pages, fetchManifest }` where `document` is a plain object, ref or getter with `{ index, id, routing }`; `hasMarkdown` is a computed boolean; `pages` a computed number (0 when no markdown); `fetchManifest()` an async probe.

The stale-document-id guard is lifted from `useDocumentDownload` on branch `feat/markdown-download`; when that PR lands, it should be refactored to consume this composable (out of this plan's scope). Note: the spec names this method `fetch`; it is `fetchManifest` here for explicitness.

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/specs/composables/useStructureArtifact.spec.js`:

```js
import { ref } from 'vue'

import { useStructureArtifact } from '@/composables/useStructureArtifact'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const { apiInstance } = await importOriginal()

  return {
    apiInstance: {
      ...apiInstance,
      getStructureManifest: vi.fn()
    }
  }
})

describe('useStructureArtifact', () => {
  const document = { index: 'foo', id: 'doc-id', routing: 'root-id' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('probes the manifest of the given document', async () => {
    api.getStructureManifest.mockResolvedValue({ pages: 3, formats: ['md'] })
    const { fetchManifest } = useStructureArtifact(document)
    await fetchManifest()
    expect(api.getStructureManifest).toBeCalledWith('foo', 'doc-id', 'root-id')
  })

  it('has markdown when the manifest advertises md pages', async () => {
    api.getStructureManifest.mockResolvedValue({ pages: 3, formats: ['md', 'xhtml'] })
    const { hasMarkdown, pages, fetchManifest } = useStructureArtifact(document)
    await fetchManifest()
    expect(hasMarkdown.value).toBe(true)
    expect(pages.value).toBe(3)
  })

  it('has no markdown before the probe resolves', () => {
    const { hasMarkdown, pages } = useStructureArtifact(document)
    expect(hasMarkdown.value).toBe(false)
    expect(pages.value).toBe(0)
  })

  it('has no markdown when the probe fails closed', async () => {
    api.getStructureManifest.mockResolvedValue(null)
    const { hasMarkdown, fetchManifest } = useStructureArtifact(document)
    await fetchManifest()
    expect(hasMarkdown.value).toBe(false)
  })

  it('has no markdown when the md format is missing', async () => {
    api.getStructureManifest.mockResolvedValue({ pages: 3, formats: ['xhtml'] })
    const { hasMarkdown, fetchManifest } = useStructureArtifact(document)
    await fetchManifest()
    expect(hasMarkdown.value).toBe(false)
  })

  it('has no markdown when the manifest has zero pages', async () => {
    api.getStructureManifest.mockResolvedValue({ pages: 0, formats: ['md'] })
    const { hasMarkdown, fetchManifest } = useStructureArtifact(document)
    await fetchManifest()
    expect(hasMarkdown.value).toBe(false)
  })

  it('ignores a manifest that describes another document', async () => {
    api.getStructureManifest.mockResolvedValue({ pages: 3, formats: ['md'] })
    const documentRef = ref(document)
    const { hasMarkdown, fetchManifest } = useStructureArtifact(documentRef)
    await fetchManifest()
    documentRef.value = { index: 'foo', id: 'other-id', routing: 'other-id' }
    expect(hasMarkdown.value).toBe(false)
  })

  it('does not probe without a document id', async () => {
    const { fetchManifest } = useStructureArtifact({ index: 'foo' })
    await fetchManifest()
    expect(api.getStructureManifest).not.toBeCalled()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn test:unit tests/unit/specs/composables/useStructureArtifact.spec.js`
Expected: FAIL, cannot resolve `@/composables/useStructureArtifact`.

- [ ] **Step 3: Write the implementation**

Create `src/composables/useStructureArtifact.js`:

```js
import { computed, ref, toRef } from 'vue'

import { apiInstance as api } from '@/api/apiInstance'

const MARKDOWN_FORMAT = 'md'

/**
 * Probe the structure artifact manifest of a document and tell whether a
 * markdown rendering is available for it.
 *
 * @param {Object|import('vue').Ref|Function} document - Document with `index`, `id` and `routing`.
 * @returns {Object} `{ manifest, hasMarkdown, pages, fetchManifest }`
 */
export function useStructureArtifact(document) {
  const documentRef = toRef(document)
  const manifest = ref(null)

  // The manifest carries the id of the document it describes: a component
  // handed another document (a slow probe resolving after the user moved on)
  // must not trust the manifest of the previous one.
  const hasMarkdown = computed(() => {
    const { documentId, pages = 0, formats = [] } = manifest.value ?? {}
    return documentId === documentRef.value?.id && pages > 0 && formats.includes(MARKDOWN_FORMAT)
  })

  const pages = computed(() => {
    return hasMarkdown.value ? manifest.value.pages : 0
  })

  async function fetchManifest() {
    const { index, id, routing } = documentRef.value ?? {}
    if (!index || !id) {
      return
    }
    const fetched = await api.getStructureManifest(index, id, routing)
    manifest.value = { ...fetched, documentId: id }
  }

  return { manifest, hasMarkdown, pages, fetchManifest }
}

export default useStructureArtifact
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/composables/useStructureArtifact.spec.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/composables/useStructureArtifact.js tests/unit/specs/composables/useStructureArtifact.spec.js
git commit -m "feat(document): add a structure artifact probe composable"
```

---

### Task 4: `DocumentContentMarkdown` component

**Files:**
- Create: `src/components/Document/DocumentContentMarkdown.vue`
- Modify: `src/lang/en.json` (add `documentContentMarkdown` block, alphabetically near `documentContent` at line ~443)
- Modify: `src/lang/fr.json` (same block, French)
- Test: `tests/unit/specs/components/Document/DocumentContentMarkdown.spec.js`

**Interfaces:**
- Consumes: `api.getStructurePage(index, id, page, routing)` (Task 1), `addLocalSearchMarksClassInHtml(html, term)` (Task 2), existing `renderMarkdown(source)` from `@/utils/markdown`, `usePipelinesStore().applyPipelineChainByCategory('markdown-text')`.
- Produces: `<document-content-markdown :document :page :term :active-match @fallback>` — props `document` (Object, required), `page` (Number, default 1), `term` (String, default ''), `activeMatch` (Number, 1-based nth mark in the page, 0 = none); emits `fallback` when the user asks for the plain-text view from the error state.

Sanitization boundary (from the spec): the HTML comes exclusively from `renderMarkdown` (rehype-sanitize) plus our own `<mark>` tags; it must NOT pass through the `extracted-text` pipelines whose xss whitelist would strip the markup. The `markdown-text` pipeline category is applied for plugin extensibility; core registers nothing under it.

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/specs/components/Document/DocumentContentMarkdown.spec.js`:

```js
import { mount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentContentMarkdown from '@/components/Document/DocumentContentMarkdown'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const { apiInstance } = await importOriginal()

  return {
    apiInstance: {
      ...apiInstance,
      getStructurePage: vi.fn()
    }
  }
})

window.HTMLElement.prototype.scrollIntoView = vi.fn()

describe('DocumentContentMarkdown.vue', () => {
  const document = { index: 'foo', id: 'doc-id', routing: 'root-id' }

  let core

  beforeEach(() => {
    vi.clearAllMocks()
    core = CoreSetup.init().useAll()
    api.getStructurePage.mockResolvedValue('# Hello *world*')
  })

  async function mountComponent(props = {}) {
    const { plugins } = core
    const wrapper = mount(DocumentContentMarkdown, { props: { document, page: 1, ...props }, global: { plugins } })
    await flushPromises()
    await flushPromises()
    return wrapper
  }

  it('fetches and renders the markdown page as sanitized html', async () => {
    const wrapper = await mountComponent()
    expect(api.getStructurePage).toBeCalledWith('foo', 'doc-id', 1, 'root-id')
    expect(wrapper.find('h1').text()).toBe('Hello world')
    expect(wrapper.find('em').text()).toBe('world')
  })

  it('fetches a page only once', async () => {
    const wrapper = await mountComponent()
    await wrapper.setProps({ page: 2 })
    await flushPromises()
    await wrapper.setProps({ page: 1 })
    await flushPromises()
    const firstPageCalls = api.getStructurePage.mock.calls.filter(([, , page]) => page === 1)
    expect(firstPageCalls).toHaveLength(1)
  })

  it('marks the term occurrences in the rendered page', async () => {
    api.getStructurePage.mockResolvedValue('# Hello world\n\nhello again')
    const wrapper = await mountComponent({ term: 'hello' })
    expect(wrapper.findAll('mark.local-search-term')).toHaveLength(2)
  })

  it('activates the nth mark and scrolls to it', async () => {
    api.getStructurePage.mockResolvedValue('hello and hello')
    const wrapper = await mountComponent({ term: 'hello', activeMatch: 2 })
    const marks = wrapper.findAll('mark.local-search-term')
    expect(marks[0].classes()).not.toContain('local-search-term--active')
    expect(marks[1].classes()).toContain('local-search-term--active')
  })

  it('clamps the active mark to the marks the dom actually shows', async () => {
    api.getStructurePage.mockResolvedValue('a single hello')
    const wrapper = await mountComponent({ term: 'hello', activeMatch: 5 })
    const marks = wrapper.findAll('mark.local-search-term')
    expect(marks).toHaveLength(1)
    expect(marks[0].classes()).toContain('local-search-term--active')
  })

  it('shows an inline error with a retry button when the page fetch fails', async () => {
    api.getStructurePage.mockRejectedValue(new Error('Network Error'))
    const wrapper = await mountComponent()
    expect(wrapper.find('.document-content-markdown__error').exists()).toBe(true)
    api.getStructurePage.mockResolvedValue('# Recovered')
    await wrapper.find('.document-content-markdown__error__retry').trigger('click')
    await flushPromises()
    await flushPromises()
    expect(wrapper.find('h1').text()).toBe('Recovered')
  })

  it('emits fallback when the user asks for the plain text view', async () => {
    api.getStructurePage.mockRejectedValue(new Error('Network Error'))
    const wrapper = await mountComponent()
    await wrapper.find('.document-content-markdown__error__fallback').trigger('click')
    expect(wrapper.emitted('fallback')).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn test:unit tests/unit/specs/components/Document/DocumentContentMarkdown.spec.js`
Expected: FAIL, cannot resolve `@/components/Document/DocumentContentMarkdown`.

- [ ] **Step 3: Write the component**

Create `src/components/Document/DocumentContentMarkdown.vue`:

```vue
<script setup>
import { computed, nextTick, reactive, ref, toRef, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { addLocalSearchMarksClassInHtml } from '@/utils/strings'
import { renderMarkdown } from '@/utils/markdown'
import { usePipelinesStore } from '@/store/modules'
import { apiInstance as api } from '@/api/apiInstance'

/**
 * Display one markdown structure page of a document, with local search marks.
 */
const props = defineProps({
  /**
   * The selected document
   */
  document: {
    type: Object,
    required: true
  },
  /**
   * The structure page to display (1-based)
   */
  page: {
    type: Number,
    default: 1
  },
  /**
   * Local search term to mark in the rendered page
   */
  term: {
    type: String,
    default: ''
  },
  /**
   * 1-based index of the mark to activate in this page, 0 for none
   */
  activeMatch: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['fallback'])

const { t } = useI18n()
const pipelinesStore = usePipelinesStore()
const elementRef = useTemplateRef('element')

const renderedPages = reactive({})
const cookedHtml = ref('')
const error = ref(null)
const loading = ref(false)

const markedHtml = computed(() => {
  return addLocalSearchMarksClassInHtml(renderedPages[props.page] ?? '', props.term)
})

async function loadPage() {
  error.value = null
  loading.value = true
  try {
    await renderPageOnce()
  }
  catch (loadError) {
    error.value = loadError
  }
  finally {
    loading.value = false
  }
}

async function renderPageOnce() {
  if (renderedPages[props.page]) {
    return
  }
  const { index, id, routing } = props.document
  const markdown = await api.getStructurePage(index, id, props.page, routing)
  renderedPages[props.page] = await renderMarkdown(markdown)
}

// Plugins can transform the markdown body through the `markdown-text`
// category; core registers nothing under it, so by default this resolves
// to the marked HTML unchanged.
async function cookHtml(html) {
  cookedHtml.value = await pipelinesStore.applyPipelineChainByCategory('markdown-text')(html)
  await nextTick()
  activateMatch()
}

function activateMatch() {
  const marks = elementRef.value?.querySelectorAll('.local-search-term') ?? []
  marks.forEach(mark => mark.classList.remove('local-search-term--active'))
  if (!props.activeMatch || !marks.length) {
    return
  }
  // Counts come from the markdown source while marks come from the rendered
  // DOM, so the nth match may not exist here: clamp to the last mark rather
  // than highlighting nothing.
  const active = marks[Math.min(props.activeMatch, marks.length) - 1]
  active.classList.add('local-search-term--active')
  active.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' })
}

watch(toRef(props, 'page'), loadPage, { immediate: true })
watch(markedHtml, cookHtml, { immediate: true })
watch(toRef(props, 'activeMatch'), activateMatch, { flush: 'post' })
</script>

<template>
  <div
    ref="element"
    class="document-content-markdown"
  >
    <div
      v-if="loading"
      class="document-content-markdown__loading p-3 text-center"
    >
      <b-spinner />
    </div>
    <b-alert
      v-else-if="error"
      :model-value="true"
      variant="warning"
      class="document-content-markdown__error"
    >
      {{ t('documentContentMarkdown.error') }}
      <div class="mt-2 d-flex gap-2">
        <b-button
          size="sm"
          variant="outline-secondary"
          class="document-content-markdown__error__retry"
          @click="loadPage"
        >
          {{ t('documentContentMarkdown.retry') }}
        </b-button>
        <b-button
          size="sm"
          variant="outline-secondary"
          class="document-content-markdown__error__fallback"
          @click="emit('fallback')"
        >
          {{ t('documentContentMarkdown.fallback') }}
        </b-button>
      </div>
    </b-alert>
    <!--
      Safe to use v-html here: `cookedHtml` derives from renderMarkdown(), which
      sanitizes the content (no raw HTML, no remote images, hardened links),
      plus our own mark tags.
    -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div
      v-else
      class="document-content-markdown__body"
      v-html="cookedHtml"
    />
  </div>
</template>

<style lang="scss" scoped>
.document-content-markdown {
  &__body {
    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      margin-top: $spacer;
    }

    :deep(table) {
      border-collapse: collapse;

      th,
      td {
        border: 1px solid var(--bs-border-color);
        padding: $spacer-xxs $spacer-xs;
      }
    }

    :deep(pre) {
      padding: $spacer;
      overflow-x: auto;
      background: var(--bs-tertiary-bg);
      border-radius: var(--bs-border-radius);
    }

    :deep(blockquote) {
      margin: 0;
      padding-left: $spacer;
      border-left: 4px solid var(--bs-border-color);
    }
  }
}
</style>
```

- [ ] **Step 4: Add the i18n keys**

In `src/lang/en.json`, after the `documentContent` block (line ~445):

```json
"documentContentMarkdown": {
  "error": "The formatted view of this page could not be loaded.",
  "retry": "Try again",
  "fallback": "View as plain text"
},
```

In `src/lang/fr.json`, at the equivalent alphabetical position:

```json
"documentContentMarkdown": {
  "error": "Impossible de charger la mise en forme de cette page.",
  "retry": "Réessayer",
  "fallback": "Afficher en texte brut"
},
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/components/Document/DocumentContentMarkdown.spec.js`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/Document/DocumentContentMarkdown.vue src/lang/en.json src/lang/fr.json tests/unit/specs/components/Document/DocumentContentMarkdown.spec.js
git commit -m "feat(document): render a markdown structure page with search marks"
```

---

### Task 5: Markdown mode in `DocumentContent` (gating, toggle, pagination, body)

**Files:**
- Modify: `src/components/Document/DocumentContent.vue`
- Modify: `src/lang/en.json`, `src/lang/fr.json` (extend the `documentContent` block)
- Test: `tests/unit/specs/components/Document/DocumentContent.spec.js`

**Interfaces:**
- Consumes: `useStructureArtifact` (Task 3), `DocumentContentMarkdown` (Task 4).
- Produces (used by Task 6): `isMarkdownMode` (computed boolean), `preferMarkdown` (ref, default `true`), `markdownPage` (ref, 1-based), `markdownPagesCount` (computed, aliased from the composable's `pages`), `isTranslation` (computed).

Gating (from the spec): markdown mode is active when the probe found `md` pages AND no translation is selected AND the toggle is on markdown. Everything else is the unchanged text path. No PDF-only, server-mode, `artifactDir` or Tika-version checks.

- [ ] **Step 1: Extend the api mock and write the failing tests**

In `tests/unit/specs/components/Document/DocumentContent.spec.js`, extend the existing `vi.mock('@/api/apiInstance', ...)` block with the three new methods so every existing test keeps its behavior (probe fails closed by default):

```js
vi.mock('@/api/apiInstance', async (importOriginal) => {
  const { apiInstance } = await importOriginal()

  return {
    apiInstance: {
      ...apiInstance,
      getDocumentSlice: vi.fn(),
      getPages: vi.fn().mockResolvedValue([]),
      searchDocument: vi.fn(),
      getStructureManifest: vi.fn().mockResolvedValue(null),
      getStructurePage: vi.fn().mockResolvedValue(''),
      searchStructurePages: vi.fn().mockResolvedValue({ count: 0, pages: 0, scanned: 0, hits: [] })
    }
  }
})
```

Then append a new `describe` block (it reuses the file's existing `mockDocumentContentSlice` helper):

```js
describe('markdown mode', () => {
  beforeEach(() => {
    api.getStructureManifest.mockResolvedValue({ pages: 3, formats: ['md'] })
    api.getStructurePage.mockResolvedValue('# Hello world')
  })

  it('renders the markdown body by default when the document has markdown', async () => {
    const { document } = await mockDocumentContentSlice('Hello world')
    const { plugins } = core
    const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
    await flushPromises()
    expect(wrapper.findComponent({ name: 'DocumentContentMarkdown' }).exists()).toBe(true)
    expect(wrapper.find('.document-content__body').exists()).toBe(false)
  })

  it('renders the plain text body when the document has no markdown', async () => {
    api.getStructureManifest.mockResolvedValue(null)
    const { document } = await mockDocumentContentSlice('Hello world')
    const { plugins } = core
    const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
    await flushPromises()
    expect(wrapper.findComponent({ name: 'DocumentContentMarkdown' }).exists()).toBe(false)
    expect(wrapper.find('.document-content__body').exists()).toBe(true)
  })

  it('shows the view toggle only when the document has markdown', async () => {
    const { document } = await mockDocumentContentSlice('Hello world')
    const { plugins } = core
    const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
    await flushPromises()
    expect(wrapper.find('.document-content__togglers__view').exists()).toBe(true)
  })

  it('hides the view toggle when the document has no markdown', async () => {
    api.getStructureManifest.mockResolvedValue(null)
    const { document } = await mockDocumentContentSlice('Hello world')
    const { plugins } = core
    const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
    await flushPromises()
    expect(wrapper.find('.document-content__togglers__view').exists()).toBe(false)
  })

  it('renders the plain text body once the toggle is set to text', async () => {
    const { document } = await mockDocumentContentSlice('Hello world')
    const { plugins } = core
    const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
    await flushPromises()
    wrapper.vm.preferMarkdown = false
    await flushPromises()
    expect(wrapper.findComponent({ name: 'DocumentContentMarkdown' }).exists()).toBe(false)
    expect(wrapper.find('.document-content__body').exists()).toBe(true)
  })

  it('forces the plain text body when a translation is selected', async () => {
    const { document } = await mockDocumentContentSlice('Hello world')
    const { plugins } = core
    const props = { document, targetLanguage: 'ENGLISH' }
    const wrapper = shallowMount(DocumentContent, { props, global: { plugins } })
    await flushPromises()
    expect(wrapper.findComponent({ name: 'DocumentContentMarkdown' }).exists()).toBe(false)
  })

  it('paginates by the manifest page count in markdown mode', async () => {
    const { document } = await mockDocumentContentSlice('Hello world')
    const { plugins } = core
    const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
    await flushPromises()
    expect(wrapper.vm.nbPages).toBe(3)
  })

  it('navigates markdown pages through the page model', async () => {
    const { document } = await mockDocumentContentSlice('Hello world')
    const { plugins } = core
    const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
    await flushPromises()
    wrapper.vm.page = 2
    await flushPromises()
    expect(wrapper.vm.markdownPage).toBe(2)
  })

  it('goes back to the first page when toggling to unaligned plain text', async () => {
    const { document } = await mockDocumentContentSlice('Hello world')
    const { plugins } = core
    const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
    await flushPromises()
    wrapper.vm.page = 2
    await flushPromises()
    wrapper.vm.preferMarkdown = false
    await flushPromises()
    expect(wrapper.vm.page).toBe(1)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn test:unit tests/unit/specs/components/Document/DocumentContent.spec.js`
Expected: the new `markdown mode` tests FAIL (no `DocumentContentMarkdown`, no `preferMarkdown`); every pre-existing test still PASSES.

- [ ] **Step 3: Wire markdown mode into `DocumentContent.vue`**

All edits in `src/components/Document/DocumentContent.vue`.

3a. Imports (respect the existing grouping):

```js
import { useStructureArtifact } from '@/composables/useStructureArtifact'
import DocumentContentMarkdown from '@/components/Document/DocumentContentMarkdown'
```

3b. After the `useWait` line (line ~47), the probe and the mode state. The composable's `pages` is aliased: this component already owns a `pages` computed for text slices:

```js
const { hasMarkdown, pages: markdownPagesCount, fetchManifest } = useStructureArtifact(toRef(props, 'document'))

const preferMarkdown = ref(true)
const markdownPage = ref(1)

const isTranslation = computed(() => {
  return !!props.targetLanguage && props.targetLanguage !== 'original'
})

const isMarkdownMode = computed(() => {
  return hasMarkdown.value && !isTranslation.value && preferMarkdown.value
})
```

3c. Branch `nbPages` (replace the current body, line ~131):

```js
const nbPages = computed(() => {
  if (isMarkdownMode.value) {
    return markdownPagesCount.value
  }
  if (syncedPages.value?.length) {
    return syncedPages.value.length
  }
  return Math.floor(maxOffset.value / props.pageSize) + 1
})
```

3d. Branch the `page` model (replace the current computed, line ~114):

```js
const page = computed({
  get() {
    if (isMarkdownMode.value) {
      return markdownPage.value
    }
    return offsets.value.indexOf(activeContentSliceOffset.value) + 1 || 1
  },
  set(value) {
    scrollToDocumentStart()
    if (isMarkdownMode.value) {
      markdownPage.value = value
      return
    }
    activeContentSliceOffset.value = offsets.value[value - 1] || 0
  }
})
```

3e. Guard the existing `page` watcher (line ~167) so markdown navigation does not trigger text-slice loading:

```js
watch(page, async () => {
  if (isMarkdownMode.value) {
    return
  }
  const offset = activeContentSliceOffset.value
  await activateContentSlice({ offset })
})
```

3f. Show pagination in markdown mode too (replace `showPagination`, line ~94):

```js
const showPagination = computed(() => {
  return nbPages.value > 1 && (isMarkdownMode.value || loadedOnce.value)
})
```

3g. Probe on mount, in parallel with the existing max-offset load (replace the first line of `onMounted`, line ~178):

```js
onMounted(async () => {
  await Promise.all([loadMaxOffset(), fetchManifest()])
  await syncPages()
  if (props.q) {
    await retrieveOccurrencesAndUpdateContent()
  }
  else {
    await activateContentSlice({ offset: 0 })
  }
})
```

3h. Keep the page position across an aligned toggle, reset it otherwise (add after the other watchers):

```js
watch(isMarkdownMode, (markdown) => {
  syncPagePosition(markdown)
})

// Both paginations describe the same physical pages when their counts match,
// so the page number survives the toggle; anything else has no page
// correspondence and goes back to the first page.
function syncPagePosition(markdown) {
  const aligned = !!syncedPages.value?.length && syncedPages.value.length === markdownPagesCount.value
  if (markdown) {
    markdownPage.value = aligned ? offsets.value.indexOf(activeContentSliceOffset.value) + 1 || 1 : 1
  }
  else {
    activeContentSliceOffset.value = aligned ? offsets.value[markdownPage.value - 1] ?? 0 : 0
  }
}
```

3i. Add the mode to `classList` (line ~107):

```js
const classList = computed(() => {
  return {
    'document-content--paginated': showPagination.value,
    'document-content--markdown': isMarkdownMode.value,
    'document-content--rtl': isRightToLeft.value
  }
})
```

3j. Template: the toggle goes inside the existing togglers `div` (line ~414), between the two hooks:

```vue
<b-form-radio-group
  v-if="hasMarkdown"
  v-model="preferMarkdown"
  buttons
  button-variant="outline-secondary"
  size="sm"
  :disabled="isTranslation"
  :title="isTranslation ? t('documentContent.view.translationTooltip') : undefined"
  class="document-content__togglers__view"
>
  <b-form-radio :value="true">{{ t('documentContent.view.markdown') }}</b-form-radio>
  <b-form-radio :value="false">{{ t('documentContent.view.text') }}</b-form-radio>
</b-form-radio-group>
```

3k. Template: the body branch (replace the current `v-if="hasExtractedContent"` div, line ~427). `term` and `active-match` stay inert until Task 6 wires them:

The `document-content__body` class on the component root keeps the existing RTL rule
(`.document-content--rtl &__body`) working for markdown; the `--markdown` modifier
undoes `word-break: break-all`, which is meant for raw extracted text, not prose.

```vue
<document-content-markdown
  v-if="isMarkdownMode"
  class="document-content__body document-content__body--markdown"
  :document="document"
  :page="markdownPage"
  :term="localSearchTerm"
  :active-match="activeMarkdownMatch"
  @fallback="preferMarkdown = false"
/>
<div
  v-else-if="hasExtractedContent"
  class="document-content__body"
  v-html="currentContentPage"
/>
```

3l. Style: in the component's `<style>` block, inside `.document-content`, after the
`&__body` rule (line ~469):

```scss
&__body--markdown {
  word-break: normal;
}
```

Until Task 6 exists, add the placeholder-free minimal computed next to the mode state so the template compiles (Task 6 replaces its body with the real match logic):

```js
const activeMarkdownMatch = computed(() => 0)
```

- [ ] **Step 4: Add the i18n keys**

In `src/lang/en.json`, extend the `documentContent` block:

```json
"documentContent": {
  "noContent": "No content extracted for this document",
  "view": {
    "markdown": "Formatted",
    "text": "Plain text",
    "translationTooltip": "Translations are only available as plain text"
  }
},
```

In `src/lang/fr.json`, the equivalent block:

```json
"documentContent": {
  "noContent": "Aucun contenu extrait pour ce document",
  "view": {
    "markdown": "Mise en forme",
    "text": "Texte brut",
    "translationTooltip": "Les traductions ne sont disponibles qu'en texte brut"
  }
},
```

(Keep the existing `noContent` value from `fr.json` if it differs; only add the `view` object.)

- [ ] **Step 5: Run the tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/components/Document/DocumentContent.spec.js`
Expected: PASS, including every pre-existing test.

- [ ] **Step 6: Commit**

```bash
git add src/components/Document/DocumentContent.vue src/lang/en.json src/lang/fr.json tests/unit/specs/components/Document/DocumentContent.spec.js
git commit -m "feat(document): show the text tab as markdown with a plain-text toggle"
```

---

### Task 6: Markdown-native search in `DocumentContent`

**Files:**
- Modify: `src/components/Document/DocumentContent.vue`
- Test: `tests/unit/specs/components/Document/DocumentContent.spec.js`

**Interfaces:**
- Consumes: `api.searchStructurePages(index, id, query, routing)` (Task 1); `isMarkdownMode`, `markdownPage`, `preferMarkdown` (Task 5); `DocumentContentMarkdown` props `term`/`activeMatch` (Task 4).
- Produces: markdown-mode local search behavior (counter, prev/next, page navigation, `q` on mount), keeping the text-mode machinery untouched.

- [ ] **Step 1: Write the failing tests**

Append inside the `describe('markdown mode', ...)` block from Task 5:

```js
describe('local search', () => {
  beforeEach(() => {
    api.searchStructurePages.mockResolvedValue({
      count: 3,
      pages: 3,
      scanned: 3,
      hits: [
        { page: 2, count: 1 },
        { page: 3, count: 2 }
      ]
    })
  })

  it('searches the structure pages instead of the raw content', async () => {
    const { document } = await mockDocumentContentSlice('Hello world')
    const { plugins } = core
    const wrapper = shallowMount(DocumentContent, { props: { document, q: ' hello ' }, global: { plugins } })
    await flushPromises()
    // Assert on the leading arguments only: the routing value depends on how the
    // fixture document was indexed, and this test is about the trimmed query.
    const [project, documentId, query] = api.searchStructurePages.mock.calls[0]
    expect([project, documentId, query]).toEqual([index, 'document', 'hello'])
    expect(api.searchDocument).not.toBeCalled()
  })

  it('lands on the first hit page with the occurrences count', async () => {
    const { document } = await mockDocumentContentSlice('Hello world')
    const { plugins } = core
    const wrapper = shallowMount(DocumentContent, { props: { document, q: 'hello' }, global: { plugins } })
    await flushPromises()
    expect(wrapper.vm.localSearchOccurrences).toBe(3)
    expect(wrapper.vm.localSearchIndex).toBe(1)
    expect(wrapper.vm.markdownPage).toBe(2)
  })

  it('navigates to the next occurrence page and match', async () => {
    const { document } = await mockDocumentContentSlice('Hello world')
    const { plugins } = core
    const wrapper = shallowMount(DocumentContent, { props: { document, q: 'hello' }, global: { plugins } })
    await flushPromises()
    wrapper.vm.localSearchIndex = 2
    await flushPromises()
    expect(wrapper.vm.markdownPage).toBe(3)
    expect(wrapper.vm.activeMarkdownMatch).toBe(1)
    wrapper.vm.localSearchIndex = 3
    await flushPromises()
    expect(wrapper.vm.markdownPage).toBe(3)
    expect(wrapper.vm.activeMarkdownMatch).toBe(2)
  })

  it('degrades to zero occurrences when the search fails', async () => {
    api.searchStructurePages.mockRejectedValue(new Error('Network Error'))
    const { document } = await mockDocumentContentSlice('Hello world')
    const { plugins } = core
    const wrapper = shallowMount(DocumentContent, { props: { document, q: 'hello' }, global: { plugins } })
    await flushPromises()
    expect(wrapper.vm.localSearchOccurrences).toBe(0)
    expect(wrapper.vm.localSearchIndex).toBe(0)
  })

  it('re-runs the search through the raw content when toggling to plain text', async () => {
    api.searchDocument.mockResolvedValue({ count: 1, offsets: [0] })
    const { document } = await mockDocumentContentSlice('Hello world')
    const { plugins } = core
    const wrapper = shallowMount(DocumentContent, { props: { document, q: 'hello' }, global: { plugins } })
    await flushPromises()
    wrapper.vm.preferMarkdown = false
    await flushPromises()
    const [project, documentId, query] = api.searchDocument.mock.calls[0]
    expect([project, documentId, query]).toEqual([index, 'document', 'hello'])
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn test:unit tests/unit/specs/components/Document/DocumentContent.spec.js`
Expected: the new `local search` tests FAIL (`searchDocument` is called instead of `searchStructurePages`); everything else PASSES.

- [ ] **Step 3: Wire the markdown search**

All edits in `src/components/Document/DocumentContent.vue`.

3a. State, next to `markdownPage` (from Task 5); `range` is already imported from lodash:

```js
const markdownMatches = ref([])
```

3b. Replace the Task 5 placeholder `activeMarkdownMatch` with the real logic:

```js
const activeMarkdownMatch = computed(() => {
  const match = markdownMatches.value[localSearchIndex.value - 1]
  if (match && match.page === markdownPage.value) {
    return match.nth
  }
  return 0
})
```

3c. Branch `retrieveTotalOccurrences` (line ~306). Rename the current body to `retrieveTextOccurrences` and add the markdown variant:

```js
async function retrieveTotalOccurrences() {
  if (isMarkdownMode.value) {
    return retrieveMarkdownOccurrences()
  }
  return retrieveTextOccurrences()
}

async function retrieveTextOccurrences() {
  try {
    if (!hasLocalSearchTerms.value) {
      throw new Error('No local search terms')
    }
    const query = localSearchTerm.value
    const targetLanguage = props.targetLanguage
    const { count, offsets } = await api.searchDocument(docIndex.value, docId.value, query, targetLanguage, docRouting.value)
    localSearchIndexes.value = offsets
    localSearchOccurrences.value = count
    localSearchIndex.value = Number(!!count)
  }
  catch {
    localSearchIndexes.value = []
    localSearchOccurrences.value = 0
    localSearchIndex.value = 0
  }
}

async function retrieveMarkdownOccurrences() {
  try {
    // The endpoint answers 400 to a blank query, so trim before asking
    const query = localSearchTerm.value?.trim()
    if (!query) {
      throw new Error('No local search terms')
    }
    const { count, hits } = await api.searchStructurePages(docIndex.value, docId.value, query, docRouting.value)
    markdownMatches.value = flattenPageHits(hits)
    localSearchOccurrences.value = count
    localSearchIndex.value = Number(!!count)
  }
  catch {
    markdownMatches.value = []
    localSearchOccurrences.value = 0
    localSearchIndex.value = 0
  }
}

// One entry per occurrence, in page order, so the flat local search index
// maps straight to a page and a 1-based rank within that page.
function flattenPageHits(hits = []) {
  return hits.flatMap(({ page, count }) => {
    return range(count).map(nth => ({ page, nth: nth + 1 }))
  })
}
```

3d. Branch `updateContent` (line ~301):

```js
async function updateContent() {
  if (isMarkdownMode.value) {
    return updateMarkdownContent()
  }
  await activateContentSliceAround()
  await jumpToActiveLocalSearchTerm()
}

function updateMarkdownContent() {
  const match = markdownMatches.value[localSearchIndex.value - 1]
  if (match) {
    markdownPage.value = match.page
  }
}
```

3e. Re-run the active search under the machinery of the new mode when the toggle flips (extend the Task 5 watcher):

```js
watch(isMarkdownMode, async (markdown) => {
  syncPagePosition(markdown)
  if (hasLocalSearchTerms.value) {
    await retrieveOccurrencesAndUpdateContent()
  }
})
```

3f. Pass a trimmed term to the markdown body (template, from Task 5): change `:term="localSearchTerm"` to `:term="localSearchTerm?.trim() ?? ''"` so the DOM marks match what the endpoint counted.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/components/Document/DocumentContent.spec.js`
Expected: PASS, including Task 5's tests and every pre-existing test.

- [ ] **Step 5: Commit**

```bash
git add src/components/Document/DocumentContent.vue tests/unit/specs/components/Document/DocumentContent.spec.js
git commit -m "feat(document): search inside the markdown pages of the text tab"
```

---

### Task 7: Full verification and manual QA

**Files:** none created; fixes only if verification fails.

- [ ] **Step 1: Run the whole unit suite**

Run: `yarn test:unit`
Expected: PASS. Fix any regression before continuing (the plain-text path must be untouched).

- [ ] **Step 2: Run the linter**

Run: `yarn lint`
Expected: clean. `yarn lint:fix` for mechanical issues; separate pre-existing warnings from new ones and only fix the new ones.

- [ ] **Step 3: Manual QA against the local backend**

Prerequisites: a local ICIJ/datashare build of branch `feat/artifacts-structure-search` running on port 8080 with `artifactDir` configured and at least one indexed PDF (its artifacts on disk), then `yarn serve` here.

Checklist:
- A document with artifacts opens the Text tab in markdown, paginated by real pages.
- The Formatted / Plain text toggle switches the body; page 1 is restored on unaligned switches.
- A document without artifacts renders exactly as before, no toggle.
- Selecting a translation forces plain text and disables the toggle with the tooltip.
- Typing in the local search while in markdown: counter matches the backend, prev/next hops pages, active mark scrolls into view, diacritic variants are highlighted.
- Opening the document from search results (`q` set) lands on the first hit page with marks.
- Kill the backend mid-navigation: the page error alert shows with working Retry and View-as-plain-text buttons, no toast flood.

- [ ] **Step 4: Report**

No commit. Report the QA results (including anything skipped) before any push; per repo convention, ask before pushing if CI status matters.
