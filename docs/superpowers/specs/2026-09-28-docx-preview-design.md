# A shared document toolbox, and DOCX preview built on it

Date: 2026-09-28

## Intent

Every document tab shows the same header: a find-in-document search bar, a page
paginator, and an optional dropdown. Today that header is written twice, once in
`DocumentContent.vue` and once in `DocumentViewerPdf.vue`, with the search state
machine hand-rolled in each.

Extract it into one component and one composable, migrate both existing
consumers onto them, and add a third consumer: a `.docx` viewer that renders in
the browser with `docx-preview`, replacing the preview-server page images used
for those files today.

Decided by the user:

- Client rendering applies to every `.docx`, with no preview-host fallback.
- All three workstreams land together, rather than extracting first and
  migrating later.

## Success criteria

- `DocumentContent`, `DocumentViewerPdf` and the new `DocumentViewerDocx` all
  render their header from the same component, with no per-tab copy of the
  layout, the sticky behaviour or the compact handling.
- The find-in-document state machine exists once, parameterised by how each tab
  finds its matches.
- Every existing plugin hook point in the content toolbox still fires, under its
  current name and in its current position.
- Opening a `.docx` renders it in the browser with selectable text, a working
  find-in-document, and a paginator.
- `.doc`, `.pptx` and `text/html` keep their current preview-server rendering.
- No visible change to the PDF and content tabs beyond the timing change called
  out under "Behaviour changes".

## Part 1: `DocumentToolbox`

New, at `src/components/Document/DocumentToolbox/DocumentToolbox.vue`.

Owns the chrome only: sticky positioning, the flex and wrap rules, `useCompact`
measured against its own root, and the `DocumentGlobalSearchTerms` row. It
renders `DocumentLocalSearch` and the paginator itself, because those are
byte-identical between the two current consumers. The dropdown is a slot,
because it genuinely differs per tab.

### Props and models

| Name | Kind | Purpose |
|---|---|---|
| `search` | `v-model` | The search term. |
| `activeIndex` | `v-model` | 1-based active occurrence. |
| `page` | `v-model` | Current page. |
| `occurrences` | prop | Total match count. |
| `totalPages` | prop | Paginator length; the paginator hides when `< 2`. |
| `loading` | prop | Drives the search field's spinner. |
| `document` | prop | Passed to `DocumentGlobalSearchTerms`. |
| `targetLanguage` | prop | Passed through; `DocumentContent` sets it. |
| `noCount` | prop | Passed through; `DocumentViewerPdf` sets it. |
| `compactThreshold` | prop | Default 770, the value both consumers use today. |
| `hookPrefix` | prop | Namespace for the hook points; see below. |

Slot: `dropdown`.

Exposes: `height`, the measured toolbox height, via `useElementBounding`.
`DocumentViewerPdf.vue:58` computes this today to offset its page observers, and
the docx viewer needs the same. Exposing it from the toolbox is what lets the
sticky offset stop being each consumer's problem.

### Hook points

`DocumentContent`'s toolbox carries plugin extension points that are public API:
`document.content.toolbox:before`, `...toolbox.local-search:before`,
`...toolbox.local-search:after`, `...toolbox.before:before`,
`...toolbox.pagination:after`, `...toolbox:after`
(`DocumentContent.vue:630-669`).

`DocumentToolbox` renders these positions from a `hookPrefix` prop, so the
content tab passes `document.content` and keeps every current name unchanged.
The viewers pass no prefix and render no hooks, matching what they do today.

`document.content.toolbox.before:before` is a pre-existing oddity of a name. It
is preserved verbatim; renaming it would break whatever registers against it.

## Part 2: `useDocumentLocalSearch`

New, at `src/composables/useDocumentLocalSearch.js`.

Owns the parts of find-in-document that are identical everywhere: the term, its
debounce, the match list, the active index, the occurrence count, the loading
flag, and the rule that selecting an occurrence implies a page.

It does not own *finding*. Each consumer passes a `findMatches(term)` returning
`Promise<Array<{ page, ...}>>`, because the three sources have nothing in
common:

- PDF asks pdf.js through `usePDF`'s `findHighlights` (`usePDF.js:62`).
- Content asks the backend for byte offsets, and in markdown mode asks the
  structure-pages endpoint.
