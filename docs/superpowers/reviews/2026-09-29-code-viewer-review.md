# Code review: feat/code-viewer vs main (max effort)

10 finder angles, 1 verifier per candidate, 1 gap sweep. 15 findings, most severe first.
Verdicts: CONFIRMED = reproduced; PLAUSIBLE = mechanism real, trigger uncertain.
Refuted and dropped: empty-term infinite loop (no reachable caller), blur race across documents (AppWait remounts the viewer per document), JSON tree loss (intended by the design spec), MIME parameters in `isCode` (backend strips them).

## Correctness

### 1. Emoji before a match corrupts search ranges : CONFIRMED
`src/utils/strings.js:141-142`. `findFoldedMatches` indexes `sourceIndexes`/`sourceEnds` (one slot per code point) with a UTF-16 index into `folded.join('')`.
- `😀😀abc abc\nabc`, term `abc` → `[{6,9},{10,null}]` instead of 3 matches; `view.dispatch` throws, no marks painted.
- `{"text":"🔥🔥 fire"}`, term `fire` → highlights `re"}`.
- Bug exists on main (HTML marks: `<p>😀abc</p>` marks `bc`), but the new viewer now feeds `null` ranges to CodeMirror. Tweet JSON and chat exports hit this constantly.

### 2. 50 MB cap bypassed for embedded documents : CONFIRMED
`DocumentViewerCode.vue:79` `contentLength > MAX_CONTENT_LENGTH` lets `-1` through. The indexer stores `-1` when Tika has no Content-Length, which is the usual case for embeds (datashare `ElasticsearchSpewer.java:286`, `DocumentSourceAccess.java:102-104`). An embedded text file up to ~1 GB is fetched into one string and split by CodeMirror. On main these types showed "not available" with no request.

### 3. Short term on a large file freezes the tab : CONFIRMED
`DocumentViewerCode.vue:158-178`. Search and paint are synchronous and unbounded; `matches` is a deep `ref` (`useDocumentLocalSearch.js:17`) so each paint proxies every match, and `watch([matches, activeIndex], paintMatches)` rebuilds the whole decoration set per next/prev click.
- 50 MB log, term `e`: 3M matches, ~6 s search, ~15 s first paint, ~8 s per click.
- Fix: base marks built once per search, active mark in its own one-range field (click → ~0 ms). `shallowRef`/`toRaw` alone gets a click to ~480 ms.

### 4. EditorView leaked when unmounted mid-load : CONFIRMED
`DocumentViewerCode.vue:108,123,185`. Unmount doesn't bump `lastLoad` and `view?.destroy()` sees `null`, so the late load builds `new EditorView({ parent: null })`. It registers window `resize`/`scroll` and document `selectionchange` listeners and is never destroyed, pinning the whole source. Trigger: switch tab or open a different-type document while a big source is fetching.

### 5. Source always decoded as UTF-8 : CONFIRMED
`DocumentViewerCode.vue:120` `fetchSource(document, { responseType: 'text' })`. Backend sends raw bytes with the bare content type (`DocumentSourceAccess.java:83`); `contentEncoding` is indexed but never read by the client. Windows-1252 `café` shows `caf�` and local search for `café` finds 0 while the Text tab shows it correctly.

### 6. HTML lost its preview-server path : CONFIRMED
`DocumentViewTabsViewer.vue:13`. `text/html` left `paginatedTypes`, so HTML now fetches raw source. A 403 (allowFromMask) or 413 now shows "Preview is not available for this document type." (`useDocumentSource.js:25-28`), which is wrong wording, and HTML over 50 MB is refused where main rendered preview pages.

### 7. Blurred documents leak through search and on failure : CONFIRMED / PLAUSIBLE
`DocumentViewerCode.vue:60,181,198`.
- CONFIRMED: `:disabled="blurred"` doesn't disable local search (`DocumentToolbox.vue:78` sits outside the fieldset), so occurrence counts reveal hidden content.
- CONFIRMED: a rejected banner request leaves `blurred = false`, and the rejected promise is cached per project (`documentPathBanners.js:80`), so every later document in that project fails open.
- PLAUSIBLE: `blurred` starts `false`; on a project's first document the source can render before banners arrive. Pdf avoids this with `ref(null)`.
- All three patterns already exist in Docx/Pdf on main; this viewer copies them.

