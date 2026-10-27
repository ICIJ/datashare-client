# Entities Route, Sidebar and Store Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/entities` reachable in the app: a cross-project entity search backed by a Pinia store, rendering the `EntityCard` shipped in ICIJ/datashare#2506.

**Architecture:** One new Elasticsearch client method queries several `<project>.entities` indices at once. A settings offcanvas carries sort and per-page. A small Pinia store holds the query, projects, pagination and response, with the URL as the source of truth through `useUrlParamWithStore`. A view renders one card per hit, taking each card's project from its own hit's `_index`.

**Tech Stack:** Vue 3 (`<script setup>`), Pinia, vue-router, vue-i18n, bodybuilder, Vitest + `@vue/test-utils`.

**Spec:** `docs/superpowers/specs/2026-10-16-entities-page-design.md`

**Issue:** ICIJ/datashare#2507. Branch `feat/entities-route`, stacked on `feat/entity-card` (PR #554). Target that branch, not `main`, until #554 merges.

## Global Constraints

- No em dashes or other non-ASCII in source. Use `&#8212;` in templates, `'\u2014'` in test assertions.
- No "icij" branding in fixtures. Use `example.com` / `example.org`.
- Only `src/lang/en.json` is hand-edited; other locales are Crowdin-managed.
- Run `yarn lint --fix` before every commit. Run only the spec files each task names, never the full suite.
- Do not use the app store key `entities` or the route name `task.entities`; both belong to the NER extraction task. This feature uses `entityList` and `entity`.
- Property values in the index are always arrays. Model property keys are namespaced with `_`, never `:`.
- The settings panel carries **pagination and sort only**. Decision 1 removed the property-picker; layout (table, grid) arrives with ICIJ/datashare#2508. Sort offers relevance (`_score`) and entity id; "date of creation" waits on ICIJ/datashare#2512, because nothing in the stack records one.
- The `entityList` app-store key added in ICIJ/datashare#2506 still holds a dead `properties` array and an unused `layout`. Trim it to `orderBy` and `perPage` as part of Task 3.

## Review Focus

Five conditions the spec implies that no happy-path test covers. Each has its test assigned.

