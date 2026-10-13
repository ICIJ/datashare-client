# Safe Markdown rendering in the View tab — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render Markdown documents as safely-sanitized formatted HTML in the document View tab.

**Architecture:** A pure `renderMarkdown()` util converts raw `.md` source to sanitized HTML via a unified/remark→rehype pipeline (raw HTML dropped at the AST, remote images removed, link schemes sanitized, links hardened). A new `DocumentViewerMarkdown.vue` fetches the raw source and renders that HTML. The View-tab dispatcher selects it for documents whose content type is Markdown, detected by a new `Document.isMarkdown` getter. Markdown is also registered in the content-type registry for proper labelling.

**Tech Stack:** Vue 3 (`<script setup>`), Pinia, Vitest + Vue Test Utils, unified/remark/rehype, yarn.

## Global Constraints

- Package manager is **yarn** (there is a `yarn.lock`). Use `yarn` for installs and scripts.
- Unit tests run with **`yarn test:unit <path>`** (`vitest --run`).
- **No single-line `if` statements without braces.** Always use braces.
- Place `catch` / `else` on their own line after the closing brace, matching existing code (`src/store/pipelines/SanitizeHtml.js`, `src/mixins/datashareSourceMixin.js`).
- New single-file components use **`<script setup>`** (match `DocumentViewerAudio.vue` modern style, not the old Options-API `DocumentViewerJson.vue`).
- `v-html` is only ever used on output of `renderMarkdown()` (already sanitized), and must carry an `eslint-disable-next-line vue/no-v-html` comment plus a note that the content is sanitized upstream.
- Verified dependency versions: `unified@11`, `remark-parse@11`, `remark-gfm@4`, `remark-rehype@11`, `rehype-sanitize@6`, `rehype-stringify@10`, `unist-util-visit@5`.
- Markdown content types: `text/x-web-markdown` (canonical, Tika) and `text/markdown` (defensive). **During Task 5, verify against a real indexed `.md` document** and adjust the single detection array if it differs.

---

### Task 1: Add Markdown rendering dependencies

**Files:**
- Modify: `package.json` (dependencies / devDependencies)

**Interfaces:**
- Consumes: nothing.
- Produces: runtime availability of `unified`, `remark-parse`, `remark-gfm`, `remark-rehype`, `rehype-sanitize`, `rehype-stringify`, `unist-util-visit`.

- [ ] **Step 1: Add the dependencies**

Run (this also promotes `remark-gfm` from devDependencies to dependencies):

```bash
yarn add unified@^11 remark-parse@^11 remark-gfm@^4 remark-rehype@^11 rehype-sanitize@^6 rehype-stringify@^10 unist-util-visit@^5
```

- [ ] **Step 2: Verify the packages resolve**

Run:

```bash
node --input-type=module -e "import('unified').then(()=>import('rehype-sanitize')).then(m=>console.log('ok', typeof m.defaultSchema))"
```

Expected: prints `ok object`.

- [ ] **Step 3: Commit**

```bash
git add package.json yarn.lock
git commit -m "build: add remark/rehype markdown rendering dependencies"
```

---

### Task 2: `renderMarkdown` safe-render util (the core)

**Files:**
- Create: `src/utils/markdown.js`
- Test: `tests/unit/specs/utils/markdown.spec.js`

**Interfaces:**
- Consumes: the dependencies from Task 1.
- Produces: `renderMarkdown(source: string) => string` — returns sanitized HTML; returns `''` for empty/falsy input.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/specs/utils/markdown.spec.js`:

```js
import { renderMarkdown } from '@/utils/markdown'

