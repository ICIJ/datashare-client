# Project stats survive a missing Elasticsearch index

icij/datashare#2384

## Problem

The «all projects» overview reports 0 documents and "Jan 1, 1970" for every
project as soon as one project has no Elasticsearch index.

`ProjectList.vue` builds a comma-separated index list from `core.projectIds`
and posts two aggregations against it:

- `src/views/Project/ProjectList/ProjectList.vue:50` -> `countByProject`
- `src/views/Project/ProjectList/ProjectList.vue:63` -> `maxExtractionDateByProject`

A project row can exist in the database without a matching index. Elasticsearch
rejects the whole request with `index_not_found_exception` (404) when any named
index is missing, so both aggregations fail and every project falls back to its
default of `0` and `project.creationDate`.

The Datashare proxy wraps that 404 into a 500, which is what the client sees:

```
POST /api/index/search/project1,project2,project3/_search?preference=count-by-project
-> 500 Request failed with status code 500
```

The same 404 hits every other per-project statistic, for the same reason.

## Approach

Send `ignore_unavailable=true` on the statistics requests. Elasticsearch then
skips indices that are missing or closed and aggregates over the ones that
exist, returning 200 with buckets only for real indices.

The parameter reaches Elasticsearch unchanged:

- `Client.search` and `Client.count` spread every extra parameter into the
  query string (`src/api/elasticsearchClient.js:153`, `:162`).
- The Java proxy forwards the entire query string without filtering
  (`IndexAccessVerifier.getUrlString`, datashare repository).

No backend change is needed.

### Rejected alternatives

**Filter the index list client-side before searching.** Requires an extra
round-trip to discover which indices exist, and races with an index created or
deleted between the two calls.

**Add the flag inside `Client.prototype._search`, covering every search.** A
missing index during an actual document search is a real error the user should
see: it means a project they selected is broken, and silently returning fewer
results would hide it. Statistics are different, because a project with no
index legitimately has zero documents.

## Scope

### Statistics methods, `src/api/elasticsearch.js`

Add `ignore_unavailable: true` to the request parameters of:

| Method | Line | Read by |
|---|---|---|
| `countDocuments` | 399 | `useProjectMetrics.js:12`, deletion modal |
| `countTags` | 410 | `useProjectMetrics.js:16`, deletion modal |
| `countByProject` | 426 | `ProjectList.vue:50` |
| `maxExtractionDateByProject` | 442 | `ProjectList.vue:63`, `ProjectViewOverview.vue:60` |

Each already returns a safe default for an empty response (`?? 0`, `?? null`,
`buckets ?? []`), so a skipped index needs no further handling.

### Single-project overview, `ProjectViewOverview.vue:53`

`fetchDocumentsCount` calls `core.api.elasticsearch.count({ index })` directly
rather than `countDocuments`, because it counts documents of every type instead
of `type:Document`. Add `ignore_unavailable: true` at that call site.

Without it, `fetch` (`:65`) throws before setting `lastIndexingDate`, so a
project with no index loses its indexing date as well as its document count.

### Unchanged

`ProjectList.vue` already defaults a missing bucket to `0` and to
`project.updateDate ?? project.creationDate` (`:82-83`). No view code changes.

## Behaviour after the change

| Situation | Before | After |
|---|---|---|
| One project of several has no index | Every project reads 0 / 1970 | Indexed projects read real values, the missing one reads 0 and its database date |
| No project has an index | Every project reads 0 / 1970, after a failed request | Same values, from a successful empty response |
| Every project has an index | Correct values | Unchanged |
| Single-project overview, no index | Page shows no document count and no indexing date | Shows zero documents and no indexing date |
| Document search over a missing index | Error surfaced to the user | Unchanged, still an error |

## Testing

Written test-first, each failing before the parameter is added.

- `tests/unit/specs/api/elasticsearch.spec.js`: one test per statistics method
  asserting the request carries `ignore_unavailable: true`. None of the four
  methods is covered there today, so these are new tests.
  Each test names one real missing index alongside the fixture index and goes
  through the real transport, so it reproduces the reported 404 rather than
  asserting a query parameter.

No test in `ProjectList.spec.js`: it mocks `@/api/apiInstance` wholesale, so no
bucket fixture there can reproduce a request that fails. The view already
defaults a missing bucket correctly, and the client tests above cover the fix.

No test for the `ProjectViewOverview.vue:53` call site: no spec exists for that
view, and standing one up needs router, i18n and core mocks for a one-parameter
change. The parameter's behaviour is already covered by the client tests.

## Follow-up, not in this change

`esPost` in `datashare-app` turns an Elasticsearch `ResponseException` into a
500, while `asyncSearchStatus` in the same file passes the Elasticsearch status
through. Aligning the two would let the client distinguish a missing index from
a genuine server fault. Separate repository, separate issue.
