# Disable the batch download button when there are no results

Issue: [ICIJ/datashare#2283](https://github.com/ICIJ/datashare/issues/2283)

## Problem

On a search that returns nothing, the search toolbar still shows an enabled batch
download button next to `0 of 0 documents`. Hovering it offers a tooltip
("Batch download: downloading multiple files is limited to 100 MB") and clicking
it queues a batch download task that can only ever produce an empty archive.

## Scope

The button appears in exactly one place: `DocumentEntriesHeader.vue`, rendered by
`DocumentEntries.vue`. There is no second batch download affordance to keep in
sync.

## Design

Add `:disabled="total === 0"` to `<button-download-documents>` in
`src/components/Document/DocumentEntries/DocumentEntriesHeader.vue`.

This mirrors the sibling control two lines above, which already reads
`<button-toggle-batch-mode :disabled="total === 0" />`. The `total` prop is
already declared on the header and already flows down from the Search view, so
nothing new needs to be plumbed.

No change to `ButtonDownloadDocuments.vue`. It declares only `loading`, so
`disabled` falls through as an attribute to murmur's `ButtonIcon`, then to
`b-button`, then to the native `<button disabled>`.

### Tooltip

Bootstrap's `.btn:disabled` sets `pointer-events: none`, so the tooltip stops
appearing once the button is disabled. That is the intended behavior: no
explanatory "why is this disabled" tooltip, matching `ButtonToggleBatchMode`
right beside it. No new i18n key, no wrapper element to work around pointer
events.

The `batchDownloadDocumentsLabel` computed keeps returning its string; it simply
never renders while disabled.

## Behavior changes

- With 0 results, the button is dimmed and unclickable.
- Before the first search runs, the button is also disabled, because `total`
  defaults to `0`. This is correct: there is nothing to download.
- During a refetch, `total` still holds the previous count, so the button stays
  enabled rather than flickering to disabled and back.
- `runBatchDownload` becomes unreachable at 0 results. Nothing else calls it.

## Testing

`tests/unit/specs/components/Document/DocumentEntries/DocumentEntriesHeader.spec.js`
already mounts the header with `props: { total: 10 }`.

Add two assertions on the download button's `disabled` state:

- `total: 0` renders it disabled
- `total: 10` renders it enabled

The second assertion is what lets the pair fail before the fix, rather than
passing vacuously.

## Out of scope

- Any change to the empty-state copy ("No documents matched your search").
- Any change to the batch download size/count estimation flow.
- Fixing the enabled-but-useless state of other toolbar controls at 0 results.
