# Markdown rendering in the document Text tab

Date: 2026-08-10
Status: approved (brainstorming session)
Approach: endpoint-first, single client release (revised at spec review from the
initial two-stage option)

## Goal

Render a document's extracted text as markdown in the Text tab, using the structure
artifacts served by the new artifacts API (ICIJ/datashare#2306), with pagination driven
by the artifact pages, and without losing any feature of the current plain-text view.

## Context

### New backend capability (ICIJ/datashare#2306, merged 2026-08-11)

- `GET /:project/artifacts/structure/:id` returns `{ "pages": N, "formats": ["md", "xhtml"] }`,
  404 when the document has no structure artifact.
- `GET /:project/artifacts/structure/:id/:page?format=md` returns one markdown page (1-based).
- Twin routes exist for plain-text page artifacts (`/artifacts/page/:id[/:page]`) and raw
  source bytes (`/artifacts/raw/:id`).
- All artifact routes are gated like `/documents/src` (project membership, download
  restriction, root-document size limit). 403/404 must fail closed on the client.
- `/documents/pages/:id` (PageIndices, char ranges of each physical page in the extracted
  text) is NOT deprecated. Only the live-reparse `/documents/content/pages/:id` is.

### Existing client pieces to reuse

- `renderMarkdown` (`src/utils/markdown.js:67`): remark + GFM + rehype-sanitize strict
  schema + external link hardening. Already a runtime dependency, used by the View tab
  for markdown documents.
- Branch `feat/markdown-download` (unmerged, Download-markdown button): has
  `api.getStructureManifest` (fail-closed probe, 401 reported on the error bus) and
  `api.getStructurePage`, with specs, plus a `hasMarkdown` computed with a
  stale-document-id guard in `useDocumentDownload`. The two API methods and the probe
  logic are cherry-picked/lifted by this feature; the download button itself stays on
  its own PR.

### Current Text tab behavior to preserve (`src/components/Document/DocumentContent.vue`)

1. Content loading by char-offset slices of 10k via `getDocumentSlice`.
2. Experimental "synced pages" for PDFs: real page boundaries as char ranges from
   `/documents/pages/:id`, gated by `mustSyncPages` (lines 202-216).
3. Local search: `searchDocument` returns `{count, offsets}` (char offsets into the raw
   extracted text); marks, counter and prev/next navigation are offset-driven
   (lines 296-361). Offsets cannot map onto markdown text.
4. In-body global query-term marks: regex string replace over cooked HTML
   (`src/store/pipelines/AddGlobalSearchMarks.js:18`), registered under
   `extracted-text:post` with SanitizeHtml (xss whitelist: `mark`, `p`), line breaks and
   empty-paragraph removal (`src/store/pipelines/index.js:11-14`).
5. Global-terms toolbox (`DocumentGlobalSearchTerms.vue:44-48`): counts come from
   `api.searchDocument` per term, independent of body rendering. Unaffected by this
   feature.
6. Translations: per-language slices via `targetLanguage`. Artifacts exist for the
   original language only.
7. RTL languages: `document-content--rtl` class flips `direction` on the body.
8. Plugin surface: `document.content.*` hooks and the `extracted-text` pipeline category.
9. Attachments block under the content.

## Decisions made during brainstorming

- Markdown is the default rendering when artifacts are available; a toggle switches to
  plain text. No persistence of the choice.
- Endpoint-first delivery, revised at spec review: the backend markdown search endpoint
  (follow-up to #2306, contract below) lands first, and the client ships once,
  markdown-native. The initial two-stage plan (ship with search flipping the body to
  plain text, upgrade later) was reversed because documents are usually opened from
  search results with an active query, which would have forced text mode and hidden
  markdown on the main entry path, while the coupled client-backend release cycle
  removes the early-shipping benefit the transitional flip was paying for.
- Client-only offset-approximation (mapping raw-text search offsets onto markdown) was
  rejected: counts would describe raw text while marks describe markdown, and they would
  disagree on real documents.
- Delivery: the backend endpoint is a prerequisite and now exists on ICIJ/datashare
  branch `feat/artifacts-structure-search` (no PR yet as of 2026-08-11; #2306 is
  merged). The client implementation plan derived from this spec develops against a
  local build of that branch until it merges.

## Design

### Mode gating

`DocumentContent` gets a `mode` computed with two values, `markdown` and `text`.
`markdown` is active when all of these hold:

- the structure manifest probe returned `pages > 0` and `formats` includes `md`;
- no translation is selected (`targetLanguage` empty or `original`);
- the user toggle is on markdown (its default).

Anything else falls back to `text`, the unchanged current code path.

Deliberately dropped from the old `mustSyncPages` guard: the PDF-only check (any
artifact-bearing format qualifies), the server-mode check (routes are access-gated
server-side), the `artifactDir` config check (the probe's 404 covers absence), and the
Tika-version check (artifacts are persisted at extraction time, so they cannot drift
from the indexed content the way the live-reparse endpoint could; see Assumptions).

### Components

- `src/composables/useStructureArtifact.js` (new): wraps the manifest probe. Exposes
  `manifest`, `pages`, `hasMarkdown`, `fetch`. Logic lifted from `useDocumentDownload`
  on `feat/markdown-download`, including the stale-document-id guard, so the download
  button and the Text tab share one probe.
- `src/components/Document/DocumentContentMarkdown.vue` (new): props `document` and
  `page`. Fetches `getStructurePage`, renders through `renderMarkdown`, caches rendered
  HTML per page number in component-local state (one instance per document view), shows
  a loading state, and shows an inline error with a retry button on failure. Renders
  inside a `document-content__body document-content__body--markdown` element so the
  existing RTL and body styling apply. Applies a new `markdown-text` pipeline category
  (empty by default) so plugins keep an extension point over the rendered HTML.
- `DocumentContent.vue` (modified): owns `mode` and a `markdownPage` ref, and branches
  three things: `nbPages` (manifest count vs offset math), the `page` model (plain page
  number vs offset-derived), and the body (`DocumentContentMarkdown` vs the current
  `v-html` div). Toolbox, global-terms bar, attachments and all `document.content.*`
  hooks stay identical in both modes.
- Toggle: a two-state control in the togglers area (currently hooks-only), default copy
  "Formatted" / "Plain text" (en + fr). Hidden when the document has no
  markdown artifact. Visible but disabled with an explanatory tooltip while a
  translation forces text mode. The search input is never disabled in either mode.
- API (`src/api/index.js`): cherry-pick `getStructureManifest` and `getStructurePage`
  (and their specs) from `feat/markdown-download`, coordinating with that branch's PR to
  avoid conflicts. Add `searchStructurePages(index, id, query, routing)` for the search
  endpoint.

### Sanitization boundary

Markdown HTML comes exclusively from `renderMarkdown` (rehype-sanitize strict schema)
and must NOT pass through the `extracted-text` pipelines: the xss whitelist there
(`mark`, `p`) would strip nearly every markdown tag. The `markdown-text` category is the
plugin hook for the markdown body; core registers nothing under it.

### Data flow and pagination

On mount, the probe runs alongside the existing `loadMaxOffset`. In markdown mode,
`nbPages` equals the manifest page count; navigating fetches and caches page N on
demand; no char-slicing is involved.

Toggling modes resets the page to 1, except when `syncedPages.length` equals the
manifest page count, in which case both paginations describe the same physical pages
and the page number is kept. The synced-pages code path itself stays as-is for text
mode.

### Search behavior

In text mode (user toggle, translation, or no artifact), the existing offset machinery
(marks, counter, prev/next, jump-to-occurrence, 300ms throttle) runs exactly as today
against `searchDocument`.

In markdown mode, `searchStructurePages` consumes the endpoint below, with the same
300ms throttle and the term trimmed first (a whitespace-only query answers 400). The
counter uses `count`; prev/next iterates the per-page counts flattened into (page, nth)
pairs; navigating activates the hit's page and marks term matches in the rendered DOM
(a text-node walk reusing the `.local-search-term` / `--active` classes, matching with
the same case and diacritic folding as the backend, active mark = nth match in the
page, clamped to the matches the DOM actually shows). A `q` prop set on arrival
(opening a document from search results) drives markdown search on mount and lands on
the first hit's page, so the common entry path shows markdown with highlights.

Accepted divergences: hits are counted in markdown source, so a term hidden in a link
URL can be counted yet not visibly marked, though navigation still lands on the right
page. The global-terms toolbox keeps counting raw text via `searchDocument`, so its
counts can differ slightly from the markdown search counter for the same term. A phrase
split across a page break counts 0 in markdown search and 1 in raw search, since each
page is scanned alone.

Backend contract, implemented on ICIJ/datashare branch `feat/artifacts-structure-search`
(`ArtifactResource.structureSearch`, `StructureSearch.Hits`):

```
GET /api/:project/artifacts/structure/search/:id?query=:q&routing=:routing
200 -> { "count": 12, "pages": 40, "scanned": 40, "hits": [{ "page": 3, "count": 2 }, ...] }
404 -> no structure artifact, or its markdown not on disk (no xhtml fallback)
400 -> missing, empty or whitespace-only query
403 -> non-member project
```

The verb sits before the id (`structure/search/:id`) so fluent-http route ordering
cannot send searches down the `:page` route. Markdown only: no `format` and no
`targetLanguage` parameters. Hits are in page order with zero-count pages omitted; a
no-match document answers 200 with `count: 0`. Folding is ported quirk for quirk from
the `searchContent` painless script (`ContentOccurrences`, each quirk pinned by a
test), so the two counters agree on the same word. `scanned` below `pages` means pages
were lost on disk and the counts are a floor; the client may ignore both fields. Same
access gates as the other artifact routes. Per-page counts rather than offsets are
enough for the client, which locates matches in the rendered DOM itself.

### Error handling

- Probe failures are silent and fail closed to text mode; 401 still reaches the error
  bus for session handling (semantics already on the branch).
- A failed page fetch or render shows an inline alert with a retry button and a "view as
  plain text" escape. No error-bus toast per page.
- `pages: 0`, or a manifest whose `formats` lacks `md`, behaves as no artifact.
- A failed markdown search request degrades like a failed raw search does today
  (`DocumentContent.vue:318-322`): zero occurrences, no toast.

### i18n and styling

- New en + fr keys: toggle labels, disabled-toggle tooltips (search, translation),
  markdown page error message, retry label.
- `document-content__body--markdown` gets minimal typography rules; sharing markdown
  typography with the View tab's `DocumentViewerMarkdown` is a follow-up, not a blocker.

### Testing (Vitest + Vue Test Utils)

- API specs for `getStructureManifest` / `getStructurePage` (cherry-picked) and
  `searchStructurePages`.
- `useStructureArtifact`: probe success, 404, 401, stale-document-id guard.
- `DocumentContentMarkdown`: renders sanitized HTML, caches pages, error and retry.
- `DocumentContent`: gating matrix (manifest present/absent, translation, toggle),
  manifest-driven pagination, page reset or retention on toggle, markdown search
  navigation (flattened hits to page activation and nth-mark activation), `q` on mount
  landing on the first hit's page in markdown mode.

## Assumptions to verify during implementation

- Artifacts persisted at extraction time always describe the indexed content, so no
  Tika-version guard is needed (the backend defers manifest staleness rejection to a
  follow-up issue on #2306; if that lands differently, revisit the gating).
- `renderMarkdown` throughput is acceptable for the largest real structure pages
  (it is async and the processor is built once; no worker needed until proven
  otherwise).
- The `page` model branch in `DocumentContent` does not disturb the existing
  `PaginationTiny` usage (`per-page=1`, `total-rows=nbPages`).

## Out of scope / follow-ups

- Formatted translations. A translation is a flat per-language text field in the index
  (`translations[].content`), with no page ranges and no structure, so it always renders
  through the plain-text path, exactly as on main today. Formatting a translation would
  need per-language structure artifacts produced by a translation task server-side (the
  manifest model extends to a language axis); the client gating would then relax from
  "no translation selected" to "the probe answers for the selected language".
- Persisting the toggle choice.
- Prefetching adjacent markdown pages.
- In-markdown global-term marks (rehype text-node plugin).
- XHTML format rendering.
- Precise offset-based marking via remark positions.
- Merging `feat/markdown-download` (separate PR; only the two API methods are shared).
- Shared markdown typography between Text tab and View tab.

## References

- Backend PR: https://github.com/ICIJ/datashare/pull/2306 (merged 2026-08-11)
- Search endpoint branch: https://github.com/ICIJ/datashare/compare/feat/artifacts-structure-search
- Download button branch: `feat/markdown-download` (references icij/datashare#2192)
- Key files: `src/components/Document/DocumentContent.vue`, `src/utils/markdown.js`,
  `src/store/pipelines/index.js`, `src/api/index.js`,
  `src/components/Document/DocumentGlobalSearchTerms/DocumentGlobalSearchTerms.vue`