describe('renderMarkdown', () => {
  it('renders GFM features', () => {
    const html = renderMarkdown(
      ['# Title', '', '| a | b |', '| - | - |', '| 1 | 2 |', '', '- [x] done', '- [ ] todo', '', '~~struck~~', '', 'https://example.org/report'].join('\n')
    )
    expect(html).toContain('<h1>Title</h1>')
    expect(html).toContain('<table>')
    expect(html).toMatch(/<input[^>]*type="checkbox"/)
    expect(html).toContain('<del>struck</del>')
    expect(html).toContain('href="https://example.org/report"')
  })

  it('strips dangerous HTML, schemes and remote images', () => {
    const html = renderMarkdown(
      ['<script>alert(1)</script>', '<img src="x" onerror="alert(1)">', '<iframe src="https://evil.example"></iframe>', '[x](javascript:alert(1))', '![p](https://evil.example/track.png)'].join('\n\n')
    )
    expect(html).not.toContain('<script')
    expect(html).not.toContain('onerror')
    expect(html).not.toContain('<iframe')
    expect(html).not.toContain('javascript:')
    expect(html).not.toContain('<img')
  })

  it('hardens links with rel and target', () => {
    const html = renderMarkdown('[safe](https://example.org)')
    expect(html).toContain('rel="noopener noreferrer nofollow"')
    expect(html).toContain('target="_blank"')
  })

  it('returns an empty string for empty input', () => {
    expect(renderMarkdown('')).toBe('')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:unit tests/unit/specs/utils/markdown.spec.js`
Expected: FAIL — cannot resolve `@/utils/markdown`.

- [ ] **Step 3: Write the implementation**

Create `src/utils/markdown.js`:

```js
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'

// Strict allowlist: clone of rehype-sanitize's GitHub schema with images
// removed (no remote-image tracking/exfiltration) and rel/target allowed on
// anchors so the link-hardening plugin's attributes survive sanitization.
const schema = structuredClone(defaultSchema)
schema.tagNames = schema.tagNames.filter((tag) => tag !== 'img')
delete schema.attributes.img
schema.attributes = schema.attributes || {}
schema.attributes.a = [...(schema.attributes.a || []), 'target', 'rel']

// Force every surviving anchor to open safely.
function rehypeHardenLinks() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'a') {
        node.properties = node.properties || {}
        node.properties.rel = ['noopener', 'noreferrer', 'nofollow']
        node.properties.target = '_blank'
      }
    })
  }
}

// Built once and reused. remarkRehype defaults allowDangerousHtml:false, so raw
// HTML embedded in the markdown is dropped before it can reach the output.
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeHardenLinks)
  .use(rehypeSanitize, schema)
  .use(rehypeStringify)

/**
 * Convert Markdown source to sanitized, safe-to-render HTML.
 *
 * @param {string} source - Raw markdown text.
 * @returns {string} Sanitized HTML (empty string for empty input).
 */
export function renderMarkdown(source) {
  if (!source) {
    return ''
  }
  return String(processor.processSync(source))
}

