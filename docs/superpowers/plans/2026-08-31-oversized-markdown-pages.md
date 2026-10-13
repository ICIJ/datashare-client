# Oversized Markdown Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the document text tab responsive when a markdown structure page is huge, by rendering markdown off the main thread, cheaply skipping off-screen layout, and falling back to plain text above a hard size ceiling.

**Architecture:** Three independent mitigations on the existing markdown flow (`DocumentContent.vue` → `DocumentContentMarkdown.vue` → `renderMarkdown()`): (1) `renderMarkdown` runs in a Web Worker, which requires injecting the page URL since the sanitizer's link constraining reads `window.location`; (2) direct children of the rendered body get `content-visibility: auto` so off-screen blocks skip layout/paint; (3) a page whose raw markdown exceeds a threshold is not rendered — the component emits `oversized`, the parent flips to the plain text view once per document, and flipping the dropdown back to "Formatted" is the reader's explicit "render anyway".

**Tech Stack:** Vue 3 `<script setup>`, unified/remark/rehype, Vite native workers (`new Worker(new URL(...), { type: 'module' })`), Vitest + jsdom (jsdom has no `Worker`, so tests exercise a synchronous fallback).

**Spec:** No spec file — bounded design approved in chat (2026-08-31). The Architecture paragraph above is the whole design.

## Global Constraints

- Work on a feature branch: `git checkout -b fix/oversized-markdown-pages` before the first commit.
- Commit with the `/commit` skill when available; otherwise plain `git commit` with a semantic message. Never add Claude co-author trailers or "Generated with Claude".
- Code style: no single-line `if` without braces; prefer intermediary variables over dense one-liners; comments only for a non-obvious *why*, never narrating what a line does; match the surrounding code's comment density (this codebase writes full-sentence why-comments).
- Run a single spec file with: `yarn test:unit <path/to/spec.js>`.
- New i18n copy goes in `src/lang/en.json` only (other locales are translated via Crowdin).

---

### Task 1: Inject the base URL into `renderMarkdown`

The link-constraining rehype plugin reads `window.location` (`src/utils/markdown.js:44` and `:83`), which does not exist in a worker (`self.location` there is the worker script URL, not the page). Thread a `base` option through instead, defaulting to `window.location.href` so existing callers are unchanged.

**Files:**
- Modify: `src/utils/markdown.js` (functions `resolveHref`, `rehypeConstrainLinks`, `renderMarkdown`)
- Test: `tests/unit/specs/utils/markdown.spec.js`

**Interfaces:**
- Produces: `renderMarkdown(source, { base = window.location.href } = {})` → `Promise<string>`. The `base` string is the page URL that same-host links are unwrapped against. Task 2's worker calls this with an explicit `base`.

- [ ] **Step 1: Write the failing tests**

Append to the top-level `describe('renderMarkdown', ...)` block in `tests/unit/specs/utils/markdown.spec.js`:

```js
  it('unwraps links matching the injected base host instead of the window host', async () => {
    const html = await renderMarkdown('[in-app](https://datashare.example/doc)', { base: 'https://datashare.example/' })
    expect(html).not.toContain('<a')
    expect(html).toContain('in-app')
  })

  it('hardens a window-host link as external when the injected base is another host', async () => {
    const windowHostUrl = `${window.location.origin}/somewhere`
    const html = await renderMarkdown(`[away](${windowHostUrl})`, { base: 'https://datashare.example/' })
    expect(html).toContain('target="_blank"')
  })
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn test:unit tests/unit/specs/utils/markdown.spec.js`
Expected: the two new tests FAIL (the first keeps the `<a>`, the second unwraps instead of hardening). All pre-existing tests still PASS.

- [ ] **Step 3: Implement the base injection**

In `src/utils/markdown.js`:

Replace `resolveHref` (keep its explanatory comment, adjust the first line):

```js
// An href resolved against the page showing the document, or null when the
// document's author wrote something that is not a URL at all. Authors control
// this string, and an unparseable one thrown from here would fail the whole
// document's render rather than the one link.
function resolveHref(href, base) {
  if (!URL.canParse(href, base)) {
    return null
  }
  return new URL(href, base)
}
```

In `rehypeConstrainLinks`, make the transformer read the base from the vfile (unified passes the file as second argument) and use it for both the resolution and the host comparison. Only the transformer signature and the two `window.location` reads change:

```js
function rehypeConstrainLinks() {
  return (tree, file) => {
    const base = file.data.base
    const baseHost = new URL(base).host
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'a') {
        return
      }
      const href = node.properties?.href
      if (typeof href !== 'string' || href.startsWith('#')) {
        return
      }
      const url = resolveHref(href, base)
      // Neither a URL nor a scheme that survives sanitization is a working
      // link: both are treated like the same-host ones below rather than left
      // for the reader to click on in vain.
      if (url === null || !linkableProtocols.includes(url.protocol)) {
        return unwrapLink(node, index, parent)
      }
      if (!webProtocols.includes(url.protocol)) {
        return
      }
      if (url.host === baseHost) {
        return unwrapLink(node, index, parent)
      }
      node.properties.rel = ['noopener', 'noreferrer', 'nofollow']
      node.properties.target = '_blank'
    })
  }
}
```

(The existing comment block above `rehypeConstrainLinks` stays as is.)

Replace `renderMarkdown` — the base travels on the vfile so concurrent calls cannot clobber each other, and the old "never blocks the main thread" claim (false: `await` does not move work off-thread) is dropped in favor of pointing at the worker entry Task 2 adds:

```js
/**
 * Convert Markdown source to sanitized, safe-to-render HTML.
 *
 * The unified pipeline runs synchronously on the calling thread; use
 * `renderMarkdownOffThread` from a component so a large document does not
 * freeze the page.
 *
 * @param {string} source - Raw markdown text.
 * @param {Object} [options={}] - The render options.
 * @param {string} [options.base=window.location.href] - Page URL that same-host links are unwrapped against.
 * @returns {Promise<string>} Sanitized HTML (empty string for empty input).
 */
export async function renderMarkdown(source, { base = window.location.href } = {}) {
  if (!source) {
    return ''
  }
  const value = normalizeHeaderlessTables(source)
  return String(await processor.process({ value, data: { base } }))
}
```

(The `renderMarkdownOffThread` reference becomes real in Task 2; the docstring is written once here to avoid touching this block twice.)

