# Safe Markdown rendering in the View tab

**Date:** 2026-06-23
**Status:** Approved design — ready for implementation plan
**Area:** `datashare-client` — document View tab

## Problem

When a user opens a Markdown (`.md`) document in Datashare, the **View** tab
(`DocumentViewTabsViewer.vue`) shows "document not available": there is no
viewer registered for Markdown, and no Markdown content type is defined in
`contentTypes.json`. The raw text is only visible, unformatted, in the **Text**
tab.

We want the View tab to render Markdown as formatted HTML — **safely**, because
Datashare handles untrusted, potentially malicious leaked material. Markdown can
embed raw HTML, `<script>`, `javascript:` links, and remote images (a tracking /
exfiltration vector). None of that may execute or phone home.

## Decisions (settled during brainstorming)

| Decision | Choice |
|----------|--------|
| What to render | The **raw source file** (`getSource()`), not the extracted text |
| Detection | **By content type** (`isMarkdown` getter) |
| Safety posture | **Strict**: no raw HTML, no remote images, sanitized link schemes |
| Rendering stack | **unified / remark + rehype-sanitize** (AST allowlist) |
| Content-type registry | **Register** markdown in `contentTypes.json` |
| Render logic home | **Plain util** (`src/utils/markdown.js`), not a composable |

The stack choice was validated with a live side-by-side demo
(marked+xss vs remark+rehype-sanitize) over an adversarial sample. Both stacks
passed the strict bar; `remark + rehype-sanitize` was chosen for its AST-based
allowlist, the fact that raw HTML is dropped before it ever reaches a sanitizer,
and because `remark-gfm` is already a project dependency.

## Architecture

Four small, independently-testable units, following existing viewer patterns.

### 1. Detection — `src/api/resources/Document.js`

Add an `isMarkdown` getter next to `isJson`:

```js
get isMarkdown() {
  return ['text/x-web-markdown', 'text/markdown'].includes(this.contentType)
}
```

`text/x-web-markdown` is the MIME type Apache Tika (Datashare's extractor)
assigns to `.md` files; `text/markdown` (RFC 7763) is included defensively.

> **Open item to verify during implementation:** open a real indexed `.md`
> document and confirm its `contentType`. If it differs from the above, adjust
> this one array — it is the single point of truth for detection.

### 2. Dispatch — `DocumentViewTabsViewer.vue`

Add a case to the `previewComponent` switch. Markdown is `text/*`, so it cannot
collide with the `image/` / `audio/` / `video/` prefix checks; place it
alongside the other exact-type cases:

```js
case document.value.isMarkdown:
  return 'DocumentViewerMarkdown'
```

The existing `defineAsyncComponent` machinery lazy-loads the new viewer (and its
remark stack) only when a Markdown document is opened.

### 3. Safe renderer — `src/utils/markdown.js`

A pure function `renderMarkdown(source: string) => string` returning **sanitized**
HTML. The unified processor is built once at module load and reused.

Pipeline:

```
unified()
  .use(remarkParse)
  .use(remarkGfm)          // tables, task lists, strikethrough, autolinks, footnotes
  .use(remarkRehype)       // allowDangerousHtml:false (default) → raw HTML dropped at AST
  .use(rehypeHardenLinks)  // local plugin: rel + target on every <a>
  .use(rehypeSanitize, strictSchema)
  .use(rehypeStringify)
```

**`strictSchema`** — a clone of `rehype-sanitize`'s `defaultSchema` (the GitHub
schema) with two changes:
- remove `img` from `tagNames` and delete `attributes.img` → **remote images
  cannot load**;
- allow `rel` and `target` on `a` (so the hardening plugin's attributes survive
  sanitization).

**`rehypeHardenLinks`** — a tiny local rehype plugin (using `unist-util-visit`)
that sets `rel="noopener noreferrer nofollow"` and `target="_blank"` on every
anchor element. Runs *before* `rehypeSanitize` so the schema validates the
result. (`rehype-sanitize` already strips `javascript:`/`data:` href schemes via
the default schema's protocol allowlist.)

This reproduces exactly the behavior verified in the demo.

### 4. Viewer component — `src/components/Document/DocumentViewer/DocumentViewerMarkdown.vue`

`<script setup>` component (matching `DocumentViewerAudio.vue` style, not the
older Options-API `DocumentViewerJson.vue`):

- prop `document` (Object)
- on mount, fetch raw text via `useCore().api.getSource(document)`; surface a
  localized error (reuse the not-found message pattern) on failure
- compute `renderMarkdown(rawText)` → sanitized HTML
- render the **already-sanitized** HTML with `v-html` inside a scoped
  `.markdown-viewer` container, with a code comment stating the content is
  sanitized upstream by `renderMarkdown` (this is the one justified `v-html`)
- loading and error states
- scoped SCSS for Markdown typography (headings, tables, code blocks, inline
  code, blockquotes, lists, task-list checkboxes) using existing theme tokens
  (`$spacer`, etc.) so it matches Datashare's look

### 5. Content-type registry — `src/utils/contentTypes.json`

Add an entry so Markdown docs get a proper label and icon everywhere (metadata,
lists, filters), not just in the viewer:

```json
"text/x-web-markdown": {
  "label": "Markdown document",
  "icon": "text",
  "extensions": [".md", ".markdown"],
  "description": {
    "en": "A lightweight markup document. Rendered as formatted text in Datashare."
  },
  "preview": "yes"
}
```

`"icon": "text"` reuses the existing Phosphor `file-text` icon (no new icon
import needed). If detection also relies on `text/markdown`, add a matching
entry (or document that `text/x-web-markdown` is canonical).

## Dependencies

Promote `remark-gfm` from `devDependencies` to `dependencies`, and add as runtime
dependencies: `unified`, `remark-parse`, `remark-rehype`, `rehype-sanitize`,
`rehype-stringify`, and `unist-util-visit` (for the link-hardening plugin).
Verified working versions: `unified@11`, `remark-parse@11`, `remark-gfm@4`,
`remark-rehype@11`, `rehype-sanitize@6`, `rehype-stringify@10`.

## Testing

- **`renderMarkdown` unit test** (the core safety guarantee) — mirror the demo
  assertions:
  - *kept*: headings, bold/italic, strikethrough, tables, task-list checkboxes,
    fenced code, blockquotes, autolinked bare URLs, footnotes;
  - *stripped/neutralized*: `<script>`, `<iframe>`, `<style>`, `onerror=`,
    `onclick=`, `javascript:` href, remote `<img>`;
  - anchors carry `rel="noopener noreferrer nofollow"` and `target="_blank"`.
- **`Document.isMarkdown` getter test** — mirrors the existing `isJson` test in
  `tests/unit/specs/api/resources/Document.spec.js`.
- **Component test** (Vue Test Utils) — mounts with a mocked `getSource`,
  asserts sanitized HTML renders, and that the error state shows when the fetch
  rejects.

## Out of scope (YAGNI)

- Rendering Markdown anywhere other than the View tab.
- A "view raw vs rendered" toggle.
- Syntax highlighting inside fenced code blocks.
- Loading remote images behind a proxy/allowlist.
- Large-file guards (the existing Text tab `hasBigContentTextLength` threshold
  is separate; revisit only if real `.md` files prove large enough to lag).