export default renderMarkdown
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test:unit tests/unit/specs/utils/markdown.spec.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/utils/markdown.js tests/unit/specs/utils/markdown.spec.js
git commit -m "feat: add safe renderMarkdown util (remark + rehype-sanitize)"
```

---

### Task 3: `Document.isMarkdown` getter

**Files:**
- Modify: `src/api/resources/Document.js` (add getter after `isJson`, around line 454)
- Test: `tests/unit/specs/api/resources/Document.spec.js`

**Interfaces:**
- Consumes: `this.contentType` (existing getter).
- Produces: `Document.isMarkdown: boolean`.

- [ ] **Step 1: Write the failing test**

Add to `tests/unit/specs/api/resources/Document.spec.js` (after the JSON describe block, ~line 36):

```js
  describe('check if document is of Markdown type', () => {
    it('should be a Markdown file (x-web-markdown)', () => {
      const doc = new Document({ _source: { contentType: 'text/x-web-markdown' } })
      expect(doc.isMarkdown).toBeTruthy()
    })

    it('should be a Markdown file (text/markdown)', () => {
      const doc = new Document({ _source: { contentType: 'text/markdown' } })
      expect(doc.isMarkdown).toBeTruthy()
    })

    it('should NOT be a Markdown file', () => {
      const doc = new Document({ _source: { contentType: 'text/plain' } })
      expect(doc.isMarkdown).toBeFalsy()
    })
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:unit tests/unit/specs/api/resources/Document.spec.js`
Expected: FAIL — `doc.isMarkdown` is `undefined` (falsy) so the truthy assertions fail.

- [ ] **Step 3: Write the implementation**

In `src/api/resources/Document.js`, add immediately after the `isJson` getter (which ends at line 454):

```js
  get isMarkdown() {
    return ['text/x-web-markdown', 'text/markdown'].includes(this.contentType)
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test:unit tests/unit/specs/api/resources/Document.spec.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/api/resources/Document.js tests/unit/specs/api/resources/Document.spec.js
git commit -m "feat: add Document.isMarkdown content-type getter"
```

---

### Task 4: Register Markdown in the content-type registry

**Files:**
- Modify: `src/utils/contentTypes.json` (add entry after the `text/plain` block, ~line 555)
- Test: `tests/unit/specs/api/resources/Document.spec.js`

**Interfaces:**
- Consumes: `Document.contentTypeLabel` (existing getter, reads `contentTypes.json`).
- Produces: a `text/x-web-markdown` registry entry with label/icon/extensions.

- [ ] **Step 1: Write the failing test**

Add to `tests/unit/specs/api/resources/Document.spec.js` (after the Markdown describe block from Task 3):

```js
  describe('Markdown content-type registry', () => {
    it('exposes a human label for markdown', () => {
      const doc = new Document({ _source: { contentType: 'text/x-web-markdown' } })
      expect(doc.contentTypeLabel).toBe('Markdown document')
    })
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:unit tests/unit/specs/api/resources/Document.spec.js`
Expected: FAIL — `contentTypeLabel` is `null` (no registry entry yet).

- [ ] **Step 3: Add the registry entry**

In `src/utils/contentTypes.json`, insert this entry directly after the closing `}` of the `"text/plain"` block (before `"text/csv"`). Add the trailing comma on the preceding `}` so JSON stays valid:

```json
  "text/x-web-markdown": {
    "label": "Markdown document",
    "icon": "text",
    "extensions": [
      ".md",
      ".markdown"
    ],
    "description": {
      "en": "A lightweight markup document. Rendered as formatted text in Datashare."
    },
    "preview": "yes"
  },
```

(`"icon": "text"` reuses the existing Phosphor `file-text` icon — no new icon import is needed; see `src/utils/iconFiles.js`.)

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test:unit tests/unit/specs/api/resources/Document.spec.js`
Expected: PASS.

- [ ] **Step 5: Validate the JSON is well-formed**

Run:

```bash
node -e "require('./src/utils/contentTypes.json'); console.log('valid json')"
```

Expected: prints `valid json`.

- [ ] **Step 6: Commit**

```bash
git add src/utils/contentTypes.json tests/unit/specs/api/resources/Document.spec.js
git commit -m "feat: register text/x-web-markdown content type"
```

---

### Task 5: `DocumentViewerMarkdown.vue` component

**Files:**
- Create: `src/components/Document/DocumentViewer/DocumentViewerMarkdown.vue`
- Test: `tests/unit/specs/components/Document/DocumentViewer/DocumentViewerMarkdown.spec.js`

**Interfaces:**
- Consumes: `renderMarkdown(source)` from Task 2; `useCore().api.getSource(document, { responseType: 'text' })`; i18n keys `document.errorNotFound` and `document.notAvailable` (both already exist in `src/lang/en.json`).
- Produces: a component named `DocumentViewerMarkdown` resolvable by the dispatcher in Task 6.

- [ ] **Step 0: Verify the real Markdown content type (one-time check)**

If a running Datashare with an indexed `.md` document is available, confirm its `contentType` (e.g. via the document metadata / API). If it is **not** `text/x-web-markdown` or `text/markdown`, update the array in `src/api/resources/Document.js` (Task 3) and the registry key in `src/utils/contentTypes.json` (Task 4) accordingly, and re-run their tests. If no environment is available, proceed with the current values (they are the Tika defaults) and leave a note in the PR description.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/specs/components/Document/DocumentViewer/DocumentViewerMarkdown.spec.js`:

```js
import { shallowMount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentViewerMarkdown from '@/components/Document/DocumentViewer/DocumentViewerMarkdown'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      getSource: vi.fn()
    }
  }
})