- [ ] **Step 4: Run the tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/utils/markdown.spec.js`
Expected: PASS, including all pre-existing link-hardening/unwrapping tests (they now flow through the `window.location.href` default).

- [ ] **Step 5: Run the other markdown consumers' specs**

Run: `yarn test:unit tests/unit/specs/components/Document/DocumentContentMarkdown.spec.js tests/unit/specs/components/Document/DocumentViewer/DocumentViewerMarkdown.spec.js`
Expected: PASS (both call `renderMarkdown(source)` with no options).

- [ ] **Step 6: Commit**

`fix(document): resolve markdown links against an injectable base URL`

---

### Task 2: Web worker rendering with a jsdom-safe fallback

**Files:**
- Create: `src/utils/markdown.worker.js`
- Modify: `src/utils/markdown.js` (append the off-thread client)
- Test: `tests/unit/specs/utils/markdown.spec.js`

**Interfaces:**
- Consumes: `renderMarkdown(source, { base })` from Task 1.
- Produces: `renderMarkdownOffThread(source)` → `Promise<string>`, exported from `@/utils/markdown`. Rejects with an `Error` if the worker-side render throws. Task 3 switches `DocumentContentMarkdown.vue` to it.
- Worker protocol: request `{ id: number, source: string, base: string }`, reply `{ id, html }` or `{ id, error: string }`.

- [ ] **Step 1: Write the failing tests**

Append a new top-level `describe` in `tests/unit/specs/utils/markdown.spec.js`. The import line at the top of the file becomes:

```js
import { renderMarkdown, renderMarkdownOffThread, normalizeHeaderlessTables } from '@/utils/markdown'
```

```js
describe('renderMarkdownOffThread', () => {
  it('renders inline when the environment has no Worker (jsdom)', async () => {
    expect(typeof Worker).toBe('undefined')
    const html = await renderMarkdownOffThread('# Hello')
    expect(html).toContain('<h1 id="hello">Hello</h1>')
  })

  // Stubbing Worker caches the fake in the module's singleton, so this test
  // must stay after every test that relies on the inline fallback above.
  it('resolves and rejects through the worker protocol', async () => {
    class FakeWorker {
      onmessage = null

      postMessage({ id, source }) {
        const reply = source === 'bad' ? { id, error: 'boom' } : { id, html: `<p>${source}</p>` }
        queueMicrotask(() => this.onmessage({ data: reply }))
      }
    }
    vi.stubGlobal('Worker', FakeWorker)
    try {
      await expect(renderMarkdownOffThread('good')).resolves.toBe('<p>good</p>')
      await expect(renderMarkdownOffThread('bad')).rejects.toThrow('boom')
    }
    finally {
      vi.unstubAllGlobals()
    }
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn test:unit tests/unit/specs/utils/markdown.spec.js`
Expected: FAIL — `renderMarkdownOffThread` is not exported.

- [ ] **Step 3: Create the worker entry**

Create `src/utils/markdown.worker.js`:

```js
import { renderMarkdown } from '@/utils/markdown'

// `base` always comes from the caller: in a worker, `self.location` is the
// worker script URL, not the page the document is shown on.
self.onmessage = async ({ data: { id, source, base } }) => {
  try {
    const html = await renderMarkdown(source, { base })
    self.postMessage({ id, html })
  }
  catch (error) {
    self.postMessage({ id, error: error.message })
  }
}
```

- [ ] **Step 4: Append the off-thread client to `src/utils/markdown.js`**

```js
let worker = null
let lastRenderId = 0
const pendingRenders = new Map()

function onWorkerMessage({ data: { id, html, error } }) {
  const pending = pendingRenders.get(id)
  pendingRenders.delete(id)
  if (!pending) {
    return
  }
  if (error === undefined) {
    pending.resolve(html)
  }
  else {
    pending.reject(new Error(error))
  }
}

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL('./markdown.worker.js', import.meta.url), { type: 'module' })
    worker.onmessage = onWorkerMessage
  }
  return worker
}

/**
 * Render markdown in a shared Web Worker so a large document cannot freeze
 * the page. Falls back to an inline render where workers do not exist (jsdom).
 *
 * @param {string} source - Raw markdown text.
 * @returns {Promise<string>} Sanitized HTML (empty string for empty input).
 */
export function renderMarkdownOffThread(source) {
  if (typeof Worker === 'undefined') {
    return renderMarkdown(source)
  }
  const id = ++lastRenderId
  const base = window.location.href
  return new Promise((resolve, reject) => {
    pendingRenders.set(id, { resolve, reject })
    getWorker().postMessage({ id, source, base })
  })
}
```

Note: `markdown.js` referencing its own worker file is not a circular import — `new URL(..., import.meta.url)` is an asset reference, and Vite bundles the worker as a separate entry.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/utils/markdown.spec.js`
Expected: PASS.

- [ ] **Step 6: Verify the worker builds**

Run: `yarn build 2>&1 | tail -5`
Expected: build succeeds and emits a `markdown.worker` chunk. (Run in background if slow; do not block.)

- [ ] **Step 7: Commit**

`fix(document): render markdown in a web worker`

---

### Task 3: Switch the text tab to off-thread rendering

**Files:**
- Modify: `src/components/Document/DocumentContentMarkdown.vue:6` (import) and `:146` (call)
- Test: existing `tests/unit/specs/components/Document/DocumentContentMarkdown.spec.js` (no new tests — jsdom exercises the inline fallback, so every existing rendering test covers the new call path)

**Interfaces:**
- Consumes: `renderMarkdownOffThread(source)` from Task 2.

- [ ] **Step 1: Swap the import and the call**

In `src/components/Document/DocumentContentMarkdown.vue`:

```js
import { renderMarkdownOffThread } from '@/utils/markdown'
```

and in `renderPageOnce`:

```js
  renderedPages[targetCacheKey] = await renderMarkdownOffThread(markdown)
```

- [ ] **Step 2: Run the spec to verify nothing regressed**

Run: `yarn test:unit tests/unit/specs/components/Document/DocumentContentMarkdown.spec.js`
Expected: PASS.

- [ ] **Step 3: Commit**

`fix(document): render structure pages off the main thread`

---

### Task 4: Oversized page detection in `DocumentContentMarkdown`

A page whose raw markdown exceeds `oversizedThreshold` is not rendered: `loadPage` emits `oversized` (after the staleness check, so a superseded fetch cannot emit for a page the reader already left) and the parent decides. When the parent answers by setting `renderOversized`, the page renders for real.

**Files:**
- Modify: `src/components/Document/DocumentContentMarkdown.vue` (props, emits, `loadPage`, `renderPageOnce`)
- Test: `tests/unit/specs/components/Document/DocumentContentMarkdown.spec.js`

**Interfaces:**
- Produces (consumed by Task 5): prop `renderOversized: Boolean` (default `false`), prop `oversizedThreshold: Number` (default `5e5` chars of raw markdown), emit `oversized` (no payload). Existing `empty`/`fallback` emits unchanged; an oversized page never emits `empty`.

- [ ] **Step 1: Write the failing tests**

Append to `tests/unit/specs/components/Document/DocumentContentMarkdown.spec.js`:

```js
  it('emits oversized instead of rendering a page bigger than the threshold', async () => {
    api.getStructurePage.mockResolvedValue('a'.repeat(100))
    const wrapper = await mountComponent({ oversizedThreshold: 99 })
    expect(wrapper.emitted('oversized')).toHaveLength(1)
    expect(wrapper.find('.document-content-markdown__body').exists()).toBe(false)
  })

  it('does not report an oversized page as empty', async () => {
    api.getStructurePage.mockResolvedValue('a'.repeat(100))
    const wrapper = await mountComponent({ oversizedThreshold: 99 })
    expect(wrapper.emitted('empty')).toBeUndefined()
  })

  it('renders a page at the threshold exactly', async () => {
    api.getStructurePage.mockResolvedValue('a'.repeat(99))
    const wrapper = await mountComponent({ oversizedThreshold: 99 })
    expect(wrapper.emitted('oversized')).toBeUndefined()
    expect(wrapper.find('.document-content-markdown__body').exists()).toBe(true)
  })

  it('renders an oversized page when the reader insists', async () => {
    api.getStructurePage.mockResolvedValue('# Big page')
    const wrapper = await mountComponent({ oversizedThreshold: 3, renderOversized: true })
    expect(wrapper.emitted('oversized')).toBeUndefined()
    expect(wrapper.find('h1').text()).toBe('Big page')
  })
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn test:unit tests/unit/specs/components/Document/DocumentContentMarkdown.spec.js`
Expected: the four new tests FAIL (unknown props are ignored, so the "oversized" pages render and no event is emitted).

- [ ] **Step 3: Implement**

In `src/components/Document/DocumentContentMarkdown.vue`:

Add to `defineProps` (after `globalSearchTerms`):

```js
  /**
   * Raw markdown size (in characters) above which a page is not rendered:
   * the component emits `oversized` and lets the parent decide.
   */
  oversizedThreshold: {
    type: Number,
    default: 5e5
  },
  /**
   * Render a page even when it exceeds the threshold — the parent sets this
   * once the reader has explicitly asked for the formatted view again.
   */
  renderOversized: {
    type: Boolean,
    default: false
  }
```

Extend the emits:

```js
const emit = defineEmits(['fallback', 'empty', 'oversized'])
```

Make `renderPageOnce` report what it did instead of emitting itself, so the decision stays behind `loadPage`'s staleness check:

```js
async function renderPageOnce() {
  // Capture the page and document once: re-reading `props` after the
  // `await` below could pick up values changed by navigation while this
  // fetch was in flight, and would write the response under the wrong key.
  const targetPage = props.page
  const targetCacheKey = cacheKeyFor(targetPage)
  // `in` (rather than a truthiness check) treats an already-cached empty
  // page as a hit instead of re-fetching it on every visit.
  if (targetCacheKey in renderedPages) {
    return 'rendered'
  }
  const { index, id, routing } = props.document
  const markdown = await api.getStructurePage(index, id, targetPage, routing)
  if (markdown.length > props.oversizedThreshold && !props.renderOversized) {
    return 'oversized'
  }
  renderedPages[targetCacheKey] = await renderMarkdownOffThread(markdown)
  return 'rendered'
}
```

In `loadPage`, replace the tail (from `let loadError = null` to the end) with:

```js
  let loadError = null
  let status = null
  try {
    status = await renderPageOnce()
  }
  catch (failure) {
    loadError = failure
  }
  if (load !== lastPageLoad) {
    return
  }
  error.value = loadError
  loading.value = false
  if (loadError) {
    return
  }
  // An oversized page is deliberately left unrendered and uncached, so it must
  // not be mistaken for an empty one: `empty` permanently disables the
  // formatted option, `oversized` only steers the reader to plain text.
  if (status === 'oversized') {
    emit('oversized')
    return
  }
  reportEmptyPage()
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/components/Document/DocumentContentMarkdown.spec.js`
Expected: PASS, including all pre-existing tests (default threshold 5e5 never trips in them).

- [ ] **Step 5: Commit**

`fix(document): skip rendering oversized structure pages`

---

### Task 5: One-shot fallback wiring in `DocumentContent`

First `oversized` for a document flips the reader to plain text. The dropdown stays enabled; picking "Formatted" again remounts the child with `render-oversized` set, so it renders for real (and never re-emits). A document swap resets the state.

**Files:**
- Modify: `src/components/Document/DocumentContent.vue` (state, `docId` watcher, template)
- Test: `tests/unit/specs/components/Document/DocumentContent.spec.js`

**Interfaces:**
- Consumes: `oversized` emit + `renderOversized` prop from Task 4.
- Produces (consumed by Task 6): passes `:markdown-slow="markdownOversized"` to `DocumentContentDropdown`.

- [ ] **Step 1: Write the failing tests**

Append inside `describe('markdown mode', ...)` in `tests/unit/specs/components/Document/DocumentContent.spec.js`:

```js
    it('falls back to plain text on an oversized page, keeping the formatted option available', async () => {
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
      await flushPromises()
      wrapper.findComponent({ name: 'DocumentContentMarkdown' }).vm.$emit('oversized')
      await flushPromises()
      expect(wrapper.findComponent({ name: 'DocumentContentMarkdown' }).exists()).toBe(false)
      expect(wrapper.find('div.document-content__body').exists()).toBe(true)
      expect(wrapper.findComponent(DocumentContentDropdown).props('markdownDisabled')).toBe(false)
    })

    it('renders the oversized page for real when the reader flips back to formatted', async () => {
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
      await flushPromises()
      wrapper.findComponent({ name: 'DocumentContentMarkdown' }).vm.$emit('oversized')
      await flushPromises()
      wrapper.vm.preferMarkdown = true
      await flushPromises()
      const markdownBody = wrapper.findComponent({ name: 'DocumentContentMarkdown' })
      expect(markdownBody.exists()).toBe(true)
      expect(markdownBody.props('renderOversized')).toBe(true)
    })

    it('drops the oversized state when the document changes', async () => {
      const { document } = await mockDocumentContentSlice('Hello world')
      const { plugins } = core
      const wrapper = shallowMount(DocumentContent, { props: { document }, global: { plugins } })
      await flushPromises()
      wrapper.findComponent({ name: 'DocumentContentMarkdown' }).vm.$emit('oversized')
      await flushPromises()
      const other = { index: document.index, id: 'other-document-id', routing: 'other-document-id' }
      await wrapper.setProps({ document: other })
      await flushPromises()
      const markdownBody = wrapper.findComponent({ name: 'DocumentContentMarkdown' })
      expect(markdownBody.exists()).toBe(true)
      expect(markdownBody.props('renderOversized')).toBe(false)
    })
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn test:unit tests/unit/specs/components/Document/DocumentContent.spec.js`
Expected: the three new tests FAIL (`oversized` is unhandled, `renderOversized` prop is undefined on the child).

- [ ] **Step 3: Implement**

In `src/components/Document/DocumentContent.vue`:

State, next to `isMarkdownEmpty` (around line 66):

```js
// An oversized page already sent the reader to plain text once for this
// document: the dropdown's "Formatted" entry then becomes their explicit
// "render anyway", so the child renders it instead of re-emitting.
const markdownOversized = ref(false)
```

Handler, next to `fallbackToTextForEmptyMarkdown` (around line 307):

```js
function fallbackToTextForOversizedMarkdown() {
  markdownOversized.value = true
  preferMarkdown.value = false
}
```

In the `docId` watcher's reset block (after `isMarkdownEmpty.value = false`):

```js
  markdownOversized.value = false
```

In the template, on `<document-content-markdown>`:

```html
        :render-oversized="markdownOversized"
        @oversized="fallbackToTextForOversizedMarkdown"
```

and on `<document-content-dropdown>`:

```html
          :markdown-slow="markdownOversized"
```

(The dropdown prop lands in Task 6; Vue silently ignores it until then, and the Task 6 test pins it.)

- [ ] **Step 4: Run the tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/components/Document/DocumentContent.spec.js`
Expected: PASS.

- [ ] **Step 5: Commit**

`fix(document): fall back to plain text on oversized structure pages`

---

### Task 6: "May be slow" hint in the view dropdown

**Files:**
- Modify: `src/components/Document/DocumentContentDropdown.vue`, `src/lang/en.json` (key `documentContent.view.oversizedTooltip`)
- Test: `tests/unit/specs/components/Document/DocumentContentDropdown.spec.js`

**Interfaces:**
- Consumes: `:markdown-slow` binding from Task 5.
- Produces: prop `markdownSlow: Boolean` (default `false`) on `DocumentContentDropdown`.

- [ ] **Step 1: Write the failing tests**

Append to `tests/unit/specs/components/Document/DocumentContentDropdown.spec.js`:

```js
  describe('when the formatted view is oversized', () => {
    it('warns that the formatted view may be slow, keeping both entries reachable', () => {
      const wrapper = factory({ modelValue: false, markdownSlow: true })
      const reason = wrapper.find('.document-content-dropdown__reason')
      expect(reason.text()).toBe('The formatted view of this document is very large and may be slow to display')
      expect(findMarkdownEntry(wrapper).attributes('disabled')).toBeUndefined()
    })

    it('lets the translation reason win when both apply', () => {
      const wrapper = factory({ modelValue: false, markdownSlow: true, translation: true })
      const reason = wrapper.find('.document-content-dropdown__reason')
      expect(reason.text()).toBe('Translations are only available as plain text')
    })
  })
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn test:unit tests/unit/specs/components/Document/DocumentContentDropdown.spec.js`
Expected: the two new tests FAIL (no reason element rendered).

- [ ] **Step 3: Implement**

In `src/components/Document/DocumentContentDropdown.vue`, add to `defineProps`:

```js
  /**
   * The formatted view exists but is very large: the reader fell back to
   * plain text and picking Formatted again will render it anyway, slowly.
   */
  markdownSlow: {
    type: Boolean,
    default: false
  }
```

In the template, after the existing translation `<b-dropdown-text>`:

```html
    <b-dropdown-text
      v-else-if="markdownSlow"
      text-class="document-content-dropdown__reason"
    >
      {{ t('documentContent.view.oversizedTooltip') }}
    </b-dropdown-text>
```

(`v-else-if` chains off the translation block: change the existing `v-if="translation"` block to stay first, this one follows it.)

In `src/lang/en.json`, inside `documentContent.view` (after `"translationTooltip"`):

```json
      "oversizedTooltip": "The formatted view of this document is very large and may be slow to display",
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/components/Document/DocumentContentDropdown.spec.js`
Expected: PASS.

- [ ] **Step 5: Commit**

`fix(document): warn that the formatted view may be slow after an oversized fallback`

---

### Task 7: Skip off-screen layout with `content-visibility`

CSS only; no unit test (jsdom does no layout). Helps every below-threshold page; a single giant table is one child and still lays out whole — that case is what the Task 4 ceiling is for.

**Files:**
- Modify: `src/components/Document/DocumentContentMarkdown.vue` (add a style block)

- [ ] **Step 1: Add the style block**

At the end of `src/components/Document/DocumentContentMarkdown.vue` (the component has no style block yet; unscoped because the children come from `v-html`):

```html
<style lang="scss">
.document-content-markdown__body {
  // Off-screen blocks skip layout and paint. Anchor jumps and mark
  // scrollIntoView still work: the browser renders the target on demand.
  > * {
    content-visibility: auto;
    contain-intrinsic-size: auto 300px;
  }
}
</style>
```

- [ ] **Step 2: Run the component spec (sanity)**

Run: `yarn test:unit tests/unit/specs/components/Document/DocumentContentMarkdown.spec.js`
Expected: PASS.

- [ ] **Step 3: Manual verification note**

Real verification needs a browser: open a document with a markdown artifact, confirm the page scrolls smoothly and local-search navigation still jumps to marks across the page. Flag this for the reviewer rather than claiming it verified.

- [ ] **Step 4: Commit**

`fix(document): skip off-screen layout of rendered markdown blocks`

---

### Final: full suite + lint

- [ ] Run `yarn lint` and the four touched spec files together; fix anything introduced (separate pre-existing warnings from new ones when reporting).
- [ ] Run the full unit suite in the background: `yarn test:unit` — poll, don't block.
- [ ] Do not push or open a PR without checking in with the reviewer.