- DOCX counts marks in the rendered DOM.

### Shape

```js
const { term, debouncedTerm, activeIndex, matches, occurrences, activePage, isLoading }
  = useDocumentLocalSearch({ findMatches, debounce = 300 })
```

`activePage` is `matches[activeIndex - 1]?.page`. Consumers watch it to scroll.
Resetting `term` clears matches and sets `activeIndex` to 0, which is what both
current implementations do on document change.

## Part 3: migrating the two existing consumers

### `DocumentViewerPdf.vue`

The straightforward one. Its toolbox block becomes a `DocumentToolbox` with the
PDF dropdown in the slot, `top-offset` reads the toolbox's exposed height rather
than a local `useElementBounding`, and `highlightText` / `highlightIndex` /
`highlightMatches` are replaced by the composable's refs.

Its scroll machinery stays exactly as it is. `pendingPage`, `settleScroll` and
`realignPendingPage` (`DocumentViewerPdf.vue:94-160`) exist because pages resize
as they lazily render, which is a pdf.js concern, not a toolbox one. Moving it
into shared code would be the wrong abstraction.

### `DocumentContent.vue`

The risky one. Its toolbox block becomes a `DocumentToolbox` with
`DocumentContentDropdown` in the slot and `hookPrefix="document.content"`.

What must not change:

- The `page` computed (`DocumentContent.vue:174`) keeps its dual behaviour:
  markdown mode pages the artifact, plain mode maps an offset to a slice. It
  binds to the toolbox's `page` model unchanged.
- `showPagination` (`DocumentContent.vue:151`) already hides the paginator on a
  single page; the toolbox's own `totalPages < 2` rule must agree with it rather
  than fight it. The component passes `nbPages` and drops its local `v-if`.
- The content pipeline (`DocumentContent.vue:129`) and
  `addLocalSearchMarksClassByOffsets` stay put. Only the term and index refs are
  sourced from the composable.
- `markdownMatches` feeds `findMatches` in markdown mode, `localSearchIndexes`
  in plain mode.

## Part 4: `DocumentViewerDocx`

New, at `src/components/Document/DocumentViewer/DocumentViewerDocx.vue`.

1. Fetch the source with `core.api.getSource(document, { responseType: 'blob' })`,
   as `DocumentViewerLegacySpreadsheet.vue:91` does.
2. Render with `renderAsync(blob, container, null, { ignoreLastRenderedPageBreak: false, inWrapper: true })`.
3. Collect the resulting `section.docx` elements; that array's length is `totalPages`.
4. Track the section under the toolbox with an intersection observer per section,
   `rootMargin` shrunk by the toolbox height, taking the topmost still showing.
   Same approach as `DocumentViewerPdfPage.vue:63` and the minimum rule at
   `DocumentViewerPdf.vue:91`.
5. `findMatches` marks each section's HTML with `addSearchMarksClassesInHtml`
   (`src/utils/strings.js:187`), which already does the accent-folding
   `DocumentContent` relies on, and returns one entry per mark with its section
   index as `page`.
6. Scroll the active mark into view with `block: 'center'`, matching
   `DocumentViewerPdfPage.vue:96`.

Every section is in the DOM from the start, so choosing a page is a plain
`scrollIntoView`, and none of the PDF's lazy-render compensation is needed.

Re-marking replaces section `innerHTML`, so each section's original rendered
HTML is kept and re-marked from that original on every term change, never from
already-marked HTML.

No dropdown slot content: scale, rotation and embed are pdf.js capabilities with
no `docx-preview` equivalent.

### Routing the content type

Add an `isDocx` getter to `src/api/resources/Document.js` beside `isSpreadsheet`
(line 424), true only for
`application/vnd.openxmlformats-officedocument.wordprocessingml.document`.
`docx-preview` reads OOXML only, so legacy `.doc` is deliberately excluded.

In `DocumentViewTabsViewer.vue`, remove the wordprocessingml entry from
`paginatedTypes` (line 13) and add `case document.value.isDocx: return
'DocumentViewerDocx'` before the `isPaginated` case.

### Known limit: page fidelity

