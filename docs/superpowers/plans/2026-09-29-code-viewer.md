# Code Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show text and code documents in the View tab as read-only, syntax-highlighted CodeMirror 6 source with the local search toolbox, colored by the light/dark theme.

**Architecture:** A new `<script setup>` viewer, `DocumentViewerCode.vue`, fetches the source as text and shows it in one reused `EditorView` (`view.setState()` on document swap, which also resets the language and the marks, so no `Compartment` is needed). Search folds the text line by line once, then maps hits back to document positions with the existing `findFoldedMatches` helper from `src/utils/strings.js`, and paints them as `Decoration.mark` ranges. A small `src/utils/codeLanguage.js` picks the language from the file name, then the content type.

**Tech Stack:** Vue 3 (`<script setup>`), CodeMirror 6 (`@codemirror/state`, `@codemirror/view`, `@codemirror/language`, `@codemirror/language-data`, `@lezer/highlight`), Vitest + jsdom + `@vue/test-utils`, Bootstrap 5 SCSS.

**Spec:** `docs/superpowers/specs/2026-09-29-code-viewer-design.md`

## Global Constraints

- Work on branch `feat/code-viewer`, created before the first commit.
- Commit with the `/commit` skill.
- Load the `pirhoo-style` skill before writing code. Braces on every `if`, no single-line `if`. Prefer intermediary variables over dense one-liners.
- No comments except a non-obvious *why*. No section labels.
- Size cap: above 50 MB (`document.contentLength > 50 * 1024 * 1024`) show "too large to preview" and never call `fetchSource`. Unknown length is allowed.
- Markdown, CSV, PDF, DOCX, Word, PPTX, images, audio, video keep their current viewers.
- `json-formatter-js` and `src/components/JsonFormatter.vue` stay (used by `BatchSearchErrorModal.vue`).
- CodeMirror code is only loaded through the viewer, which is already imported with `defineAsyncComponent` in `DocumentViewTabsViewer.vue`.
- Run a single spec with `yarn test:unit <path>`. Run the full suite (`yarn test`) in the background and poll it.
- TDD: show the reviewer the failing test output of every "verify it fails" step before writing production code.

## Review Focus

1. **A term that folds to nothing** (a lone combining accent, `́`): `findFoldedMatches` would loop forever on an empty folded term. Expected: zero matches, no hang. Test in Task 4.
2. **A content type whose name contains another language's name** (`text/x-tika-text-based-message` contains "tex"; fuzzy matching returns LaTeX). Expected: plain text. Test in Task 2.
3. **Windows line endings** (`\r\n`): CodeMirror counts a line break as one position. Expected: the mark covers exactly the typed term. Test in Task 4.
4. **Swapping to a too-large or failing document while a term is typed**: the previous document's matches must not survive. Expected: 0 occurrences. Test in Task 4.
5. **Unknown or exactly-50 MB content length**: Expected: the source is fetched and shown. Test in Task 3.

---

### Task 1: `Document.isCode`

**Files:**
- Modify: `src/api/resources/Document.js:465-467` (add a getter after `isJson`)
- Test: `tests/unit/specs/api/resources/Document.spec.js` (add a `describe` after the JSON one, line 36)

**Interfaces:**
- Produces: `Document#isCode: boolean`, used by Task 5.

- [ ] **Step 0: Create the branch**

Run: `git switch -c feat/code-viewer`

- [ ] **Step 1: Write the failing test**

Add after the `describe('check if document is of JSON type', ...)` block:

```js
  describe('check if document is of code type', () => {
    it.each([
      'text/plain',
      'text/html',
      'text/x-csharp',
      'application/json',
      'application/json; twint',
      'application/xml',
      'application/xhtml+xml',
      'application/javascript',
      'application/x-sh'
    ])('should be code for %s', (contentType) => {
      const doc = new Document({ _source: { contentType } })
      expect(doc.isCode).toBe(true)
    })

    it.each([
      'application/pdf',
      'application/msword',
      'image/png'
    ])('should not be code for %s', (contentType) => {
      const doc = new Document({ _source: { contentType } })
      expect(doc.isCode).toBe(false)
    })
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:unit tests/unit/specs/api/resources/Document.spec.js`
Expected: FAIL, `expected undefined to be true` for the code cases.

- [ ] **Step 3: Write minimal implementation**

In `src/api/resources/Document.js`, after the `isJson` getter:

```js
  get isCode() {
    const codeTypes = [
      'application/javascript',
      'application/sql',
      'application/x-bat',
      'application/x-httpd-php',
      'application/x-sh',
      'application/x-yaml',
      'application/xml',
      'application/xml-dtd'
    ]
    return this.contentType.indexOf('text/') === 0
      || this.contentType.endsWith('+xml')
      || this.isJson
      || codeTypes.includes(this.contentType)
  }
```