### 8. Chunked search loses matches at 64K boundaries : CONFIRMED
`src/utils/codeSearchIndex.js:9-51`.
- Self-overlapping terms shift phase: `'b' + 'a'.repeat(131072)`, term `aa` → 65535 matches instead of 65536; every later highlight is off by one.
- `CHUNK_OVERLAP` counts source UTF-16 units, not folded characters: 600 × `é` (1200 units) across a boundary → 0 matches, contradicting the comment at lines 7-8.
- Fix: scan each candidate chunk from where the last kept match ended, or resolve offsets only at hits and drop chunking.

### 9. Term-count chips disagree with the raw source : CONFIRMED
`DocumentViewerCode.vue:192-200` doesn't pass `no-count`, unlike Pdf/Docx (Docx dropped counts on purpose in `c130ac013`). Chips count the indexed extracted text; now that HTML opens here, `div` reads 0 while local search finds hundreds.

### 10. Language pack blocks already-fetched text : CONFIRMED
`DocumentViewerCode.vue:119` `await Promise.all([fetchSource(...), findLanguage(document)])`. A stalled language chunk keeps the spinner up indefinitely, breaking the "only costs the colors" contract in `codeLanguage.js`. Render plain text first, reconfigure the language when it loads.

### 11. Embedded files use the container's name for language : CONFIRMED
`src/utils/codeLanguage.js:22-23` matches on `document.basename`, which is the root's name for embeds (extract `EmbeddedTikaDocument.java:14`). `deploy.py` inside `inbox.mbox` is highlighted as Mbox. Use `document.title` (`Document.js:163-168`).

### 12. Greek final sigma never matches : CONFIRMED
`src/utils/strings.js:90,119`. `foldForFilter` maps ς→σ, the matcher doesn't. `οδος` in `ΟΔΟΣ` → `[]`, and vice versa. Pre-existing in HTML marks; the PR fixed only the prefilter. Adding the ς→σ mapping inside `foldCharacter` fixes both and makes `foldForFilter` unnecessary.

### 13. Language detection misses common cases : CONFIRMED
`src/utils/codeLanguage.js:13,23`.
- `matchFilename` is case-sensitive: `MAIN.H`, `App.VUE` → no highlighting.
- MIME-subtype guess: `application/xml-dtd`, `text/x-vbdotnet` → none, `application/xhtml+xml` → XML. `document.standardExtension` resolves DTD, VB.NET, HTML.

### 14. Source not reachable by keyboard : PLAUSIBLE
`DocumentViewerCode.vue:93`. `EditorView.editable.of(false)` sets `contenteditable="false"` and CodeMirror adds no tabindex, so keyboard users can't focus, scroll long lines sideways, or select text. `EditorState.readOnly.of(true)` alone blocks edits and keeps focus (or add `EditorView.contentAttributes.of({ tabindex: '0' })`).

### 15. Lone `\r` line ending keeps the empty last line : CONFIRMED
`DocumentViewerCode.vue:35` `/\r?\n$/` vs CodeMirror's `/\r\n?|\n/`. `'a\rb\r'` → 3 lines. Use `/(?:\r\n?|\n)$/`.

## Cleanups (not bugs)
- `DocumentViewerCode.vue:159`: `.map(match => ({ page: 1, ...match }))` copies every match for a field this viewer never reads.
- `tests/unit/resources/document.json`: dead fixture, only the deleted `DocumentViewerJson.spec.js` used it.
- `DocumentViewerCode.vue:34`: `MAX_CONTENT_LENGTH` belongs in `src/utils/settings.js` next to `previewRawMaxContentLength`.
- `Document.js:470`: `isCode` keeps its own MIME list; `contentTypes.json` already tags most as `PlainText` (the pattern `isMarkdown` uses).
- Active mark colour `#38d878` is now hard-coded in a third component (`DocumentContent.vue`, `DocumentViewerDocx.vue`).
