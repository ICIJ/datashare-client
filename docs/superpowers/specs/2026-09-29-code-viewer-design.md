# Code viewer for the View tab

## Goal

Show code and text documents in the document **View** tab as read-only, syntax-highlighted source, with the same toolbox (local search bar on top) as the other viewers, and colors that follow the light/dark theme.

Covers XML, JSON, plain text, C#, SQL, CSS, YAML, HTML, Java, PHP, JavaScript, Python and every other language CodeMirror knows.

## Decisions

| Topic | Decision |
|---|---|
| Library | CodeMirror 6, read-only |
| JSON | Replaces `DocumentViewerJson` (tree view) |
| HTML | Replaces the page thumbnails of `DocumentViewerPaginated` |
| Large files | Virtual rendering (CodeMirror only renders visible lines), no pages |
| Toolbox | Search bar and occurrence navigation only, no page picker |
| Size cap | Above 50 MB (`document.contentLength`), show "too large to preview" and download nothing. Unknown length is allowed |
| Markdown, CSV, PDF, DOCX, Word, PPTX, images, media | Unchanged |

## Routing

`src/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.vue`

- Remove the `isJson` case.
- Remove `text/html` from `paginatedTypes`.
- Add `case document.value.isCode: return 'DocumentViewerCode'` as the **last** case before `default`, so every other viewer keeps priority (Markdown, CSV spreadsheet, etc.).

`src/api/resources/Document.js`

- New getter `isCode`, next to `isJson` and `isMarkdown`: true when the content type starts with `text/`, or is one of a short list of code types filed under `application/` (`application/json` and its variants such as `application/json; twint`, `application/xml`, `application/javascript`, `application/x-yaml`, `application/x-sh`, `application/x-httpd-php`, `application/sql`). The final list is checked against `src/utils/contentTypes.json` during implementation.

Documents with any other type keep showing "Preview is not available".

## Language detection

`src/utils/codeLanguage.js`, one exported async function taking a document and returning a CodeMirror `LanguageSupport` or `null`:

1. `LanguageDescription.matchFilename(languages, document.basename)` from `@codemirror/language-data`.
2. Otherwise a match on the content type (`LanguageDescription.matchLanguageName` or a small content type → language name map).
3. Otherwise `null` (plain text, no colors).

A rejected language pack load resolves to `null`.

## Component

`src/components/Document/DocumentViewer/DocumentViewerCode.vue`, `<script setup>`, same skeleton as `DocumentViewerDocx.vue`:

1. `<document-toolbox>` bound to `useDocumentLocalSearch({ findMatches })`: `term`, `activeIndex`, `occurrences`, `loading`. No `total-pages`, so the page picker stays hidden. `disabled` while blurred.
2. Blurred content: `useDocumentPreview().isBlurred` and `getBlurredContentBanner`, shown with `dismissable-content-warning-toggler`, like DOCX.
3. Size guard: `contentLength > 50 MB` shows a new localized "too large to preview" message. `fetchSource` is never called.
4. Loading: `fetchSource(document, { responseType: 'text' })` from `useDocumentSource`, spinner while loading. Each load gets an id and only the newest load writes its text, language or error (same guard as `DocumentViewerMarkdown.vue`).
5. Editor: one `EditorView`, created on first load, reused on document change (replace the doc and reconfigure a language `Compartment`), destroyed on unmount.
   - `EditorState.readOnly.of(true)` and `EditorView.editable.of(false)`: no cursor, text still selectable and copyable.
   - `lineNumbers()`, no line wrapping, horizontal scroll for long lines.
   - The page scrolls vertically (the editor has auto height), so the sticky toolbox behaves like on DOCX.

Rerunning a search after a document swap goes through the composable's `refresh()`, like DOCX.

## Search

- `findMatches(term)` is case and accent insensitive, like the other tabs, using `foldWithSourceIndexes` from `src/utils/strings.js`.
- The helper keeps two offset arrays per character, too heavy for a 50 MB file. So on load the text is folded **line by line** into plain strings only. On search, each folded line is scanned with `indexOf`; the offset arrays are built only for lines that contain a match, to map folded positions back to source positions.
- Each match is `{ page: 1, from, to }` in document positions.
- Matches become `Decoration.mark` ranges with the existing `local-search-term` class, the active one with `local-search-term--active` (same colors as DOCX). A new term or active index updates the decorations and scrolls the active match to the center (`EditorView.scrollIntoView(from, { y: 'center' })`).
- An empty term removes all decorations.

## Theme

- `classHighlighter` from `@lezer/highlight` writes token classes (`tok-keyword`, `tok-string`, `tok-comment`...) instead of inline styles.
- A scoped SCSS palette colors those classes, with an override under `[data-bs-theme="dark"]`. Editor background, gutter, text and borders use Bootstrap CSS variables (`--bs-body-bg`, `--bs-body-color`, `--bs-border-color`, `--bs-tertiary-bg`).
- Switching theme updates colors with no JS.

## Errors

- Fetch failure: inline message from `useDocumentSource` (404 or "not available", already localized).
- Language pack failure: plain text, no message.

## Dependencies

New: `@codemirror/state`, `@codemirror/view`, `@codemirror/language`, `@codemirror/language-data`, `@lezer/highlight`. Loaded only when the viewer is imported (it is already loaded through `defineAsyncComponent`).

`json-formatter-js` and `src/components/JsonFormatter.vue` stay: `BatchSearchErrorModal.vue` still uses them.

## Files

- New: `src/components/Document/DocumentViewer/DocumentViewerCode.vue`, `src/utils/codeLanguage.js`, their specs.
- Edited: `DocumentViewTabsViewer.vue`, `Document.js`, `src/lang/en.json` (too large message), existing specs for both.
- Deleted: `src/components/Document/DocumentViewer/DocumentViewerJson.vue`, `tests/unit/specs/components/Document/DocumentViewer/DocumentViewerJson.spec.js`.

## Tests

Vitest with jsdom. CodeMirror state and decorations work in jsdom, layout does not, so tests read `view.state` and the rendered text, never positions.

- `codeLanguage.spec.js`: file name wins over content type, content type fallback, plain text fallback, rejected load gives `null`.
- `Document.spec.js`: `isCode` is true for `text/plain`, `text/html`, `application/json`, `application/xml`, false for `application/pdf` and `image/png`.
- `DocumentViewTabsViewer.spec.js`: JSON and HTML route to `DocumentViewerCode`; Word, PPTX, CSV and Markdown keep their viewers.
- `DocumentViewerCode.spec.js`:
  - shows the fetched source;
  - the editor is read-only;
  - no fetch above 50 MB, message shown;
  - fetch error shows the message;
  - `findMatches` counts case- and accent-insensitive matches across lines, with correct source positions;
  - a document swap replaces the text;
  - a stale load does not overwrite a newer one.
- Manual check with `yarn serve`: light and dark theme, a large log, a JSON, an HTML and a C# file.

## Out of scope

- Go-to-line input, page picker, line wrapping toggle.
- Editing, folding, minimap.