`+xml` covers the `application/*+xml` types listed in `src/utils/contentTypes.json` (xhtml, xslt, rdf, rsd, wsdl, dita).

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test:unit tests/unit/specs/api/resources/Document.spec.js`
Expected: PASS.

- [ ] **Step 5: Commit**

Use `/commit` on `src/api/resources/Document.js` and `tests/unit/specs/api/resources/Document.spec.js`. Message: `feat(document): add isCode getter`.

---

### Task 2: Language detection

**Files:**
- Modify: `package.json`, `yarn.lock` (new dependencies)
- Create: `src/utils/codeLanguage.js`
- Test: `tests/unit/specs/utils/codeLanguage.spec.js`

**Interfaces:**
- Produces: `findLanguage(document: { basename: string, contentType: string }): Promise<LanguageSupport | null>`, used by Task 3.

- [ ] **Step 1: Install the dependencies**

Run: `yarn add @codemirror/state @codemirror/view @codemirror/language @codemirror/language-data @lezer/highlight`
Expected: five new entries under `dependencies` in `package.json`.

- [ ] **Step 2: Write the failing test**

Create `tests/unit/specs/utils/codeLanguage.spec.js`:

```js
import { LanguageDescription } from '@codemirror/language'
import { languages } from '@codemirror/language-data'

import { findLanguage } from '@/utils/codeLanguage'

function describeLanguage(name) {
  return LanguageDescription.matchLanguageName(languages, name)
}

function loadLanguage(name) {
  return describeLanguage(name).load()
}

describe('codeLanguage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('picks the language from the file name first', async () => {
    const support = await findLanguage({ basename: 'script.py', contentType: 'application/json' })
    expect(support).toBe(await loadLanguage('Python'))
  })

  it('falls back on the content type', async () => {
    const support = await findLanguage({ basename: 'data', contentType: 'application/json' })
    expect(support).toBe(await loadLanguage('JSON'))
  })

  it('ignores the content type parameters', async () => {
    const support = await findLanguage({ basename: 'tweet', contentType: 'application/json; twint' })
    expect(support).toBe(await loadLanguage('JSON'))
  })

  it('drops the x- prefix of the content type', async () => {
    const support = await findLanguage({ basename: 'Program', contentType: 'text/x-csharp' })
    expect(support).toBe(await loadLanguage('C#'))
  })

  it.each([
    ['text/x-java-source', 'Java'],
    ['application/x-httpd-php', 'PHP'],
    ['text/x-c++src', 'C++'],
    ['text/x-csrc', 'C']
  ])('maps %s to %s', async (contentType, name) => {
    const support = await findLanguage({ basename: 'source', contentType })
    expect(support).toBe(await loadLanguage(name))
  })

  it('highlights any +xml content type as XML', async () => {
    const support = await findLanguage({ basename: 'feed', contentType: 'application/rdf+xml' })
    expect(support).toBe(await loadLanguage('XML'))
  })

  it('shows plain text as plain text', async () => {
    const support = await findLanguage({ basename: 'notes', contentType: 'text/plain' })
    expect(support).toBeNull()
  })

  it('does not match a language hidden inside another content type name', async () => {
    const support = await findLanguage({ basename: 'message', contentType: 'text/x-tika-text-based-message' })
    expect(support).toBeNull()
  })

  it('shows plain text when the language pack fails to load', async () => {
    vi.spyOn(describeLanguage('JSON'), 'load').mockRejectedValue(new Error('offline'))
    const support = await findLanguage({ basename: 'data.json', contentType: 'application/json' })
    expect(support).toBeNull()
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `yarn test:unit tests/unit/specs/utils/codeLanguage.spec.js`
Expected: FAIL, `Failed to resolve import "@/utils/codeLanguage"`.

- [ ] **Step 4: Write minimal implementation**

Create `src/utils/codeLanguage.js`:

```js
import { LanguageDescription } from '@codemirror/language'
import { languages } from '@codemirror/language-data'

// Fuzzy matching finds a language inside any longer name ("tika-text-based-message"
// holds "tex"), so names are matched exactly and the few that differ are mapped.
const LANGUAGE_NAMES = {
  'c++src': 'C++',
  'csrc': 'C',
  'httpd-php': 'PHP',
  'java-source': 'Java'
}

function contentTypeLanguageName(contentType = '') {
  const [mimeType] = contentType.split(';')
  const subtype = mimeType.trim().split('/').pop().replace(/^x-/, '')
  if (subtype.endsWith('+xml')) {
    return 'xml'
  }
  return LANGUAGE_NAMES[subtype] ?? subtype
}

function findLanguageDescription({ basename = '', contentType }) {
  const byFilename = LanguageDescription.matchFilename(languages, basename)
  if (byFilename) {
    return byFilename
  }
  return LanguageDescription.matchLanguageName(languages, contentTypeLanguageName(contentType), false)
}

/**
 * Find the CodeMirror language to highlight a document with: from its file
 * name first, then from its content type.
 *
 * @param {Object} document - The document to highlight.
 * @param {string} document.basename - The document file name.
 * @param {string} document.contentType - The document content type.
 * @return {Promise<LanguageSupport|null>} The language, or null for plain text.
 */
export async function findLanguage(document) {
  const description = findLanguageDescription(document)
  if (!description) {
    return null
  }
  try {
    return await description.load()
  }
  catch {
    return null
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `yarn test:unit tests/unit/specs/utils/codeLanguage.spec.js`
Expected: PASS (12 cases).

- [ ] **Step 6: Commit**

Use `/commit` on `package.json`, `yarn.lock`, `src/utils/codeLanguage.js`, `tests/unit/specs/utils/codeLanguage.spec.js`. Message: `feat(document): detect the code language of a document`.

---

### Task 3: `DocumentViewerCode` shows the source

**Files:**
- Create: `src/components/Document/DocumentViewer/DocumentViewerCode.vue`
- Modify: `src/lang/en.json:791` (add `tooLargeToPreview` after `notAvailable`)
- Test: `tests/unit/specs/components/Document/DocumentViewer/DocumentViewerCode.spec.js`

**Interfaces:**
- Consumes: `findLanguage(document)` from Task 2, `useDocumentSource().fetchSource(document, { responseType: 'text' })`.
- Produces: component with prop `document` (Object, required) and `compactThreshold` (Number, default 770). The editor mounts inside `.document-viewer-code__editor`; tests reach it with `EditorView.findFromDOM(wrapper.find('.cm-editor').element)`.

- [ ] **Step 1: Add the message**

In `src/lang/en.json`, inside `"document"`, after `"notAvailable"`:

```json
    "tooLargeToPreview": "This document is too large to preview.",
```

- [ ] **Step 2: Write the failing test**

Create `tests/unit/specs/components/Document/DocumentViewer/DocumentViewerCode.spec.js`:

```js
import { flushPromises, shallowMount } from '@vue/test-utils'
import { LanguageDescription, language } from '@codemirror/language'
import { languages } from '@codemirror/language-data'
import { EditorView } from '@codemirror/view'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentViewerCode from '@/components/Document/DocumentViewer/DocumentViewerCode'
import { findLanguage } from '@/utils/codeLanguage'
import { useDocumentPathBannersStore } from '@/store/modules'

vi.mock('@/utils/codeLanguage', () => ({ findLanguage: vi.fn() }))

const getSource = vi.fn()

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const { apiInstance } = await importOriginal()
  return { apiInstance: { ...apiInstance, getSource: (...args) => getSource(...args) } }
})

