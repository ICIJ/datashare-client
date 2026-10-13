# Download markdown from the document download popover

Adds a "Download markdown" button to `DocumentDownloadPopover`, backed by the
artifact endpoints introduced in datashare's `feat/artifacts-resource` branch.

Closes the first bullet of
[ICIJ/datashare#2192 (comment)](https://github.com/ICIJ/datashare/issues/2192#issuecomment-4730436948).

## Backend contract

Two routes, both in `ArtifactResource.java`:

| Route | Response |
| --- | --- |
| `GET /api/:project/artifacts/structure/:id?routing=` | `200 {"pages": N, "formats": ["md", "xhtml"]}` |
| `GET /api/:project/artifacts/structure/:id/:page?routing=&format=` | `200` one page, `text/markdown` (`format` defaults to `md`) |

Both answer `404` when the document, `artifactDir`, or a complete structure
artifact is missing. `403` when the user is not a project member. The page
route validates `format` and answers `400` for anything but `md` or `xhtml`.

Two consequences drive the design:

- **Markdown is paginated.** A whole document is `N` requests plus client-side
  assembly. There is no whole-document route.
- **Markdown is not gated on the download restriction.** `structurePage` only
  calls `requireGranted(context, project)`, unlike `/documents/src` and
  `artifacts/raw`, which also enforce the project's download restriction and
  the root-document size limit.

## Decisions

| Question | Decision |
| --- | --- |
| Assembly | One `.md` file, all pages concatenated, joined with a horizontal rule |
| No artifact on disk | Hide the button, like "Download text translation" and "Download root" |
| Download restriction | Not applied. Markdown is derived text, like "Download text", which the popover already leaves ungated |
| Formats | `md` only. XHTML is not exposed |

## API layer — `src/api/index.js`

```js
getStructureManifest(index, id, routing)   // silent probe -> {pages, formats} | null
getStructurePage(index, id, page, routing) // -> string
```

`getStructureManifest` follows the pattern of `isDocumentDownloadable`
(`src/api/index.js:346`): it calls `this.axios.request` directly with
`validateStatus: () => true` instead of going through `sendAction`, so the
expected `404` never reaches the `http::error` bus and never raises a toast.

- `200` returns the parsed body.
- `401` emits `http::error` (an expired session should still offer to log back
  in) and returns `null`.
- Anything else, including a transport failure, returns `null`.

`null` means "no markdown for this document", which hides the button. Unlike
`isDocumentDownloadable`, an unreadable probe fails closed here: showing a
button that 404s on click is worse than not showing it.

`getStructurePage` uses the ordinary `sendAction` with `responseType: 'text'`,
so a failure after the user clicked surfaces as a toast. The `format`
parameter is omitted because `md` is the server-side default.

## Composable — `src/composables/useDocumentDownload.js`

New members, mirroring the existing translation members:

- `structureManifest` — `ref(null)`, the last probe result.
- `hasMarkdown` — `computed`, true when `pages > 0` and `formats` includes
  `'md'`. Both guards are needed: `formats` is only present on the structure
  manifest, and a manifest can report zero pages.
- `fetchMarkdownStatus()` — no-ops when `index` or `id` is missing, the same
  guard as `fetchDownloadStatus`; otherwise assigns the probe result.
- `downloadMarkdown()` — fetches pages `1..pages` with `Promise.all`, joins
  with `\n\n---\n\n`, and triggers the anchor-plus-blob download already used by
  `downloadTextContent` (`useDocumentDownload.js:71`), with type
  `text/markdown;charset=UTF-8` and filename `` `${title}.md` ``.

`Promise.all` needs no hand-rolled concurrency limit: the browser's per-host
connection cap throttles the requests.

`fetchMarkdownStatus` joins the `Promise.all` in `fetchStatuses` and gets its
own `watchEffect` under the `immediate` option, alongside the two existing
probes. Both are returned from the composable.

## Component — `DocumentDownloadPopover.vue`

One `button-icon`, `v-if="hasMarkdown"`, `variant="outline-action"`,
`icon-left="IPhDownloadSimple"`, `@click="downloadMarkdown"`, placed directly
after the "Download text" button, since both export text derived from the
document.

New i18n key `documentDownloadPopover.downloadMarkdown` ("Download markdown")
in `src/lang/en.json` and `src/lang/fr.json`.

The button is never disabled: `hasMarkdown` already means the artifact exists,
and the download restriction does not apply.

## Error handling

| Failure | Behavior |
| --- | --- |
| Manifest probe returns 404, 403, 5xx, or fails in transport | `structureManifest` is `null`, button hidden, no toast |
| Manifest probe returns 401 | Button hidden, `http::error` emitted |
| A page request fails after the click | The error propagates through `sendAction` to the `http::error` toast |

No partial file is ever written: the blob is built only after every page has
resolved.

## Testing

Test-driven, RED before any production code. Three existing specs are
extended:

- `tests/unit/specs/composables/useDocumentDownload.spec.js` — `hasMarkdown`
  for each manifest shape (`null`, `pages: 0`, `formats` without `md`, valid);
  `downloadMarkdown` requests every page and joins them with a horizontal rule; the
  filename is `${title}.md`; `fetchStatuses` triggers the manifest probe.
- `tests/unit/specs/components/Document/DocumentDownloadPopover/DocumentDownloadPopover.spec.js`
  — the button renders when `hasMarkdown` is true and is absent otherwise;
  clicking calls `downloadMarkdown`.
- `tests/unit/specs/api/index.spec.js` — `getStructureManifest` returns `null`
  on 404 without emitting `http::error`, and emits it on 401.

## Out of scope

- The XHTML format.
- The Text-tab markdown viewer and "Copy markdown" button (the second bullet
  of the issue comment), which needs user research first.
- Migrating `Api#getPages` off the now-deprecated `/documents/pages` route to
  `artifacts/page`.