`docx-preview` does not lay out pages. It splits on section breaks, explicit page
breaks, and, when `ignoreLastRenderedPageBreak` is `false`, on Word's
`<w:lastRenderedPageBreak>` markers. The default is `true`
(`docx-preview.mjs:3973` in 0.4.1), which is why the design sets it.

Those markers record where Word last rendered a page boundary, so they give real
page numbers for Word-saved files. Files written by other tools carry none.
Measured over 20 real `.docx` files: 12 carried markers (2 to 19 each), 8 carried
none and would render as a single page.

Accepted consequence: the paginator is accurate for Word-saved documents and
reads `1 / 1` for the rest, where the preview server counted real pages for all
of them. Not mitigated here: no height-measuring pagination, no preview-server
fallback when the marker count is zero.

### Dependency

Add `docx-preview` 0.4.1, the npm package for VolodymyrBaydalka/docxjs. It pulls
`jszip` transitively.

## Behaviour changes

These are intended, and each is a real change to something that works today.

1. **Search timing in the content tab.** `DocumentContent.vue:228` throttles at
   300ms, so it searches *while* you type. `DocumentViewerPdf.vue:61` debounces
   at 300ms, so it searches once you stop. The shared composable debounces.
   The content tab therefore stops firing mid-keystroke, which also removes
   per-keystroke backend occurrence calls.
2. **`.docx` loses preview-server rendering** everywhere, including deployments
   that have a preview host, and gains selectable text and in-document search.
3. **`.docx` page counts change** as described above.
4. **The whole `.docx` downloads before anything renders**, where the paginated
   viewer streamed one page image at a time. No size threshold is introduced.

## Error handling

- `getSource` 404 maps to `document.errorNotFound`, the message
  `datashareSourceMixin` already produces. The new component calls
  `core.api.getSource` directly and applies the same mapping, since that mixin
  is Options API only.
- `renderAsync` rejection (corrupt or password-protected file): catch, show
  `toast.error`, render the same unavailable message the viewer switch falls
  back to.
- Zero sections rendered: treat as one page so the paginator stays valid.

## Testing

TDD throughout, red before green.

**`DocumentToolbox`** — new spec. Renders the search field and paginator;
hides the paginator below two pages; puts slot content in the dropdown position;
emits every hook position when given a `hookPrefix` and none without one;
exposes a height that tracks its element.

**`useDocumentLocalSearch`** — new spec. Debounces the term; calls `findMatches`
once per settled term; sets `activeIndex` to 1 on a non-empty result and 0 on an
empty one; clamps next and previous at the ends; reports `activePage` from the
active match; clears on term reset.

**`DocumentViewerDocx`** — new spec, following
`DocumentViewerLegacySpreadsheet.spec.js`. Fetches the source as a blob and
passes it to `renderAsync` with the container; passes
`ignoreLastRenderedPageBreak: false`, since the page count depends on it;
paginator total equals the rendered section count; a term marks every match and
reports the count; moving the active occurrence across sections updates the
page; a `renderAsync` rejection shows an error toast and the unavailable
message. `renderAsync` is mocked, so these assert wiring, not `docx-preview`'s
rendering.

One integration test renders a real fixture through the real library. Add a
small `.docx` to `tests/unit/resources/` beside the existing `spreadsheet.xlsx`.
It must be created for the purpose, never taken from a real corpus.

**Regression cover for the migration.** The existing `DocumentContent` and
`DocumentViewerPdf` specs must pass unchanged except where they assert the
throttle timing from change 1. Before migrating, check what those specs already
cover for toolbox behaviour and add cases for anything the migration could
silently break, in particular the hook points and markdown-mode pagination.

`src/api/resources/Document.js` gets an `isDocx` case in the existing spec.

## Out of scope

- The Entities and Metadata tabs. Their header is a `FormControlSearch` filter
  over a list, with no find-in-document and no pages. Folding them into this
  component would mean a toolbox that is mostly disabled props.
- Zoom, rotation, print, and the embed toggle for `.docx`.
- Synthetic pagination for `.docx` files without page-break markers.
- Preview-server fallback of any kind for `.docx`.
- Any change to `.doc`, `.pptx` or `text/html` rendering.
- Tracked changes and comments (`renderChanges`, `renderComments` stay off).