import { apiInstance } from '@/api/apiInstance'

describe('DocumentViewerMarkdown.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('renders sanitized HTML from the markdown source', async () => {
    apiInstance.getSource.mockResolvedValue('# Hello\n\n<script>alert(1)</script>')
    const { plugins } = CoreSetup.init().useAll()
    const wrapper = shallowMount(DocumentViewerMarkdown, {
      global: { plugins },
      props: { document: { url: 'doc.md' } }
    })
    await flushPromises()

    const content = wrapper.find('.markdown-viewer__content')
    expect(content.exists()).toBe(true)
    expect(content.html()).toContain('<h1>Hello</h1>')
    expect(content.html()).not.toContain('<script')
  })

  it('shows an error message when the source cannot be fetched', async () => {
    apiInstance.getSource.mockRejectedValue({ response: { status: 404 } })
    const { plugins } = CoreSetup.init().useAll()
    const wrapper = shallowMount(DocumentViewerMarkdown, {
      global: { plugins },
      props: { document: { url: 'missing.md' } }
    })
    await flushPromises()

    expect(wrapper.find('.markdown-viewer__error').exists()).toBe(true)
    expect(wrapper.find('.markdown-viewer__content').exists()).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:unit tests/unit/specs/components/Document/DocumentViewer/DocumentViewerMarkdown.spec.js`
Expected: FAIL — cannot resolve `@/components/Document/DocumentViewer/DocumentViewerMarkdown`.

- [ ] **Step 3: Write the implementation**

Create `src/components/Document/DocumentViewer/DocumentViewerMarkdown.vue`:

```vue
<template>
  <div class="markdown-viewer py-3">
    <div
      v-if="error"
      class="markdown-viewer__error p-3 text-center"
    >
      {{ error }}
    </div>
    <!--
      Safe to use v-html here: `html` is the output of renderMarkdown(), which
      sanitizes the content (no raw HTML, no remote images, hardened links).
    -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div
      v-else
      class="markdown-viewer__content"
      v-html="html"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCore } from '@/composables/useCore'
import { renderMarkdown } from '@/utils/markdown'

/**
 * Display a Markdown document as safely-sanitized formatted HTML.
 */
const props = defineProps({
  /**
   * The selected document
   */
  document: {
    type: Object,
    default: null
  }
})

const { t } = useI18n()
const core = useCore()

const html = ref('')
const error = ref(null)

onMounted(async () => {
  try {
    const source = await core.api.getSource(props.document, { responseType: 'text' })
    html.value = renderMarkdown(source)
  }
  catch (e) {
    if (e?.response?.status === 404) {
      error.value = t('document.errorNotFound')
    }
    else {
      error.value = t('document.notAvailable')
    }
  }
})
</script>

<style lang="scss">
.markdown-viewer {
  max-width: 100%;
  overflow-x: auto;

  &__content {
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin-top: $spacer;
    }

    table {
      border-collapse: collapse;

      th,
      td {
        border: 1px solid var(--bs-border-color);
        padding: $spacer-xxs $spacer-xs;
      }
    }

    pre {
      padding: $spacer;
      overflow-x: auto;
      background: var(--bs-tertiary-bg);
      border-radius: var(--bs-border-radius);
    }

    blockquote {
      margin: 0;
      padding-left: $spacer;
      border-left: 4px solid var(--bs-border-color);
    }

    img {
      max-width: 100%;
    }
  }
}
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test:unit tests/unit/specs/components/Document/DocumentViewer/DocumentViewerMarkdown.spec.js`
Expected: PASS (2 tests).

> If `$spacer-xxs` / `$spacer-xs` are not defined in this project's SCSS variables, substitute the available spacing tokens (grep `src` for `\$spacer-` to see what exists) or use literal `0.25rem` / `0.5rem`. The test does not depend on the styles.

- [ ] **Step 5: Commit**

```bash
git add src/components/Document/DocumentViewer/DocumentViewerMarkdown.vue tests/unit/specs/components/Document/DocumentViewer/DocumentViewerMarkdown.spec.js
git commit -m "feat: add DocumentViewerMarkdown component"
```

---

### Task 6: Wire Markdown into the View-tab dispatcher

**Files:**
- Modify: `src/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.vue:28-50` (the `previewComponent` switch)
- Test: `tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.spec.js`

**Interfaces:**
- Consumes: `Document.isMarkdown` (Task 3); the `DocumentViewerMarkdown` component (Task 5).
- Produces: `previewComponent === 'DocumentViewerMarkdown'` for Markdown documents.

- [ ] **Step 1: Write the failing test**

Add to `tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.spec.js` (before the closing `})` of the top-level describe):

```js
  it('should call the DocumentViewerMarkdown component for Markdown document', async () => {
    const document = await letData(es)
      .have(new IndexedDocument(id, index).withContentType('text/x-web-markdown'))
      .commitAndGetLastDocument()
    await documentStore.getDocument({ id, index })

    const wrapper = shallowMount(DocumentViewTabsViewer, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props: { document, disabled }
    })

    expect(wrapper.vm.previewComponent).toBe('DocumentViewerMarkdown')
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:unit tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.spec.js`
Expected: FAIL — `previewComponent` resolves to `null`, not `'DocumentViewerMarkdown'`.

- [ ] **Step 3: Add the dispatch case**

In `src/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.vue`, add a case to the `previewComponent` switch, right after the `isJson` case (line 31-32):

```js
    case document.value.isJson:
      return 'DocumentViewerJson'
    case document.value.isMarkdown:
      return 'DocumentViewerMarkdown'
```

(No other change is needed: `asyncPreviewComponent` already lazy-loads `@/components/Document/DocumentViewer/${componentName}.vue`, which resolves the new component.)

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test:unit tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.spec.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.vue tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.spec.js
git commit -m "feat: render markdown documents in the View tab"
```

---

### Task 7: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Run the full unit suite for touched areas**

Run:

```bash
yarn test:unit tests/unit/specs/utils/markdown.spec.js tests/unit/specs/api/resources/Document.spec.js tests/unit/specs/components/Document/DocumentViewer/DocumentViewerMarkdown.spec.js tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.spec.js
```

Expected: all PASS.

- [ ] **Step 2: Lint the new/changed files**

Run:

```bash
yarn lint src/utils/markdown.js src/components/Document/DocumentViewer/DocumentViewerMarkdown.vue src/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.vue src/api/resources/Document.js
```

Expected: no errors. Fix any reported issues and re-run.

- [ ] **Step 3: Manual smoke test (if a Datashare instance is available)**

Open a `.md` document and switch to the **View** tab. Expected: formatted Markdown (headings, lists, tables, code). Confirm a remote image in the source does not load and no script executes.

## Self-Review notes

- **Spec coverage:** detection (Task 3), dispatch (Task 6), safe renderer (Task 2), viewer component (Task 5), content-type registry (Task 4), dependencies (Task 1), tests (each task + Task 7). All spec sections covered.
- **MIME open item:** carried into Task 5 Step 0 with a concrete resolution path.
- **Type consistency:** `renderMarkdown(source) => string` used identically in Tasks 2 and 5; `isMarkdown` used identically in Tasks 3 and 6; component name `DocumentViewerMarkdown` consistent across Tasks 5 and 6.
- **Out of scope (unchanged from spec):** no raw/rendered toggle, no syntax highlighting, no image proxy, no large-file guard.
