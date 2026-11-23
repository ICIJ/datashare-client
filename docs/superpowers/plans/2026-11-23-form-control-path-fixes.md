# FormControlPath Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The path picker opens on a usable folder for projects whose saved path is missing on disk, and "Browse" opens the modal on the first click.

**Architecture:** A new Elasticsearch client method returns the deepest folder shared by all indexed documents of an index. `FormControlPath` resolves its tree root when Browse is clicked: saved path if `/tree` succeeds, else that common folder, else the data dir. Bug 2 is reproduced in a browser before it is fixed.

**Tech Stack:** Vue 3 `<script setup>`, bootstrap-vue-next 1.0.1, Vitest + @vue/test-utils, Elasticsearch test cluster (`VITE_ES_HOST`).

**Spec:** `docs/superpowers/specs/2026-11-23-form-control-path-fixes-design.md`

## Global Constraints

- No change to `PathTree.vue` behavior.
- Server mode: no `/tree` disk check, the given path is kept (today's behavior).
- "Saved path missing" = `api.tree(path)` rejects. Never match on `/vault/<name>`.
- The resolved folder replaces the form value only when `modelValue` is unset or equals the `path` prop.
- `dirname.tree` terms aggregation size: 100.
- Spec and plan files under `docs/superpowers/` are never committed.
- Commit through the `icij:commit` skill. Branch: `fix/form-control-path-issues` (already checked out).

## Review Focus

1. Docs spread across unrelated roots (`/data/a/x`, `/home/me/z`): no bucket covers every doc. Expect `/`. Test in Task 1.
2. Project with zero indexed docs and missing saved path: expect the data dir. Test in Task 2.
3. User already picked a folder, then reopens Browse: the pick must not be overwritten. Test in Task 2.
4. Switching project on Add documents after a first Browse: the root must be resolved again for the new project. Covered by resolving on every click; test in Task 2.
5. Server mode with a path-less project still opens on `/vault/<name>` (accepted by the spec). No test; listed as a follow-up in the final report.

---

### Task 1: `getCommonDirname` on the Elasticsearch client

**Files:**
- Modify: `src/api/elasticsearch.js` (next to `countDocuments`, ~line 405)
- Test: `tests/unit/specs/api/elasticsearch.spec.js`

**Interfaces:**
- Produces: `elasticsearch.getCommonDirname(index: string): Promise<string|null>`. `null` when the index has no `type: Document` docs; `'/'` when docs exist but share no folder; otherwise the deepest shared folder, no trailing separator.

- [ ] **Step 0:** Run `yarn` in the worktree (no `node_modules` yet). Expected: exits 0.

- [ ] **Step 1: Write the failing tests** in a new `describe('getCommonDirname')` block, using `letData(es).have(new IndexedDocument(path, index)).commit()`:

```js
it('returns the deepest folder shared by every document', async () => {
  await letData(es).have(new IndexedDocument('/data/leak/a/x.pdf', index)).commit()
  await letData(es).have(new IndexedDocument('/data/leak/b/y.pdf', index)).commit()
  expect(await elasticsearch.getCommonDirname(index)).toBe('/data/leak')
})

it('returns the documents folder when they all sit in the same one', async () => {
  await letData(es).have(new IndexedDocument('/data/leak/a/x.pdf', index)).commit()
  await letData(es).have(new IndexedDocument('/data/leak/a/y.pdf', index)).commit()
  expect(await elasticsearch.getCommonDirname(index)).toBe('/data/leak/a')
})

it('returns the root when documents share no folder', async () => {
  await letData(es).have(new IndexedDocument('/data/a/x.pdf', index)).commit()
  await letData(es).have(new IndexedDocument('/home/me/z.pdf', index)).commit()
  expect(await elasticsearch.getCommonDirname(index)).toBe('/')
})

it('returns null when the index has no documents', async () => {
  expect(await elasticsearch.getCommonDirname(index)).toBeNull()
})
```

Check first that `IndexedDocument` sets `dirname` from the path (`tests/unit/es_utils.js:81`). If it doesn't, chain its dirname setter.

- [ ] **Step 2: Run and show RED.** `yarn test elasticsearch.spec -t getCommonDirname`. Expected: 4 FAIL, "getCommonDirname is not a function".

- [ ] **Step 3: Implement** `Client.prototype.getCommonDirname`. One search: `size: 0`, `track_total_hits: true`, query `match type Document`, `terms` aggregation on `dirname.tree` with `size: 100`, spread `IGNORE_MISSING_INDEX`. Read `hits.total.value`. If it is 0, return `null`. Keep the buckets whose `doc_count` equals the total and return the longest `key`. If none, return `'/'`.

- [ ] **Step 4: Run and show GREEN.** Same command. Expected: 4 PASS.

- [ ] **Step 5: Commit** via `icij:commit` (`feat(elasticsearch): find the folder shared by all indexed documents`).

### Task 2: Resolve the tree root in `FormControlPath`

**Files:**
- Modify: `src/components/Form/FormControl/FormControlPath.vue`
- Modify: `src/components/Task/TaskDocuments/TaskDocumentsForm.vue:110-113` (add `:projects="[form.defaultProject]"`)
- Create: `tests/unit/specs/components/Form/FormControl/FormControlPath.spec.js`

**Interfaces:**
- Consumes: `api.elasticsearch.getCommonDirname(index)` from Task 1, `api.tree(path)` (`src/api/index.js:29`), `useMode().isServer`.
- Produces: no new public API. Internal `rootPath` ref, `null` until resolved, passed as `:path` to `<path-tree>` (render it with `v-if="rootPath"`).

Behavior on Browse click (both buttons):
1. Set `showPathTree = true` right away, so opening never waits on a request.
2. If server mode or `projects` is empty, `rootPath = sourcePath`.
3. Otherwise, if `api.tree(sourcePath)` resolves, `rootPath = sourcePath`.
4. Otherwise `rootPath = (await getCommonDirname(projects.join(','))) ?? core.getDefaultDataDir()`.
5. If `modelValue` is unset or equals `props.path`, set `modelValue = rootPath`.

The root is resolved again on every click. No caching.

- [ ] **Step 1: Write the failing tests.** Mock `@/api/apiInstance` with `tree: vi.fn()` and `elasticsearch: { getCommonDirname: vi.fn() }`. Set `dataDir` to `/data` with `CoreSetup`. Stub `AppModal` and `PathTree`. Click the first `button-icon`, then `flushPromises()`. Cases:
  - `tree` resolves → PathTree `path` prop is `/vault/foo`, `getCommonDirname` not called, no `update:modelValue`.
  - `tree` rejects, `getCommonDirname` → `/data/leak` → PathTree `path` is `/data/leak`, emitted `update:modelValue` is `['/data/leak']` (prop `modelValue: '/vault/foo'`, `path: '/vault/foo'`).
  - `tree` rejects, `getCommonDirname` → `null` → PathTree `path` is `/data`.
  - `modelValue: '/elsewhere'`, `tree` rejects, `getCommonDirname` → `/data/leak` → no `update:modelValue` emitted.
  - Server mode (`core.config.set('mode', 'SERVER')`, check `src/mode/index.js` for the exact key) → `tree` not called, PathTree `path` is `/vault/foo`.
  - After a first click, `setProps({ path: '/vault/bar' })` then click again → `tree` called with `/vault/bar`.
  - `projects: []` → `tree` not called, PathTree `path` is `/vault/foo`.

- [ ] **Step 2: Run and show RED.** `yarn test FormControlPath`. Expected: the fallback cases FAIL (PathTree path stays `/vault/foo`, or PathTree is not rendered).

- [ ] **Step 3: Implement** the behavior above in `FormControlPath.vue`. Add `:projects` in `TaskDocumentsForm.vue`.

- [ ] **Step 4: Run and show GREEN.** `yarn test FormControlPath TaskDocumentsForm`. Expected: all PASS, TaskDocumentsForm unchanged (still indexes `/data`).

- [ ] **Step 5: Commit** via `icij:commit` (`fix(form-control-path): open the indexed folder when the project path is missing`).

### Task 3: Browse opens the modal on the first click

**Files:** decided by the repro. Most likely `src/components/Form/FormControl/FormControlPath.vue` and its spec.

- [ ] **Step 1: Reproduce.** Kill stale dev servers, then run `yarn serve` against the local backend in the background. Open `/#/tasks/documents/new` (check the exact route in `src/router/index.js`) in local mode with the `browse` skill. Click Browse 10 times, closing the modal between clicks, including the first click right after page load. Record how many clicks open nothing, plus any console errors.
- [ ] **Step 2: Find the root cause** with `superpowers:systematic-debugging`. First suspect: the `lazy` modal on bootstrap-vue-next 1.0.1 (the other `lazy` modals: `FilterModal.vue`, `SettingsViewApi.vue`, `WidgetDocumentsByCreationDateByPath.vue`). Second suspect: a focus or blur re-render in the form. Report the cause to Pierre before editing.
- [ ] **Step 3: Write a failing test** that pins the cause (for example: mount, one click, modal `modelValue` is `true`). Show RED. If the cause cannot be reproduced in jsdom, say so and use the browser repro from Step 1 as the check.
- [ ] **Step 4: Fix it.** Show GREEN, and run the browser repro again: 10 out of 10 first clicks open the modal.
- [ ] **Step 5: Commit** via `icij:commit` (`fix(form-control-path): open the path tree on the first click`).

### Task 4: Final check

- [ ] **Step 1:** `yarn lint:modified`, then `yarn test FormControlPath TaskDocumentsForm elasticsearch PathTree`, both in the background. Expected: 0 new lint errors (separate them from existing warnings), all tests pass.
- [ ] **Step 2:** In the browser on Add documents, select a project whose path is `/vault/<name>`. Browse opens on its indexed folder.
