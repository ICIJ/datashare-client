# PathTree live aggregation optimization — design

> **Status:** approved design, ready for implementation plan.
> **Scope:** client-only refactor of `src/components/PathTree/PathTree.vue`. No backend, API, or display-component changes.
> **Source:** the client "carry-over decision" in the directory-stats memo (`<project>.dirs` synthesis, §6.1): *derive directory counts in code, drop the per-bucket `cardinality`, and let the empty-directory probe fall away.*

---

## 1. Problem

The path tree recomputes directory statistics live on every navigation. Two operations in `PathTree.vue` dominate the cost:

1. **Per-bucket `cardinality('dirname')` sub-aggregation** (`PathTree.vue:307`). For every directory bucket on the page (up to `PER_PAGE = 50`), Elasticsearch runs a HyperLogLog cardinality aggregation to count descendant directories. This is recomputed on every tree navigation and every "show more".
2. **The empty-directory probe** — a *second* Elasticsearch request (`fetchEmptyDirectories`, `PathTree.vue:379-391`, built by `getEmptyDirectoriesBodybuilder`, `:350-372`). It exists only to determine whether each listed directory contains documents *directly*, so that the directory itself can be subtracted from the cardinality count in `getDirectoryCount` (`:269-275`, via the `directoryIsEmpty` map).

So each expanded level costs **two ES round-trips**, the first carrying **up to 50 per-bucket HLL aggregations**.

## 2. Goal

Remove both expensive operations while preserving, exactly:

- the **displayed numbers** — recursive document count, recursive directory count, and recursive size per directory;
- the **recursive directory count semantics** — count of descendant folders that contain documents *directly* (today's `cardinality('dirname') − self`);
- **server-side pagination** of the displayed immediate children;
- **compact-mode** behavior (already skips the per-bucket cardinality and the probe).

No backend dependency. This is the standalone client win the memo flags as worth doing regardless of whether the `<project>.dirs` mirror index is ever built.

## 3. Decisions taken during brainstorming

- **Scope:** client-only refactor. No dependency on a future `<project>.dirs` index.
- **Directory-count semantics:** keep the **recursive** count (not immediate-children, not dropped).
- **Count basis:** **match today exactly** — count only descendant folders that contain documents *directly* (the distinct set of exact `dirname` values), not all structural `dirname.tree` tokens. This is what makes the empty-dir probe removable: counting values *strictly under* a folder already excludes the folder itself.
- **Caching (memo's Approach 3):** out of scope for v1. Not needed once the round-trip count drops to one per level. Documented as a follow-up.

## 4. Design

A contained refactor of **`src/components/PathTree/PathTree.vue`** only.

### 4.1 Elasticsearch query — single request, two aggregations

`getDirectoriesBodybuilder` is changed so one request carries both of the following, sharing the same filtered query context (the `match type=Document`, the `wildcard dirname`, the `term dirname.tree=path`, and the `extractionLevel=0` filter unless `includeChildrenDocuments`):

**Agg A — display rows (today's agg, minus one sub-agg).**
`terms` on `dirname.tree`, `include: path/*`, `exclude: path/*/*` (immediate children only), with:
- `bucket_sort` `{ size, from }` for pagination (unchanged);
- `sum(contentLength)` as `size` (unchanged);
- **the `cardinality('dirname','directories')` sub-agg is removed.**

Agg A still yields the paginated immediate child directories with their recursive document count (`doc_count` of the tree-token bucket) and recursive size.

**Agg B — structure (new, keys only).**
`terms` on the **exact `dirname` keyword** field, `include: path/*` at *all* depths (no `exclude`), **no metric sub-aggregations**. Returns every distinct directory under `path` that contains documents directly, within the same filtered query context as Agg A. An explicit, generous `size` is set (see §4.4).

**Top-level aggs kept as-is.** `total_directories` (single top-level `cardinality`) and `total_size` (`sum`) remain unchanged — the memo's concern is the *per-bucket* cardinality, not one top-level HLL, and keeping them preserves the "Show N of M more directories" label and `totalSize`/`totalDirectories` exactly.

### 4.2 In-code derivation

`getDirectoryCount(key)` is rewritten to count Agg B's `dirname` values that are **strictly under** `key`:

```
count = dirnameValues.filter(value => value.startsWith(key + pathSeparator)).length
```

"Strictly under" (the trailing separator) excludes `key` itself, so the result equals today's `cardinality('dirname') − self` without any probe. The values come from the page object (stored alongside the existing `directories`/`documents` results).

### 4.3 Code removed

- the per-bucket `cardinality` sub-agg in `getDirectoriesBodybuilder`;
- `getEmptyDirectoriesBodybuilder` (`:350-372`);
- `fetchEmptyDirectories` (`:379-391`) and its invocation in `fetchDirectories` (`:338-341`);
- the `directoryIsEmpty` ref (`:112`) and its use in `getDirectoryCount`;
- the `tree-view-empty-directories` ES request.

### 4.4 Agg B `size` and large trees

Agg B must return **all** distinct doc-containing directory paths under `path` — paginating it would undercount. Risk is concentrated at the data root of a very large project. Note that the number of distinct *directories* is typically far smaller than the number of documents, so this is usually modest.

Mitigation for v1:
- set an explicit, generous `size` on Agg B (a named constant, e.g. on the order of `10000`);
- if the returned bucket count reaches that cap, **log a warning** (no silent truncation) so the limitation is observable.

A `composite`-aggregation paged version of Agg B is a documented **follow-up**, not part of v1.

## 5. What does NOT change

- Display components under `PathTreeView/` (props and rendering unchanged).
- `treeAsDirectories` / `treeAsDocuments` and the on-disk `/tree` fallback merge.
- Document fetching (`getDocumentsBodybuilder`, `fetchDocuments`).
- Sorting (`bucket_sort` on Agg A), layouts, selection, breadcrumb.
- `total_directories` / `total_size` derivation and the "show more" label.
- Public component API (props, `defineExpose`).

## 6. Testing

`tests/unit/specs/components/PathTree/PathTree.spec.js` already drives a real Elasticsearch via `esConnectionHelper`. Plan:

- **Count parity:** with a fixture tree containing pass-through folders (docs only in deep leaves) and folders with direct docs, assert the displayed recursive directory count equals the pre-refactor value for representative folders.
- **One round-trip:** assert exactly one `api.elasticsearch.search` call per level for directories (no `tree-view-empty-directories` request).
- **Query shape:** assert the request body no longer contains a per-bucket `cardinality` sub-agg inside the `dirname` terms agg, and does contain Agg B (exact-`dirname` terms agg).
- **Regressions stay green:** existing basename, Windows, compact-mode, and "show more" tests must pass unchanged.
- **Cap behavior:** a focused test that Agg B uses the explicit `size` constant.

## 7. Risks

1. **Agg B payload at the data root** — mitigated by an explicit `size` + warning log; composite paging deferred.
2. **Query-context drift** — mitigated by keeping Agg B a sibling agg in the same request so it inherits all filters.
3. **Compact mode** — must remain cheap; Agg B is only needed when the directory count is displayed (non-compact), so it should be gated by the same `!props.compact || props.noStats` condition that gated the removed cardinality sub-agg.

## 8. Out of scope / follow-ups

- The `<project>.dirs` mirror index integration (needs backend work that does not yet exist).
- Client-side subtree caching keyed by search context (memo Approach 3).
- `composite`-paged Agg B for pathologically large roots.
