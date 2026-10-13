# PathTree live aggregation optimization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the per-bucket `cardinality` sub-aggregation and the second "empty-directories" Elasticsearch request from the path tree, deriving the recursive directory count in code from a single keys-only aggregation — without changing any displayed numbers.

**Architecture:** A contained refactor of `src/components/PathTree/PathTree.vue` only. The existing per-level `dirname.tree` terms aggregation keeps producing the paginated display rows (with recursive doc count and size), and a new sibling `terms` aggregation on the exact `dirname` keyword field returns every doc-containing directory path under the current folder. The recursive directory count for each child is then computed in JavaScript by counting paths strictly under it. This collapses two ES round-trips into one and eliminates all per-bucket HyperLogLog work.

**Tech Stack:** Vue 3 (`<script setup>`), Vitest + @vue/test-utils, a real embedded Elasticsearch in tests via `esConnectionHelper`, `bodybuilder` for ES query construction, lodash.

## Global Constraints

- Touch only `src/components/PathTree/PathTree.vue` and its test file `tests/unit/specs/components/PathTree/PathTree.spec.js`. No backend, API, or display-component changes.
- Preserve displayed numbers exactly: recursive document count, recursive directory count (descendant folders with documents *directly*, today's `cardinality − self`), and recursive size per directory.
- Preserve server-side pagination of displayed immediate children and the "Show N of M more" label.
- Preserve compact-mode behavior: the directory-count aggregation is gated by the SAME condition as the removed per-bucket cardinality — `(!props.compact || props.noStats)`.
- No single-line `if` statements without braces (project style).
- Commit the `src/` and `tests/` changes.
- Run the full PathTree suite after each task: `yarn test:unit tests/unit/specs/components/PathTree/PathTree.spec.js` (expected: all green).

---

### Task 1: Add the keys-only `directory_paths` aggregation

Add a new sibling aggregation on the exact `dirname` field that returns every doc-containing directory path under the current folder, expose its values as a computed, and warn (no silent truncation) if the result hits the size cap. This task is purely additive — the existing cardinality + probe still run and the component keeps working.

**Files:**
- Modify: `src/components/PathTree/PathTree.vue` (ES path map `:97-103`; constants near `:115`; computed near `:123`; `getDirectoriesBodybuilder` `:284-324`; `fetchDirectories` `:332-343`)
- Test: `tests/unit/specs/components/PathTree/PathTree.spec.js`

**Interfaces:**
- Produces:
  - `ES.DIR_PATHS` — string lodash path `'directories.aggregations.directory_paths.buckets'`.
  - `DIRECTORY_PATHS_LIMIT` — number constant `10000`.
  - `directoryPaths` — `computed<string[]>`, the list of doc-containing directory paths under the current folder, read from the first page.
  - ES request body gains `aggs.directory_paths` = `{ terms: { field: 'dirname', include: <regex>, size: 10000 } }`, present only when `(!props.compact || props.noStats)` AND `from === 0`.

- [ ] **Step 1: Write the failing test**

Add this `describe` block at the end of `tests/unit/specs/components/PathTree/PathTree.spec.js`, before the final closing `})` of `describe('PathTree.vue', ...)`:

```js
  describe('directory_paths aggregation', () => {
    const { index } = esConnectionHelper.build()
    let core, searchSpy

    beforeEach(() => {
      core = CoreSetup.init().useAll()
      core.config.set('dataDir', '/home/foo')
      api.tree.mockClear()
      api.tree.mockResolvedValue(HOME_TREE)
      searchSpy = vi.spyOn(api.elasticsearch, 'search').mockResolvedValue({
        hits: { total: { value: 0 }, hits: [] },
        aggregations: {
          total_directories: { value: 1 },
          total_size: { value: 0 },
          dirname: { buckets: [] },
          directory_paths: { buckets: [] }
        }
      })
    })

    afterEach(() => {
      searchSpy.mockRestore()
    })

    it('requests a keys-only directory_paths terms agg on the exact dirname field', async () => {
      const wrapper = mount(PathTree, {
        props: { projects: [index], path: '/home/foo', noDocuments: true },
        global: { plugins: core.plugins, renderStubDefaultSlot: true }
      })

      await wrapper.vm.loadData({ clearPages: true })
      await flushPromises()

      const { body } = searchSpy.mock.calls[0][0]
      expect(body.aggs).toHaveProperty('directory_paths')
      expect(body.aggs.directory_paths.terms.field).toBe('dirname')
      expect(body.aggs.directory_paths.terms.size).toBe(10000)
      // keys only: no metric/bucket sub-aggregations
      expect(body.aggs.directory_paths.aggs).toBeUndefined()
    })
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:unit tests/unit/specs/components/PathTree/PathTree.spec.js -t "directory_paths terms agg"`
Expected: FAIL — `body.aggs` does not have property `directory_paths`.

- [ ] **Step 3: Add the ES path, constant, and computed**

In `src/components/PathTree/PathTree.vue`, add to the `ES` frozen object (currently `:97-103`) a new entry:

```js
const ES = Object.freeze({
  TOTAL_DOCS: 'directories.hits.total.value',
  TOTAL_DIRS: 'directories.aggregations.total_directories.value',
  TOTAL_SIZE: 'directories.aggregations.total_size.value',
  DIR_BUCKETS: 'directories.aggregations.dirname.buckets',
  DIR_PATHS: 'directories.aggregations.directory_paths.buckets',
  DOC_HITS: 'documents.hits.hits'
})
```

Just below the `PER_PAGE` constant (currently `:115`), add:

```js
// Max number of directory paths fetched for in-code recursive count.
const DIRECTORY_PATHS_LIMIT = 10000
```

Just below the `firstPage` computed (currently `:123`), add:

```js
// Doc-containing directory paths under the current folder (level-scoped, from first page).
const directoryPaths = computed(() => get(firstPage.value, ES.DIR_PATHS, []).map(property('key')))
```

- [ ] **Step 4: Add the aggregation in `getDirectoriesBodybuilder`**

In `getDirectoriesBodybuilder` (currently `:284-324`), immediately after the existing `total_size` block (the `if (!props.compact || props.noStats) { bb.agg('sum', 'contentLength', 'total_size') }` at `:318-320`) and before `return props.preBodyBuild(bb)`, add:

```js
  // Recursive directory counts are derived in code from the set of
  // doc-containing directory paths under the current folder. Fetch them once
  // per level (from === 0), keys only, gated like the (removed) per-bucket
  // cardinality so compact mode stays cheap.
  if ((!props.compact || props.noStats) && from === 0) {
    const descendantPaths = [trimmedPath.value, '*'].join(pathSeparator.value)
    bb.agg('terms', 'dirname', { include: wildcardRegExpPattern(descendantPaths), size: DIRECTORY_PATHS_LIMIT }, 'directory_paths')
  }
```

- [ ] **Step 5: Add the cap warning in `fetchDirectories`**

In `fetchDirectories` (currently `:332-343`), after `const res = await api.elasticsearch.search({ index, body, preference })` and before the `if (!props.compact)` probe block, add:

```js
  if (from === 0) {
    const paths = get(res, 'aggregations.directory_paths.buckets', [])
    if (paths.length >= DIRECTORY_PATHS_LIMIT) {
      console.warn(`PathTree: "directory_paths" aggregation hit the ${DIRECTORY_PATHS_LIMIT} cap for "${trimmedPath.value}"; recursive directory counts may be undercounted.`)
    }
  }
```

- [ ] **Step 6: Run the new test to verify it passes**

Run: `yarn test:unit tests/unit/specs/components/PathTree/PathTree.spec.js -t "directory_paths terms agg"`
Expected: PASS.

- [ ] **Step 7: Run the full PathTree suite (no regressions)**

Run: `yarn test:unit tests/unit/specs/components/PathTree/PathTree.spec.js`
Expected: all tests PASS (the change is additive).

- [ ] **Step 8: Commit**

```bash
git add src/components/PathTree/PathTree.vue tests/unit/specs/components/PathTree/PathTree.spec.js
git commit -m "feat(path-tree): add keys-only directory_paths aggregation"
```

---

### Task 2: Derive the recursive directory count from `directoryPaths`

Rewrite `getDirectoryCount` to compute the count in code by counting `directoryPaths` strictly under the directory. "Strictly under" (trailing separator) excludes the directory itself, exactly matching today's `cardinality − self`. After this task the per-bucket cardinality and the `directoryIsEmpty` map are dead code (removed in Tasks 3–4).

**Files:**
- Modify: `src/components/PathTree/PathTree.vue` (`getDirectoryCount` `:269-275`)
- Test: `tests/unit/specs/components/PathTree/PathTree.spec.js`

**Interfaces:**
- Consumes: `directoryPaths` (`computed<string[]>` from Task 1), `pathSeparator` (from `usePath`, already in scope).
- Produces: `getDirectoryCount(key: string): number` returning the count of `directoryPaths` strictly under `key`.

- [ ] **Step 1: Write the failing test**

Add this test inside the existing `describe('Posix', ...)` block (which already wires real Elasticsearch via `esConnectionHelper` and mounts a non-compact `wrapper` against `/home/foo`):

```js
    it('counts only descendant folders that contain documents directly (recursive, pass-through excluded)', async () => {
      // /home/foo/deep is a pass-through folder: its only documents live in /home/foo/deep/leaf.
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/deep/leaf/doc_01').withIndex(index).count(3))
        .commit()
      // /home/foo/bar contains documents directly and has no subfolders.
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/bar/doc_02').withIndex(index).count(3))
        .commit()

      await wrapper.setProps({ noTree: true })
      await wrapper.vm.loadData({ clearPages: true })
      await flushPromises()

      // Entries render in KEY-asc order: [root /home/foo, bar, deep].
      // Directory-count stat is shown for each (non-compact mode).
      const counts = wrapper.findAll('.path-tree-view-entry-stats-directories')
      // index 1 = bar: no subfolders -> 0
      expect(counts.at(1).text()).toBe('0')
      // index 2 = deep: one descendant folder with direct docs (deep/leaf) -> 1
      expect(counts.at(2).text()).toBe('1')
    })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:unit tests/unit/specs/components/PathTree/PathTree.spec.js -t "pass-through excluded"`
Expected: FAIL — counts still come from the old cardinality path which is not populated by the real-ES response in the way the new code expects (or the values differ). Confirm it is red before implementing.

- [ ] **Step 3: Rewrite `getDirectoryCount`**

Replace the body of `getDirectoryCount` (currently `:269-275`):

```js
function getDirectoryCount(key) {
  const bucket = directories.value.find(matches({ key }))
  if (bucket?.directories) {
    return Math.max(0, bucket.directories.value - (directoryIsEmpty.value[key] ?? 0))
  }
  return 0
}
```

with:

```js
function getDirectoryCount(key) {
  // Recursive count = doc-containing directories strictly under `key`.
  // The trailing separator makes the match strict, excluding `key` itself.
  const prefix = key + pathSeparator.value
  return directoryPaths.value.filter(path => path.startsWith(prefix)).length
}
```

- [ ] **Step 4: Run the new test to verify it passes**

Run: `yarn test:unit tests/unit/specs/components/PathTree/PathTree.spec.js -t "pass-through excluded"`
Expected: PASS.

- [ ] **Step 5: Run the full PathTree suite**

Run: `yarn test:unit tests/unit/specs/components/PathTree/PathTree.spec.js`
Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/PathTree/PathTree.vue tests/unit/specs/components/PathTree/PathTree.spec.js
git commit -m "refactor(path-tree): derive recursive directory count in code"
```

---

### Task 3: Remove the per-bucket `cardinality` sub-aggregation

The per-bucket `cardinality('dirname','directories')` is now unused. Remove it so Elasticsearch stops running up-to-50 HyperLogLog aggregations per page.

**Files:**
- Modify: `src/components/PathTree/PathTree.vue` (`getDirectoriesBodybuilder` `:306-308`)
- Test: `tests/unit/specs/components/PathTree/PathTree.spec.js`

**Interfaces:**
- Produces: ES request body's `aggs.dirname.aggs` no longer contains a `directories` cardinality sub-aggregation (it retains `bucket_truncate` and `size`).

- [ ] **Step 1: Write the failing test**

Add this test inside the `describe('directory_paths aggregation', ...)` block created in Task 1 (it already spies on `api.elasticsearch.search`):

```js
    it('no longer requests a per-bucket cardinality sub-aggregation', async () => {
      const wrapper = mount(PathTree, {
        props: { projects: [index], path: '/home/foo', noDocuments: true },
        global: { plugins: core.plugins, renderStubDefaultSlot: true }
      })

      await wrapper.vm.loadData({ clearPages: true })
      await flushPromises()

      const { body } = searchSpy.mock.calls[0][0]
      expect(body.aggs.dirname.aggs).not.toHaveProperty('directories')
    })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:unit tests/unit/specs/components/PathTree/PathTree.spec.js -t "per-bucket cardinality"`
Expected: FAIL — `body.aggs.dirname.aggs` still has `directories`.

- [ ] **Step 3: Remove the sub-aggregation**

In `getDirectoriesBodybuilder`, inside the `bb.agg('terms', 'dirname.tree', ...)` inner callback (currently `:300-310`), delete the block:

```js
    // In "full" mode (not compact), add directory-count sub-aggs
    if (!props.compact || props.noStats) {
      inner.agg('cardinality', 'dirname', 'directories')
    }
```

The inner callback now keeps only the `bucket_sort` (`bucket_truncate`) and `sum` (`size`) sub-aggregations and its `return inner`.

- [ ] **Step 4: Run the new test to verify it passes**

Run: `yarn test:unit tests/unit/specs/components/PathTree/PathTree.spec.js -t "per-bucket cardinality"`
Expected: PASS.

- [ ] **Step 5: Run the full PathTree suite (counts still correct)**

Run: `yarn test:unit tests/unit/specs/components/PathTree/PathTree.spec.js`
Expected: all tests PASS, including the Task 2 "pass-through excluded" count-parity test.

- [ ] **Step 6: Commit**

```bash
git add src/components/PathTree/PathTree.vue tests/unit/specs/components/PathTree/PathTree.spec.js
git commit -m "perf(path-tree): drop per-bucket cardinality sub-aggregation"
```

---

### Task 4: Remove the empty-directories probe

The second `tree-view-empty-directories` Elasticsearch request and its supporting code exist only to feed the now-deleted `directoryIsEmpty` subtraction. Remove them so each expanded level makes a single ES round-trip.

**Files:**
- Modify: `src/components/PathTree/PathTree.vue` (`directoryIsEmpty` ref `:112`; `fetchDirectories` probe block `:338-341`; `getEmptyDirectoriesBodybuilder` `:350-372`; `fetchEmptyDirectories` `:379-391`)
- Test: `tests/unit/specs/components/PathTree/PathTree.spec.js`

**Interfaces:**
- Produces: one `api.elasticsearch.search` call per directory level (no empty-directories probe). `directoryIsEmpty`, `getEmptyDirectoriesBodybuilder`, and `fetchEmptyDirectories` no longer exist.

- [ ] **Step 1: Write the failing test**

Add this test inside the existing `describe('Posix', ...)` block. `vi.spyOn` passes through to the real Elasticsearch by default, so this counts calls without stubbing them:

```js
    it('makes a single Elasticsearch request per level (no empty-directories probe)', async () => {
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/bar/doc_01').withIndex(index).count(3))
        .commit()

      const searchSpy = vi.spyOn(api.elasticsearch, 'search')
      await wrapper.setProps({ noTree: true })
      await wrapper.vm.loadData({ clearPages: true })
      await flushPromises()

      // noDocuments is true on this wrapper, so the only ES call is the directories aggregation.
      expect(searchSpy).toHaveBeenCalledTimes(1)
      searchSpy.mockRestore()
    })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:unit tests/unit/specs/components/PathTree/PathTree.spec.js -t "single Elasticsearch request per level"`
Expected: FAIL — called twice (directories + empty-directories probe).

- [ ] **Step 3: Remove the probe call from `fetchDirectories`**

In `fetchDirectories`, delete the block (currently `:338-341`):

```js
  if (!props.compact) {
    const dirs = res.aggregations.dirname.buckets.map(property('key'))
    await fetchEmptyDirectories(dirs)
  }
```

`fetchDirectories` now reads: build body, call search, run the `from === 0` cap-warning block from Task 1, then `return res`.

- [ ] **Step 4: Remove the dead functions and state**

Delete `getEmptyDirectoriesBodybuilder` (currently `:350-372`) and `fetchEmptyDirectories` (currently `:379-391`) entirely, along with their JSDoc comments.

Delete the `directoryIsEmpty` ref and its comment (currently `:111-112`):

```js
// Map dirname -> hasDocs (to adjust directory counts).
const directoryIsEmpty = ref({})
```

- [ ] **Step 5: Verify no dangling references**

Run: `grep -n "directoryIsEmpty\|fetchEmptyDirectories\|getEmptyDirectoriesBodybuilder\|tree-view-empty-directories" src/components/PathTree/PathTree.vue`
Expected: no output (all references removed).

- [ ] **Step 6: Run the new test to verify it passes**

Run: `yarn test:unit tests/unit/specs/components/PathTree/PathTree.spec.js -t "single Elasticsearch request per level"`
Expected: PASS.

- [ ] **Step 7: Run the full PathTree suite**

Run: `yarn test:unit tests/unit/specs/components/PathTree/PathTree.spec.js`
Expected: all tests PASS.

- [ ] **Step 8: Lint the changed file**

Run: `yarn lint src/components/PathTree/PathTree.vue`
Expected: no errors (in particular, no unused imports — verify `ref` is still used elsewhere in the file before assuming it can be removed; it is used by `pages`, `tree`, so the import stays).

- [ ] **Step 9: Commit**

```bash
git add src/components/PathTree/PathTree.vue tests/unit/specs/components/PathTree/PathTree.spec.js
git commit -m "perf(path-tree): remove empty-directories probe round-trip"
```

---

## Self-Review

**Spec coverage:**
- §4.1 Agg A minus cardinality → Task 3. ✓
- §4.1 Agg B (exact `dirname`, keys only, all depths, same query context) → Task 1. ✓
- §4.1 keep top-level `total_directories` / `total_size` → untouched (verified: only the per-bucket cardinality at `:306-308` and the probe are removed; `:316` `total_directories` and `:318-320` `total_size` remain). ✓
- §4.2 in-code derivation (strictly-under) → Task 2. ✓
- §4.3 code removed (cardinality, `getEmptyDirectoriesBodybuilder`, `fetchEmptyDirectories`, `directoryIsEmpty`, probe request) → Tasks 3 & 4. ✓
- §4.4 explicit size cap + warning, no silent truncation → Task 1 (constant `DIRECTORY_PATHS_LIMIT`, `console.warn`). ✓
- §6 testing: count parity with pass-through folders → Task 2; single round-trip → Task 4; query shape (no per-bucket cardinality, has Agg B) → Tasks 1 & 3; regressions green → run full suite each task. ✓
- §7.3 compact gating → Task 1 gates Agg B with `(!props.compact || props.noStats)`. ✓

**Placeholder scan:** none — every code step shows full code and exact commands.

**Type/name consistency:** `directoryPaths` (computed) defined in Task 1, consumed in Task 2; `DIRECTORY_PATHS_LIMIT` defined and used in Task 1; `ES.DIR_PATHS` defined in Task 1, used by `directoryPaths`; aggregation name `directory_paths` consistent across Tasks 1, 3, and tests; `getDirectoryCount(key)` signature unchanged. Consistent. ✓

**Note for the implementer:** line numbers are anchors against the current file and will drift as you edit; locate by the quoted code, not the number.
