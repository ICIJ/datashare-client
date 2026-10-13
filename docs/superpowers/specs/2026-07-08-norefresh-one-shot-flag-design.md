# Design: `noRefresh` as a true one-shot flag

Date: 2026-07-08

## Problem

On the search page, closing a document (in list layout) navigates back to the
search route with a `noRefresh=1` query parameter. This intentionally prevents
an unnecessary re-fetch of the search results when returning from a document.

However, the flag is **sticky**: once `noRefresh=1` is in the URL, the next
change to page, sort, or per-page does not refresh the results. The URL updates
but no new search runs.

### Root cause

Closing a document pushes `searchRouteWithoutRefresh` (`useSearchNav.js:31`):

```js
const searchRouteWithoutRefresh = computed(() => ({
  name: 'search',
  query: { ...searchStore.toRouteQuery, noRefresh: 1 }
}))
```

The two guards in `useSearchFilter.js` skip the search refresh whenever
`to.query.noRefresh` is truthy (`onAfterRouteQueryUpdate`,
`onAfterRouteQueryFromUpdate`). That is correct for the document-close case.

Page, sort, and per-page changes all funnel through `useUrlParamWithStore` →
`batchQueryParamUpdate` → `applyBatchedUpdates` in `useUrlParam.js:32`:

```js
const newQuery = { ...query, ...route.query, ...batchedUpdates }
```

This spreads the *current* `route.query` (which still contains `noRefresh=1`)
into the next navigation. The batched update only carries `from` / `sort` /
`perPage`, so `noRefresh=1` survives. The guard then sees `noRefresh` and skips
the refresh. Any parameter synced through this batch mechanism is affected,
which explains the "maybe more" the report mentions.

### Latent consequence

Because `onAfterRouteQueryUpdate` runs `immediate` on mount, **reloading or
sharing a URL that already contains `noRefresh=1` skips the initial search
entirely** — the page shows blank results until the user touches something.

## Chosen semantics

`noRefresh` must be a genuine one-shot token: it exists only for the single
navigation that sets it and must never survive into a subsequent navigation
(always ephemeral).

## Design

Keep `noRefresh` as a URL query parameter (so the document-close navigation can
carry it and the existing guards keep working unchanged), but add a dedicated
**consumer** that strips it from the URL immediately after the refresh guards
have observed it.

### Components

**1. New consumer in `useSearchFilter.js`** (co-located with the two existing
guards). A function, e.g. `onConsumeNoRefresh()`, registered via the existing
`onAfterRouteUpdate` mechanism. When `to.name === 'search'` and
`to.query?.noRefresh` is truthy, it issues a `router.replace` to the same route
with `noRefresh` removed. Scoped to the search route + flag-present so it never
fires spuriously.

**2. Registration in `Search.vue`**, *after* the two refresh guards (after the
current line 124):

```js
onAfterRouteQueryUpdate(refreshSearchFromRouteStart)
onAfterRouteQueryFromUpdate(refreshSearchFromRoute, { immediate: route.name === 'search' })
onConsumeNoRefresh() // must be registered last so it runs after the guards observe the flag
```

### Data flow

- **Close document:** push `…&noRefresh=1`. Refresh guards see `noRefresh` →
  skip (no reload, as intended). Consumer runs last → `router.replace` strips
  it. Result: clean URL, no reload.
- **Then change page / sort / size:** URL is already clean, so the
  `useUrlParam` batch merge carries no `noRefresh` → guard refreshes normally.
  Bug fixed.
- **Reload / share a `noRefresh=1` URL:** on mount the refresh guard skips (sees
  the flag), but the consumer's `replace` strips it and retriggers
  `onAfterRouteQueryUpdate` with a clean query whose applied query still differs
  from the (empty) store state → the search runs. No blank results.

### Ordering guarantee

`onAfterRouteUpdate` schedules each callback in a `queueMicrotask` at
registration time, so microtasks run FIFO in registration order. Registering
the consumer last ensures both refresh guards read `to.query.noRefresh` before
the consumer mutates the route. This ordering requirement gets an explicit
comment and a regression test.

### No unwanted refresh from the consumer's `replace`

- Document-close case: after stripping, `sameAppliedQuery(to.query, ['from'])`
  is true (applied query unchanged) and `from` is unchanged, so neither guard
  refreshes.
- Reload case: applied query in the store is still empty (the initial search was
  skipped), so `sameAppliedQuery` is false and `onAfterRouteQueryUpdate`
  refreshes exactly once.

The `replace` does not add a history entry, so closing a document results in a
single clean history entry rather than one containing `noRefresh`.

## Scope

Contained to:

- `src/composables/useSearchFilter.js` (new `onConsumeNoRefresh`)
- `src/views/Search/Search.vue` (register the consumer last)

No change to `useSearchNav`, the `useUrlParam` batch utility, or the
back-to-search links.

## Testing

- Close document then change page → asserts a new search executes (currently
  would not).
- Same for sort and per-page.
- Close a document alone → asserts *no* refresh and that the URL no longer
  contains `noRefresh`.
- Mount on a `noRefresh=1` URL → asserts the initial search runs and the flag is
  stripped.