describe('DocumentViewerCode.vue', () => {
  const MB = 1024 * 1024
  const document = {
    index: 'foo',
    id: 'doc-id',
    routing: 'root-id',
    project: 'foo',
    path: '/leaks/code/Program.cs',
    basename: 'Program.cs',
    contentType: 'text/x-csharp',
    contentLength: 1024,
    source: { metadata: {} },
    tags: []
  }

  // The path banners are cached per project, so seeding the store keeps the blur
  // decision out of the network and away from the other tests' cache.
  function mountViewer({ pathBanners = [], ...overrides } = {}) {
    const { plugins } = CoreSetup.init().useAll()
    useDocumentPathBannersStore().set({ project: 'foo', pathBanners })
    return shallowMount(DocumentViewerCode, {
      props: { document: { ...document, ...overrides } },
      attachTo: window.document.body,
      global: { plugins, renderStubDefaultSlot: true }
    })
  }

  function editorView(wrapper) {
    return EditorView.findFromDOM(wrapper.find('.cm-editor').element)
  }

  function editorText(wrapper) {
    return editorView(wrapper).state.doc.toString()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    getSource.mockResolvedValue('hello world')
    findLanguage.mockResolvedValue(null)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('fetches the source as text', async () => {
    mountViewer()
    await flushPromises()
    expect(getSource).toHaveBeenCalledWith(expect.objectContaining({ id: 'doc-id' }), { responseType: 'text' })
  })

  it('shows the fetched source', async () => {
    const wrapper = mountViewer()
    await flushPromises()
    expect(editorText(wrapper)).toBe('hello world')
  })

  it('shows the source read-only', async () => {
    const wrapper = mountViewer()
    await flushPromises()
    const view = editorView(wrapper)
    expect(view.state.readOnly).toBe(true)
    expect(view.contentDOM.getAttribute('contenteditable')).toBe('false')
  })

  it('highlights the source with the language found for the document', async () => {
    findLanguage.mockResolvedValue(await LanguageDescription.matchLanguageName(languages, 'JSON').load())
    const wrapper = mountViewer()
    await flushPromises()
    expect(findLanguage).toHaveBeenCalledWith(expect.objectContaining({ basename: 'Program.cs' }))
    expect(editorView(wrapper).state.facet(language).name).toBe('json')
  })

  it('does not fetch a document above 50 MB', async () => {
    const wrapper = mountViewer({ contentLength: 50 * MB + 1 })
    await flushPromises()
    expect(getSource).not.toHaveBeenCalled()
    expect(wrapper.find('.document-viewer-code__too-large').text()).toBe('This document is too large to preview.')
  })

  it('fetches a document of exactly 50 MB', async () => {
    mountViewer({ contentLength: 50 * MB })
    await flushPromises()
    expect(getSource).toHaveBeenCalled()
  })

  it('fetches a document of unknown length', async () => {
    const wrapper = mountViewer({ contentLength: undefined })
    await flushPromises()
    expect(editorText(wrapper)).toBe('hello world')
  })

  it('shows the not-found message when the source is gone', async () => {
    getSource.mockRejectedValue({ response: { status: 404 } })
    const wrapper = mountViewer()
    await flushPromises()
    expect(wrapper.find('.document-viewer-code__error').text()).toBe('Your document was indexed in Datashare but the original is no longer in your Datashare folder on your computer. Preview is thus not available.')
  })

  it('replaces the text in the same editor when the document changes', async () => {
    const wrapper = mountViewer()
    await flushPromises()
    getSource.mockResolvedValue('second')
    await wrapper.setProps({ document: { ...document, id: 'other-id' } })
    await flushPromises()
    expect(wrapper.findAll('.cm-editor')).toHaveLength(1)
    expect(editorText(wrapper)).toBe('second')
  })

  it('does not let a superseded load write over the document on screen', async () => {
    let resolveFirst
    getSource.mockReturnValueOnce(new Promise((resolve) => {
      resolveFirst = resolve
    }))
    getSource.mockResolvedValue('second')
    const wrapper = mountViewer()
    await flushPromises()
    await wrapper.setProps({ document: { ...document, id: 'other-id' } })
    await flushPromises()
    resolveFirst('first')
    await flushPromises()
    expect(editorText(wrapper)).toBe('second')
  })

  it('does not let a superseded failure blank the document on screen', async () => {
    let rejectFirst
    getSource.mockReturnValueOnce(new Promise((resolve, reject) => {
      rejectFirst = reject
    }))
    getSource.mockResolvedValue('second')
    const wrapper = mountViewer()
    await flushPromises()
    await wrapper.setProps({ document: { ...document, id: 'other-id' } })
    await flushPromises()
    rejectFirst({ response: { status: 404 } })
    await flushPromises()
    expect(wrapper.find('.document-viewer-code__error').exists()).toBe(false)
    expect(editorText(wrapper)).toBe('second')
  })

  it('destroys the editor on unmount', async () => {
    const wrapper = mountViewer()
    await flushPromises()
    const destroy = vi.spyOn(editorView(wrapper), 'destroy')
    wrapper.unmount()
    expect(destroy).toHaveBeenCalled()
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `yarn test:unit tests/unit/specs/components/Document/DocumentViewer/DocumentViewerCode.spec.js`
Expected: FAIL, `Failed to resolve import "@/components/Document/DocumentViewer/DocumentViewerCode"`. Show this output to the reviewer before Step 4.

- [ ] **Step 4: Write minimal implementation**

Create `src/components/Document/DocumentViewer/DocumentViewerCode.vue`:

```vue
<script setup>
import { computed, onBeforeUnmount, ref, toRef, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { EditorState } from '@codemirror/state'
import { EditorView, lineNumbers } from '@codemirror/view'
import { syntaxHighlighting } from '@codemirror/language'
import { classHighlighter } from '@lezer/highlight'

import { useDocumentSource } from '@/composables/useDocumentSource'
import { findLanguage } from '@/utils/codeLanguage'

/**
 * Display a text or code document as read-only, highlighted source.
 */
const props = defineProps({
  /**
   * The selected document
   */
  document: {
    type: Object,
    required: true
  },
  compactThreshold: {
    type: Number,
    default: 770
  }
})

const MAX_CONTENT_LENGTH = 50 * 1024 * 1024

const { fetchSource } = useDocumentSource()
const { t } = useI18n()

const editor = useTemplateRef('editor')
const error = ref(null)
const loading = ref(false)
const tooLarge = computed(() => isTooLarge(props.document))

let view = null
let lastLoad = 0

function isTooLarge({ contentLength }) {
  return contentLength > MAX_CONTENT_LENGTH
}

function createState(text, language) {
  return EditorState.create({
    doc: text,
    extensions: [
      EditorState.readOnly.of(true),
      EditorView.editable.of(false),
      lineNumbers(),
      syntaxHighlighting(classHighlighter),
      language ?? []
    ]
  })
}

function renderSource(text, language) {
  const state = createState(text, language)
  if (view) {
    view.setState(state)
  }
  else {
    view = new EditorView({ state, parent: editor.value })
  }
}

function isCurrentLoad(id) {
  return id === lastLoad
}

async function showSource(id, document) {
  try {
    const [text, language] = await Promise.all([
      fetchSource(document, { responseType: 'text' }),
      findLanguage(document)
    ])
    if (isCurrentLoad(id)) {
      renderSource(text, language)
    }
  }
  catch (reason) {
    if (isCurrentLoad(id)) {
      error.value = reason.message
    }
  }
}

// A document swapped in while this one was loading owns the editor now, so
// only the newest load may write its text or its failure.
async function load(document) {
  const id = ++lastLoad
  error.value = null
  loading.value = !isTooLarge(document)
  if (loading.value) {
    await showSource(id, document)
  }
  if (isCurrentLoad(id)) {
    loading.value = false
  }
}

watch(toRef(props, 'document'), load, { immediate: true, flush: 'post' })

onBeforeUnmount(() => view?.destroy())
</script>

<template>
  <div class="document-viewer-code">
    <div
      v-if="tooLarge"
      class="document-viewer-code__too-large text-center p-3"
    >
      {{ t('document.tooLargeToPreview') }}
    </div>
    <div
      v-else-if="error"
      class="document-viewer-code__error text-center p-3"
    >
      {{ error }}
    </div>
    <div
      v-else-if="loading"
      class="document-viewer-code__loading text-center p-3"
    >
      <b-spinner />
    </div>
    <div
      v-show="!tooLarge && !error && !loading"
      ref="editor"
      class="document-viewer-code__editor"
    />
  </div>
</template>

<style lang="scss" scoped>
.document-viewer-code {
  --document-viewer-code-keyword: #cf222e;
  --document-viewer-code-string: #0a3069;
  --document-viewer-code-comment: #6e7781;
  --document-viewer-code-number: #0550ae;
  --document-viewer-code-type: #116329;
  --document-viewer-code-class: #953800;
  --document-viewer-code-property: #0550ae;
  --document-viewer-code-definition: #8250df;
  --document-viewer-code-invalid: #82071e;

  width: 100%;

  &__editor:deep(.cm-editor) {
    background: var(--bs-body-bg);
    color: var(--bs-body-color);
    border: $border-width solid var(--bs-border-color);
  }

  &__editor:deep(.cm-gutters) {
    background: var(--bs-tertiary-bg);
    color: var(--bs-secondary-color);
    border-right-color: var(--bs-border-color);
  }

  &__editor:deep(.tok-keyword) {
    color: var(--document-viewer-code-keyword);
  }

  &__editor:deep(.tok-string),
  &__editor:deep(.tok-string2) {
    color: var(--document-viewer-code-string);
  }

  &__editor:deep(.tok-comment),
  &__editor:deep(.tok-meta) {
    color: var(--document-viewer-code-comment);
    font-style: italic;
  }

  &__editor:deep(.tok-number),
  &__editor:deep(.tok-bool),
  &__editor:deep(.tok-atom) {
    color: var(--document-viewer-code-number);
  }

  &__editor:deep(.tok-typeName),
  &__editor:deep(.tok-namespace) {
    color: var(--document-viewer-code-type);
  }

  &__editor:deep(.tok-className),
  &__editor:deep(.tok-macroName) {
    color: var(--document-viewer-code-class);
  }

  &__editor:deep(.tok-propertyName) {
    color: var(--document-viewer-code-property);
  }

  &__editor:deep(.tok-definition),
  &__editor:deep(.tok-variableName2) {
    color: var(--document-viewer-code-definition);
  }

  &__editor:deep(.tok-invalid) {
    color: var(--document-viewer-code-invalid);
  }

  &__editor:deep(.local-search-term) {
    background: $mark-bg;
    color: black;
  }

  &__editor:deep(.local-search-term--active) {
    background: #38d878;
    color: white;
  }
}

@include color-mode(dark) {
  .document-viewer-code {
    --document-viewer-code-keyword: #ff7b72;
    --document-viewer-code-string: #a5d6ff;
    --document-viewer-code-comment: #8b949e;
    --document-viewer-code-number: #79c0ff;
    --document-viewer-code-type: #7ee787;
    --document-viewer-code-class: #ffa657;
    --document-viewer-code-property: #79c0ff;
    --document-viewer-code-definition: #d2a8ff;
    --document-viewer-code-invalid: #ffa198;
  }
}
</style>
```

Notes for the implementer:
- `compactThreshold` is unused until Task 4 wires the toolbox. Keep it: the prop list must match the other viewers.
- The mark colors are copied from `DocumentViewerDocx.vue` so both tabs highlight the same way. Task 4 adds the marks.
- If jsdom throws `getClientRects is not a function` from CodeMirror, add to the top of the spec: `Range.prototype.getClientRects = () => []` and `Range.prototype.getBoundingClientRect = () => ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 })`. A smoke test in plain jsdom did not need them.

- [ ] **Step 5: Run test to verify it passes**

Run: `yarn test:unit tests/unit/specs/components/Document/DocumentViewer/DocumentViewerCode.spec.js`
Expected: PASS (12 tests).

- [ ] **Step 6: Lint**

Run: `yarn lint:modified`
Expected: no errors in the new files.

- [ ] **Step 7: Commit**

Use `/commit` on the component, its spec and `src/lang/en.json`. Message: `feat(document): add a read-only code viewer`.

---

### Task 4: Local search in the code viewer

**Files:**
- Modify: `src/utils/strings.js:115` (export `findFoldedMatches`)
- Modify: `src/components/Document/DocumentViewer/DocumentViewerCode.vue` (script and template replaced below, style unchanged)
- Test: `tests/unit/specs/components/Document/DocumentViewer/DocumentViewerCode.spec.js`

**Interfaces:**
- Consumes: `useDocumentLocalSearch({ findMatches })` returning `{ term, activeIndex, matches, occurrences, isLoading, refresh }` (`src/composables/useDocumentLocalSearch.js:13`); `foldWithSourceIndexes(value): { folded, sourceIndexes, sourceEnds }` (`src/utils/strings.js:81`); `findFoldedMatches(text, foldedTerm): Array<{ start, end }>` (`src/utils/strings.js:115`, currently private); `useDocumentPreview(): { isBlurred, getBlurredContentBanner }`.
- Produces: `findMatches(term: string): Array<{ page: 1, from: number, to: number }>` exposed through `defineExpose`.

- [ ] **Step 1: Write the failing tests**

In the spec, add these imports:

```js
import { nextTick } from 'vue'

import DocumentToolbox from '@/components/Document/DocumentToolbox/DocumentToolbox'
import DismissableContentWarningToggler from '@/components/Dismissable/DismissableContentWarningToggler'
```

Add these helpers inside `describe`, after `editorText`:

```js
  // The local search debounces the term before it searches it.
  async function search(wrapper, value) {
    wrapper.findComponent(DocumentToolbox).vm.$emit('update:modelValue', value)
    await vi.advanceTimersByTimeAsync(300)
    await flushPromises()
  }

  async function mountWithSource(source, overrides) {
    getSource.mockResolvedValue(source)
    const wrapper = mountViewer(overrides)
    await flushPromises()
    return wrapper
  }
```

Add these tests at the end of `describe`:

```js
  it('finds matches across lines, ignoring case and accents', async () => {
    const wrapper = await mountWithSource('Crème\nfoo CREME crème')
    expect(wrapper.vm.findMatches('creme')).toEqual([
      { page: 1, from: 0, to: 5 },
      { page: 1, from: 10, to: 15 },
      { page: 1, from: 16, to: 21 }
    ])
  })

  it('counts a Windows line break as one position', async () => {
    const wrapper = await mountWithSource('a\r\nneedle')
    expect(wrapper.vm.findMatches('needle')).toEqual([{ page: 1, from: 2, to: 8 }])
  })

  it('finds nothing for a term that folds to nothing', async () => {
    const wrapper = await mountWithSource('créme')
    expect(wrapper.vm.findMatches('́')).toEqual([])
  })

  it('marks every occurrence in the editor', async () => {
    const wrapper = await mountWithSource('needle one\nneedle two')
    await search(wrapper, 'needle')
    expect(wrapper.findComponent(DocumentToolbox).props('occurrences')).toBe(2)
    expect(wrapper.findAll('.local-search-term')).toHaveLength(2)
  })

  it('marks the active occurrence', async () => {
    const wrapper = await mountWithSource('needle one\nneedle two')
    await search(wrapper, 'needle')
    wrapper.findComponent(DocumentToolbox).vm.$emit('update:activeIndex', 2)
    await nextTick()
    const lines = wrapper.findAll('.cm-line')
    expect(lines[0].find('.local-search-term--active').exists()).toBe(false)
    expect(lines[1].find('.local-search-term--active').exists()).toBe(true)
  })

  it('takes the marks down when the search field is cleared', async () => {
    const wrapper = await mountWithSource('a needle')
    await search(wrapper, 'needle')
    expect(wrapper.findAll('.local-search-term')).toHaveLength(1)
    await search(wrapper, '')
    expect(wrapper.findAll('.local-search-term')).toHaveLength(0)
  })

  it('searches the term again when another document is shown', async () => {
    const wrapper = await mountWithSource('a needle')
    await search(wrapper, 'needle')
    getSource.mockResolvedValue('needle and needle')
    await wrapper.setProps({ document: { ...document, id: 'other-id' } })
    await flushPromises()
    expect(wrapper.findComponent(DocumentToolbox).props('occurrences')).toBe(2)
    expect(wrapper.findAll('.local-search-term')).toHaveLength(2)
  })

  it('drops the matches when the next document is too large', async () => {
    const wrapper = await mountWithSource('a needle')
    await search(wrapper, 'needle')
    await wrapper.setProps({ document: { ...document, id: 'other-id', contentLength: 50 * MB + 1 } })
    await flushPromises()
    expect(wrapper.findComponent(DocumentToolbox).props('occurrences')).toBe(0)
    expect(wrapper.vm.findMatches('needle')).toEqual([])
  })

  it('drops the matches when the next document fails to load', async () => {
    const wrapper = await mountWithSource('a needle')
    await search(wrapper, 'needle')
    getSource.mockRejectedValue({ response: { status: 404 } })
    await wrapper.setProps({ document: { ...document, id: 'other-id' } })
    await flushPromises()
    expect(wrapper.findComponent(DocumentToolbox).props('occurrences')).toBe(0)
  })

  it('leaves the document visible when no path banner blurs it', async () => {
    const wrapper = await mountWithSource('hello')
    expect(wrapper.findComponent(DismissableContentWarningToggler).exists()).toBe(false)
    expect(wrapper.findComponent(DocumentToolbox).props('disabled')).toBe(false)
  })

  it('hides the document behind a content warning under a blurring path banner', async () => {
    const pathBanners = [{ path: '/leaks/code/', blurSensitiveMedia: true, note: 'Sensitive' }]
    const wrapper = await mountWithSource('hello', { pathBanners })
    const toggler = wrapper.findComponent(DismissableContentWarningToggler)
    expect(toggler.props('description')).toBe('Sensitive')
    expect(wrapper.findComponent(DocumentToolbox).props('disabled')).toBe(true)
    expect(wrapper.find('.document-viewer-code__editor').attributes('style')).toContain('display: none')
  })
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn test:unit tests/unit/specs/components/Document/DocumentViewer/DocumentViewerCode.spec.js`
Expected: the 11 new tests FAIL (`wrapper.vm.findMatches is not a function`, `Cannot call vm on an empty VueWrapper`), the 12 Task 3 tests still PASS. Show this output to the reviewer before Step 3.

- [ ] **Step 3: Export `findFoldedMatches`**

In `src/utils/strings.js:115`, change `function findFoldedMatches(text, foldedTerm) {` to:

```js
export function findFoldedMatches(text, foldedTerm) {
```

- [ ] **Step 4: Replace the component script and template**

Replace the `<script setup>` and `<template>` blocks of `DocumentViewerCode.vue` (keep `<style>` from Task 3):

```vue
<script setup>
import { computed, onBeforeUnmount, ref, toRef, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { EditorState, StateEffect, StateField } from '@codemirror/state'
import { Decoration, EditorView, lineNumbers } from '@codemirror/view'
import { syntaxHighlighting } from '@codemirror/language'
import { classHighlighter } from '@lezer/highlight'

import { useDocumentLocalSearch } from '@/composables/useDocumentLocalSearch'
import { useDocumentPreview } from '@/composables/useDocumentPreview'
import { useDocumentSource } from '@/composables/useDocumentSource'
import { findLanguage } from '@/utils/codeLanguage'
import { findFoldedMatches, foldWithSourceIndexes } from '@/utils/strings'
import DismissableContentWarningToggler from '@/components/Dismissable/DismissableContentWarningToggler'
import DocumentToolbox from '@/components/Document/DocumentToolbox/DocumentToolbox'

/**
 * Display a text or code document as read-only, highlighted source.
 */
const props = defineProps({
  /**
   * The selected document
   */
  document: {
    type: Object,
    required: true
  },
  compactThreshold: {
    type: Number,
    default: 770
  }
})

const MAX_CONTENT_LENGTH = 50 * 1024 * 1024

const MARK = Decoration.mark({ class: 'local-search-term' })
const ACTIVE_MARK = Decoration.mark({ class: 'local-search-term local-search-term--active' })

const setMarks = StateEffect.define()

// The document never changes once shown (a new document gets a new state), so
// the marks never have to be mapped through a change.
const marksField = StateField.define({
  create: () => Decoration.none,
  update: (marks, transaction) => {
    const effect = transaction.effects.find(effect => effect.is(setMarks))
    return effect ? effect.value : marks
  },
  provide: field => EditorView.decorations.from(field)
})

const { fetchSource } = useDocumentSource()
const { isBlurred, getBlurredContentBanner } = useDocumentPreview()
const { t } = useI18n()

const editor = useTemplateRef('editor')
const error = ref(null)
const loading = ref(false)
const blurred = ref(false)
const blurredContent = ref(null)
const tooLarge = computed(() => isTooLarge(props.document))

const {
  term,
  activeIndex,
  matches,
  occurrences,
  isLoading,
  refresh
} = useDocumentLocalSearch({ findMatches })

let view = null
let foldedLines = []
let lastLoad = 0

function isTooLarge({ contentLength }) {
  return contentLength > MAX_CONTENT_LENGTH
}

function createState(text, language) {
  return EditorState.create({
    doc: text,
    extensions: [
      EditorState.readOnly.of(true),
      EditorView.editable.of(false),
      lineNumbers(),
      syntaxHighlighting(classHighlighter),
      marksField,
      language ?? []
    ]
  })
}

// Folding keeps two offset arrays per character, too heavy to hold for a 50 MB
// file, so only the folded strings are kept and `findMatches` rebuilds the
// offsets for the lines a term actually hits.
function foldLines(doc) {
  return Array.from(doc.iterLines(), line => foldWithSourceIndexes(line).folded)
}

function renderSource(text, language) {
  const state = createState(text, language)
  if (view) {
    view.setState(state)
  }
  else {
    view = new EditorView({ state, parent: editor.value })
  }
  foldedLines = foldLines(state.doc)
}

function isCurrentLoad(id) {
  return id === lastLoad
}

async function showSource(id, document) {
  try {
    const [text, language] = await Promise.all([
      fetchSource(document, { responseType: 'text' }),
      findLanguage(document)
    ])
    if (isCurrentLoad(id)) {
      renderSource(text, language)
    }
  }
  catch (reason) {
    if (isCurrentLoad(id)) {
      error.value = reason.message
    }
  }
}

// A document swapped in while this one was loading owns the editor now, so
// only the newest load may write its text, its failure or its matches.
async function load(document) {
  const id = ++lastLoad
  foldedLines = []
  error.value = null
  loading.value = !isTooLarge(document)
  if (loading.value) {
    await showSource(id, document)
  }
  if (isCurrentLoad(id)) {
    loading.value = false
    // The matches on screen point into the text this load replaced.
    await refresh()
  }
}

function findLineMatches(index, foldedTerm) {
  const line = view.state.doc.line(index + 1)
  return findFoldedMatches(line.text, foldedTerm).map(({ start, end }) => {
    return { page: 1, from: line.from + start, to: line.from + end }
  })
}

function findMatches(value) {
  const { folded } = foldWithSourceIndexes(value)
  // A term made only of combining marks folds to nothing, which every line
  // contains at every position: the scan would never move forward.
  if (!folded) {
    return []
  }
  return foldedLines.flatMap((foldedLine, index) => {
    if (!foldedLine.includes(folded)) {
      return []
    }
    return findLineMatches(index, folded)
  })
}

function paintMatches() {
  if (!view) {
    return
  }
  const active = matches.value[activeIndex.value - 1]
  const ranges = matches.value.map((match) => {
    const mark = match === active ? ACTIVE_MARK : MARK
    return mark.range(match.from, match.to)
  })
  const effects = [setMarks.of(Decoration.set(ranges))]
  if (active) {
    effects.push(EditorView.scrollIntoView(active.from, { y: 'center' }))
  }
  view.dispatch({ effects })
}

watch([matches, activeIndex], paintMatches)
watch(toRef(props, 'document'), load, { immediate: true, flush: 'post' })
watch(toRef(props, 'document'), async (document) => {
  blurred.value = await isBlurred(document)
  blurredContent.value = blurred.value ? await getBlurredContentBanner(document) : null
}, { immediate: true })

onBeforeUnmount(() => view?.destroy())

defineExpose({ findMatches })
</script>

<template>
  <div class="document-viewer-code">
    <document-toolbox
      v-model="term"
      v-model:active-index="activeIndex"
      :document="document"
      :occurrences="occurrences"
      :loading="isLoading"
      :disabled="blurred"
      :compact-threshold="compactThreshold"
    />
    <dismissable-content-warning-toggler
      v-if="blurred"
      v-model="blurred"
      :description="blurredContent"
    />
    <div
      v-else-if="tooLarge"
      class="document-viewer-code__too-large text-center p-3"
    >
      {{ t('document.tooLargeToPreview') }}
    </div>
    <div
      v-else-if="error"
      class="document-viewer-code__error text-center p-3"
    >
      {{ error }}
    </div>
    <div
      v-else-if="loading"
      class="document-viewer-code__loading text-center p-3"
    >
      <b-spinner />
    </div>
    <div
      v-show="!blurred && !tooLarge && !error && !loading"
      ref="editor"
      class="document-viewer-code__editor"
    />
  </div>
</template>
```

Why each piece exists:
- `foldedLines = []` at the start of `load` plus `refresh()` at its end is what makes the "too large" and "fails to load" swap tests pass: the term on screen is searched again against an empty text.
- `findMatches` receives the term already trimmed by `useDocumentLocalSearch` (`search()` trims before calling it).
- Matches come out in line order and `findFoldedMatches` drops overlaps, so `Decoration.set` gets sorted, disjoint ranges.

- [ ] **Step 5: Run tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/components/Document/DocumentViewer/DocumentViewerCode.spec.js tests/unit/specs/utils/strings.spec.js`
Expected: PASS (23 viewer tests, strings spec unchanged).

- [ ] **Step 6: Lint**

Run: `yarn lint:modified`
Expected: no errors.

- [ ] **Step 7: Commit**

Use `/commit` on `src/utils/strings.js`, the component and its spec. Message: `feat(document): search inside the code viewer`.

---

### Task 5: Route text and code documents to the code viewer

**Files:**
- Modify: `src/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.vue:13-17,30-31,51`
- Test: `tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.spec.js`
- Delete: `src/components/Document/DocumentViewer/DocumentViewerJson.vue`, `tests/unit/specs/components/Document/DocumentViewer/DocumentViewerJson.spec.js`

**Interfaces:**
- Consumes: `Document#isCode` (Task 1), `DocumentViewerCode.vue` (Tasks 3 and 4).

- [ ] **Step 1: Write the failing tests**

Add at the end of the `describe` in `DocumentViewTabsViewer.spec.js`. The `suspense` stub keeps the async viewer (and CodeMirror) from loading, like the DOCX test:

```js
  it.each([
    ['JSON', 'data.json', 'application/json'],
    ['HTML', 'page.html', 'text/html'],
    ['plain text', 'notes.txt', 'text/plain'],
    ['C#', 'Program.cs', 'text/x-csharp']
  ])('should call the DocumentViewerCode component for %s document', async (label, codeId, contentType) => {
    const document = await letData(es)
      .have(new IndexedDocument(codeId, index).withContentType(contentType))
      .commitAndGetLastDocument()
    await documentStore.getDocument({ id: codeId, index })

    const wrapper = shallowMount(DocumentViewTabsViewer, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: false,
        stubs: { suspense: true }
      },
      props: { document, disabled }
    })
    expect(wrapper.vm.previewComponent).toBe('DocumentViewerCode')
    wrapper.unmount()
  })
```

The existing Word, PPTX, CSV, Markdown (both) and DOCX tests stay as they are: they check those viewers keep priority.

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn test:unit tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.spec.js`
Expected: the 4 new cases FAIL (`expected 'DocumentViewerJson' to be 'DocumentViewerCode'`, `expected 'DocumentViewerPaginated' ...`, `expected null ...`). This spec needs the Elasticsearch test service; if it cannot connect, say so instead of skipping it.

- [ ] **Step 3: Update the routing**

In `DocumentViewTabsViewer.vue`:

1. Remove `'text/html'` from `paginatedTypes`:

```js
const paginatedTypes = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
]
```

2. Remove these two lines:

```js
    case document.value.isJson:
      return 'DocumentViewerJson'
```

3. Add the code case last, right before `default`:

```js
    case document.value.isVideo:
      return 'DocumentViewerVideo'
    case document.value.isCode:
      return 'DocumentViewerCode'
    default:
      return null
```

- [ ] **Step 4: Delete the JSON tree viewer**

Run: `git rm src/components/Document/DocumentViewer/DocumentViewerJson.vue tests/unit/specs/components/Document/DocumentViewer/DocumentViewerJson.spec.js`

Then check nothing else imports it:

Run: `grep -rn "DocumentViewerJson" src tests .storybook`
Expected: no output. `JsonFormatter` must still be imported by `src/components/BatchSearch/BatchSearchErrorModal.vue`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.spec.js`
Expected: PASS.

- [ ] **Step 6: Run the full suite in the background**

Run in the background: `yarn test`, and poll until done.
Expected: PASS. Report pre-existing failures separately from failures in files this plan touched.

- [ ] **Step 7: Lint**

Run: `yarn lint`
Expected: no new errors.

- [ ] **Step 8: Commit**

Use `/commit` on the view, its spec and the two deletions. Message: `feat(document): show text and code documents in the code viewer`.

---

### Task 6: Manual check

**Files:** none.

- [ ] **Step 1: Start the dev server**

Kill any running `yarn serve` first, then run in the background: `yarn serve` (needs the backend on port 8080).

- [ ] **Step 2: Check in the browser, light theme then dark theme**

Open `http://localhost:9009` and view, in the View tab:
1. a JSON file: colored, line numbers, no tree;
2. an HTML file: source, not page thumbnails;
3. a C# file: colored keywords and strings;
4. a large log (tens of MB): scrolls smoothly, the page scrolls, not an inner box;
5. search a word: count shown, marks visible, next/previous scrolls the active mark to the center, the toolbox stays on top.

Switch the theme: colors change with no reload. The editor shows its text right after the spinner (it is created while hidden).

- [ ] **Step 3: Report**

List what was checked and any visual issue, with a screenshot path if one was taken.
