# Lazy-load previews in search grid layout

**Date:** 2026-07-16
**Status:** Approved

## Problem

In the search results GRID layout, every document preview thumbnail is fetched
as soon as the card mounts. With a full page of results, all preview requests
fire at once instead of loading progressively as the user scrolls.

## Root cause

`DocumentThumbnail` already supports lazy loading through its `lazy` prop:
when set, it skips the eager fetch in `onBeforeMount` and instead fetches the
preview the first time the element becomes visible, using `useElementVisibility`
with `whenever(..., { once: true })` — the same IntersectionObserver pattern
the download button uses via `useElementVisibilityOnce`.

The list and table layouts pass this prop:

- `src/components/Document/DocumentCard/DocumentCard.vue` (list) — passes `lazy`
- `src/components/Document/DocumentRow/DocumentRowThumbnail.vue` (table) — passes `lazy`
- `src/components/Document/DocumentCard/DocumentCardGrid.vue` (grid) — **does not**

## Change

Add the `lazy` attribute to the `<document-thumbnail>` element in
`src/components/Document/DocumentCard/DocumentCardGrid.vue`. No other code
changes.

## Behavior after the change

Thumbnails in the grid layout fetch only when they enter the viewport, once
per card, matching the list and table layouts. Placeholder rendering, blur
state, click-to-open-modal and error handling are unchanged: they live inside
`DocumentThumbnail` and are independent of fetch timing.

## Testing

- New unit test at
  `tests/unit/specs/components/Document/DocumentCard/DocumentCardGrid.spec.js`
  asserting that `DocumentCardGrid` renders `DocumentThumbnail` with the
  `lazy` prop set to `true`.
- Manual verification: run the app, switch search results to grid layout,
  and confirm in the network tab that preview requests fire progressively
  while scrolling instead of all at once.