1. **A project with no entities index.** A project that never ingested entities has no `<project>.entities`, and Elasticsearch fails the whole multi-index request when any named index is missing. Must render the empty state, not an error. Pinned in Task 1 and Task 2.
2. **The user has no projects at all.** `indices` is then empty, and an empty index list means "search every index in the cluster" to Elasticsearch, which would leak other projects' data. Must perform no request. Pinned in Task 2.
3. **Two entities sharing an `entityId` across projects.** The ES `_id` is `<model>_<entityId>`, unique only within an index, so a cross-project list can hold two hits with the same `_id`. The Vue `:key` must include `_index` or one card silently disappears. Pinned in Task 4.
4. **A hit whose `_index` is not a project the card can resolve.** The card derives its project from `_index` by stripping the `.entities` suffix. A malformed index name must not render a card pointing at a nonexistent project route. Pinned in Task 4.
5. **A page number past the end of the results.** Deep-linking `?page=99` on a 12-hit result set must show the empty state, not a crash or a silent page 1. Pinned in Task 2.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/api/elasticsearch.js` | **modify.** Add `searchEntities`, the only place that knows the entities index naming and the `propertiesAll` query field. |
| `src/store/modules/entity.js` | **new.** Query, projects, pagination, response, error, ready flag. No rendering concerns. |
| `src/store/modules/index.js` | **modify.** Export `useEntityStore`. |
| `src/router/index.js` | **modify.** The `entity` / `entity.list` routes. |
| `src/components/AppSidebar/AppSidebar.vue` | **modify.** The Entities entry in the Search section. |
| `src/views/Entity/Entity.vue` | **new.** The page: list of cards, pagination, loading / empty / error states. |
| `src/views/Entity/EntityListSettings.vue` | **new.** The settings offcanvas: sort and per-page. |
| `src/composables/useEntityProperties.js` | **modify.** Add the two sortable fields so `sortByOptions` is non-empty. |
| `src/store/modules/app.js` | **modify.** Trim `entityList` to `orderBy` and `perPage`. |
| `src/lang/en.json` | **modify.** `entity.*` keys. |

---

## Task 1: `searchEntities` on the Elasticsearch client

**Files:**
- Modify: `src/api/elasticsearch.js`
- Test: `tests/unit/specs/api/elasticsearch.entities.spec.js`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `Client.prototype.searchEntities({ indices, query, from, perPage, sort })` returning the raw Elasticsearch response. `indices` is an array of **project names**, not index names; the method appends `.entities` itself. Also exports `entitiesIndex(project)` returning `` `${project}.entities` ``.

Build the body with `bodybuilder`, as the neighbouring methods do. The request must pass `IGNORE_MISSING_INDEX` (already defined at `src/api/elasticsearch.js:31` as `{ ignore_unavailable: true }`). A blank or `*` query is a `match_all`; anything else is a `query_string` against `propertiesAll`. Sort defaults to `_score` desc; a named property sorts with no explicit `mode`, because alphabetical is Elasticsearch's default multi-value behaviour (spec, settled decision 2).

- [ ] **Step 1: Write the failing test**

Create `tests/unit/specs/api/elasticsearch.entities.spec.js`. Follow the mocking style of `tests/unit/specs/api/elasticsearch.spec.js:20` (`vi.spyOn(elasticsearch, 'search').mockResolvedValue(...)`), not the `esConnectionHelper` style: these assertions are about the request we build, so they need no live cluster.

```js
describe('searchEntities', () => {
  it('suffixes every project with .entities', async () => {
    // indices: ['banana-papers', 'flowera'] -> index: 'banana-papers.entities,flowera.entities'
  })

  it('tolerates a project whose entities index does not exist', async () => {
    // the request carries ignore_unavailable: true
  })

  it('matches everything when the query is blank', async () => {
    // body.query is match_all
  })

  it('queries propertiesAll when there is a query string', async () => {
    // body.query is query_string with default_field 'propertiesAll'
  })

  it('paginates with from and size', async () => {
    // from: 25, perPage: 25 -> body.from === 25, body.size === 25
  })

  it('sorts a named property without an explicit mode', async () => {
    // sort: { entityType: 'asc' } -> body.sort has no `mode` key
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn test:unit tests/unit/specs/api/elasticsearch.entities.spec.js`
Expected: FAIL, `elasticsearch.searchEntities is not a function`.

- [ ] **Step 3: Implement `entitiesIndex(project)` and `Client.prototype.searchEntities(options)` in `src/api/elasticsearch.js`**

Put both beside `searchDocs` so the entity and document search read together.

- [ ] **Step 4: Run the test to verify it passes**

Run: `yarn test:unit tests/unit/specs/api/elasticsearch.entities.spec.js`
Expected: 6 passed.

- [ ] **Step 5: Lint and commit**

```bash
yarn lint --fix
git add src/api/elasticsearch.js tests/unit/specs/api/elasticsearch.entities.spec.js
git commit -m "feat(entity): add the cross-project entities search ICIJ/datashare#2507"
```

---

## Task 2: The entity store

**Files:**
- Create: `src/store/modules/entity.js`
- Modify: `src/store/modules/index.js`
- Test: `tests/unit/specs/store/modules/entity.spec.js`

**Interfaces:**
- Consumes: `searchEntities` and `entitiesIndex` (Task 1).
- Produces: `useEntityStore()` exposing refs `query`, `projects`, `from`, `perPage`, `sort`, `response`, `error`, `isReady`; computeds `hits`, `total`, `isEmpty`; and actions `search()` and `reset()`.
  - `hits` returns the raw ES hits, each keeping `_index` and `_id`.
  - `search()` sets `isReady` false, calls the API, stores the response or the error, then sets `isReady` true. It **returns early without any request** when `projects` is empty.

Follow `src/store/modules/task.js` for shape (setup-style `defineStore`, refs plus actions). Do **not** model it on `src/store/modules/search.js`, which is 1378 lines of document-search concerns this page does not have.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/specs/store/modules/entity.spec.js`, mocking `searchEntities`.

```js
describe('useEntityStore', () => {
  it('searches every selected project at once', async () => {
    // projects: ['a','b'] -> searchEntities called once with indices ['a','b']
  })

  it('performs no request when the user has no project', async () => {
    // projects: [] -> searchEntities not called, isReady true, hits empty
  })

  it('exposes the hits with their index', async () => {
    // hits[0]._index === 'banana-papers.entities'
  })

  it('stores the error and still becomes ready when the search fails', async () => {
    // searchEntities rejects -> error set, isReady true, hits empty
  })

  it('is empty rather than erroring when every index is missing', async () => {
    // response with hits.total.value === 0 -> isEmpty true, error null
  })

  it('reports no hits for a page past the end of the results', async () => {
    // from: 2450 against a 12-hit total -> hits empty, total 12, no error
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn test:unit tests/unit/specs/store/modules/entity.spec.js`
Expected: FAIL, cannot resolve `@/store/modules/entity`.

- [ ] **Step 3: Implement the store in `src/store/modules/entity.js`, and export `useEntityStore` from `src/store/modules/index.js`**

- [ ] **Step 4: Run the test to verify it passes**

Run: `yarn test:unit tests/unit/specs/store/modules/entity.spec.js`
Expected: 6 passed.

- [ ] **Step 5: Lint and commit**

```bash
yarn lint --fix
git add src/store/modules/entity.js src/store/modules/index.js tests/unit/specs/store/modules/entity.spec.js
git commit -m "feat(entity): add the entity store ICIJ/datashare#2507"
```

---

## Task 3: Route and sidebar entry

**Files:**
- Modify: `src/router/index.js`
- Modify: `src/components/AppSidebar/AppSidebar.vue`
- Modify: `src/lang/en.json`

**Interfaces:**
- Consumes: nothing. The view it points at arrives in Task 4, so this task imports a component that does not exist yet; do Task 4 first if you prefer a green tree at every commit, the two are independent otherwise.
- Produces: route names `entity` (path `/entities`) and `entity.list` (path `''`, `meta.breadcrumb: false`).

Declare the route beside `search.saved.list` and `search.history.list` in `src/router/index.js`, with `meta.title: 'entity.title'` and `meta.icon` a `markRaw` Phosphor icon (`~icons/ph/stack` matches the schema icon the card already uses), and `components: { default, settings }` as the `search` route does.

The sidebar entry goes in the Search section of `src/components/AppSidebar/AppSidebar.vue`, which spans lines 197 to 222, after the "Saved searches" entry. Same `app-sidebar-section-entry` shape as its siblings, `:to="{ name: 'entity.list' }"`.

i18n keys: `entity.title` ("Entities"), `entity.empty` , `entity.error`, and `appSidebar.entities`.

- [ ] **Step 1: Trim the `entityList` app-store key**

In `src/store/modules/app.js`, reduce `entityList` to `orderBy: ['_score', 'desc']` and `perPage: '25'`. The `properties` array is dead (no picker) and `layout` is unused until ICIJ/datashare#2508.

- [ ] **Step 2: Add the route, the sidebar entry and the i18n keys**

- [ ] **Step 3: Verify the sidebar renders the new entry**

Run: `yarn test:unit tests/unit/specs/components/AppSidebar`
Expected: the existing AppSidebar specs still pass. If one asserts an exact entry count, update it as part of this task.

- [ ] **Step 4: Lint and commit**

```bash
yarn lint --fix
git add src/router/index.js src/components/AppSidebar/AppSidebar.vue src/lang/en.json src/store/modules/app.js
git commit -m "feat(entity): add the entities route and sidebar entry ICIJ/datashare#2507"
```

---

## Task 4: The entities view

**Files:**
- Create: `src/views/Entity/Entity.vue`
- Test: `tests/unit/specs/views/Entity/Entity.spec.js`

**Interfaces:**
- Consumes: `useEntityStore` (Task 2); `EntityCard` and `EntityCardPlaceholder` from `src/components/Entity/EntityCard/` (ICIJ/datashare#2506); `PageContainer`, `EmptyState`, `RowPagination` (existing).
- Produces: nothing later tasks consume.

The page renders one `EntityCard` per hit inside a `PageContainer`, with `RowPagination` bound to the store's `total` via `:total-rows` and `:per-page`. Note the impedance mismatch: `RowPagination` has a `page` v-model (1-based) while the store holds `from` (0-based offset), so the view converts, `page = from / perPage + 1`. Keep the conversion in the view; the store speaks Elasticsearch's language and the URL carries `page`. `EntityCardPlaceholder` covers `!isReady`; `EmptyState` covers both the no-results and the error case, following `src/views/Search/Search.vue:60-66` for which illustration each uses.

Two derivations belong here and nowhere else, because they turn an ES hit into card props:

- **project**: strip the `.entities` suffix from the hit's `_index`. A hit whose `_index` lacks that suffix yields no project, and that card is skipped rather than rendered pointing at a nonexistent project.
- **key**: `` `${hit._index}/${hit._id}` ``. The `_id` alone is `<model>_<entityId>`, unique only within one index, so two projects holding the same entity would collide on a bare `_id` key.

Pass the provisional flat property list `['name', 'entityType', 'sourceDocument', 'model', 'project']` to each card. ICIJ/datashare#2508 replaces it with per-schema featured properties once ICIJ/datashare#2510 lands; leave a `ponytail:` comment saying so.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/specs/views/Entity/Entity.spec.js`, with the store mocked.

```js
describe('Entity.vue', () => {
  it('renders one card per hit', () => {})

  it('derives each card project from its own hit index', () => {
    // _index 'banana-papers.entities' -> card project prop 'banana-papers'
  })

  it('keys a card on index and id, so two projects can share an entity id', () => {
    // two hits, same _id 'ftm_NK-1', different _index -> 2 cards rendered
  })

  it('skips a hit whose index is not an entities index', () => {
    // _index 'banana-papers' (no .entities suffix) -> no card
  })

  it('shows placeholders while the store is not ready', () => {})

  it('shows the empty state when there are no hits', () => {})

  it('shows the error state when the store holds an error', () => {})
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn test:unit tests/unit/specs/views/Entity/Entity.spec.js`
Expected: FAIL, cannot resolve `@/views/Entity/Entity`.

- [ ] **Step 3: Implement `src/views/Entity/Entity.vue`**

- [ ] **Step 4: Run the test to verify it passes**

Run: `yarn test:unit tests/unit/specs/views/Entity/Entity.spec.js`
Expected: 7 passed.

- [ ] **Step 5: Check the page in the running app**

Run: `yarn serve`, open `/entities`. Confirm cards render for a project that has ingested entities, and that a project with no entities index shows the empty state rather than an error. This is the first time the cross-project query runs against a real cluster, so it is worth doing rather than skipping.

- [ ] **Step 6: Lint and commit**

```bash
yarn lint --fix
git add src/views/Entity/Entity.vue tests/unit/specs/views/Entity/Entity.spec.js
git commit -m "feat(entity): add the entities view ICIJ/datashare#2507"
```

---

## Task 5: The settings panel

**Files:**
- Create: `src/views/Entity/EntityListSettings.vue`
- Modify: `src/composables/useEntityProperties.js`
- Test: `tests/unit/specs/views/Entity/EntityListSettings.spec.js`

**Interfaces:**
- Consumes: `useEntityStore` (Task 2); `useEntityProperties().sortByOptions` (ICIJ/datashare#2506, extended here); `PageSettings` and `PageSettingsSection` (existing).
- Produces: the `settings` named-view component the Task 3 route points at.

`useEntityProperties` today marks `entityType` and `model` sortable, neither of which the spec asks for. Replace that: make `name` sortable on `entityId` and add a `relevance` field keyed on `_score`, so `sortByOptions` offers exactly relevance and entity id. Follow `useSearchProperties`, which builds its `relevance` item the same way (`sortingKey: '_score'`) and keeps it out of `items` so it is a sort option but never a card row.

The panel mirrors `src/views/Search/SearchSettings.vue` but with two sections only, sort and per-page, both `INPUT_RADIO`. Per-page options are 10 / 25 / 50 / 100. Bind sort through `useUrlParamsWithStore(['sort', 'order'])` and per-page through `useUrlParamWithStore('perPage')`, reading and writing `appStore.getSettings('entityList', ...)`, exactly as `SearchSettings.vue` does for the `search` view.

No layout section and no properties section: layout arrives with ICIJ/datashare#2508, and the property picker was removed by the featured decision.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/specs/views/Entity/EntityListSettings.spec.js`.

```js
describe('EntityListSettings.vue', () => {
  it('offers relevance and entity id as the only sort options', () => {
    // sortByOptions keys === ['relevance', 'name']
  })

  it('offers no layout section', () => {})

  it('offers no property picker, because properties come from the schema', () => {})

  it('writes the chosen page size into the entityList settings', () => {
    // picking 50 -> appStore.getSettings('entityList', 'perPage') === 50
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn test:unit tests/unit/specs/views/Entity/EntityListSettings.spec.js`
Expected: FAIL, cannot resolve `@/views/Entity/EntityListSettings`.

- [ ] **Step 3: Add the sortable fields to `useEntityProperties`, then implement `src/views/Entity/EntityListSettings.vue`**

Adding `relevance` changes `sortByOptions`, which `tests/unit/specs/composables/useEntityProperties.spec.js` does not currently assert on. Add one case there pinning the two options, so a later story cannot quietly widen the list.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/views/Entity/EntityListSettings.spec.js tests/unit/specs/composables/useEntityProperties.spec.js`
Expected: all PASS.

- [ ] **Step 5: Lint and commit**

```bash
yarn lint --fix
git add src/views/Entity/EntityListSettings.vue src/composables/useEntityProperties.js \
        tests/unit/specs/views/Entity/EntityListSettings.spec.js \
        tests/unit/specs/composables/useEntityProperties.spec.js
git commit -m "feat(entity): add the entities settings panel ICIJ/datashare#2507"
```

---

## Notes for the implementer

- Run only the spec paths each task names. Do not run the full unit suite.
- The branch is stacked: PR targets `feat/entity-card`, not `main`.
- `EntityCard` currently takes a flat `properties` array, so every card renders identical rows. That is known and provisional (see ICIJ/datashare#2506); do not try to fix it here.
