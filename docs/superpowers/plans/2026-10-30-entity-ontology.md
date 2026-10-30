# Entity Ontology Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Read the FollowTheMoney ontology from `GET /api/models/ftm` so an entity card shows its own schema's featured properties with their real labels, replacing the three placeholders in `useEntityProperties`.

**Architecture:** One API method fetches the ontology, one store caches it for the session, and `useEntityProperties` is the only consumer. The card asks the composable which rows to render for its `entityType` instead of being handed a flat list.

**Tech Stack:** Vue 3 (`<script setup>`), Pinia, Vitest + `@vue/test-utils`, axios through `src/api/index.js`.

**Spec:** `docs/superpowers/specs/2026-10-16-entities-page-design.md`

**Issue:** ICIJ/datashare#2525. Branch `feat/entity-ontology`, stacked on `feat/entities-route` (ICIJ/datashare-client#555). PR targets that branch and opens as a **draft**.

## The endpoint

`GET /api/models/ftm` returns 233 KB:

```
{ name: "ftm", version: "4.10.2", types: { <TypeName>: {
    name, label, abstract, ancestors, required,
    featured: ["name", "nationality", "birthDate"],
    caption:  ["name", "alias", "previousName", ...],
    edge: null | { source, target },
    properties: { <prop>: { label, range, stub } }
} } }
```

69 types. Three facts drive the design:

- **Ontology keys are bare** (`name`), index keys are namespaced (`ftm_name`). Anything crossing that boundary has to apply the model prefix.
- **`range`** is `null` for a literal and a type name for a pointer at another entity. ICIJ/datashare#2511 needs it; this plan only has to not lose it.
- **`stub: true`** marks a property inferred from a relation rather than written. It is never data and must never render as a row.

Five types carry no `featured`: `Analyzable`, `Interest`, `Interval`, `Page`, `Value`.

## Global Constraints

- No em dashes or other non-ASCII in source. `&#8212;` in templates, `'\u2014'` in test assertions.
- No "icij" branding in fixtures. Use `example.com` / `example.org`.
- Only `src/lang/en.json` is hand-edited.
- Run `yarn lint --fix` before every commit. Run only the spec files each task names, never the full suite.
- The ontology is fetched **once per session**, never per card. It is a runtime fetch and must not enter a bundle chunk.
- `src/composables/useSchema.js` already exports `getModel` and `getModelDisplay`, for content-type models. Do not add a second `getModel`. This feature uses `getEntityModel` / `useEntityModelStore`.
- `useEntityProperties` stays the only consumer of the ontology. No component reads it directly.

## Review Focus

Five conditions the spec implies that no happy-path test covers. Each has its test assigned.

1. **The ontology request fails.** An older backend has no `/api/models`, and the network can be down. Cards must still render with humanized labels rather than blank rows or a crash: the placeholder becomes the fallback, not dead code. Pinned in Task 1 and Task 2.
2. **An `entityType` the ontology does not know.** A project indexed under a retired or newer model version carries a type the fetched ontology has no entry for. Must fall back, not throw. Pinned in Task 2.
3. **A type with no `featured` list.** Five of 69. Must render the Datashare-level rows rather than an empty card. Pinned in Task 2.
4. **A `stub: true` property.** Inferred from a relation, never written, so it has no values and must not take a row. Pinned in Task 2.
5. **Many cards on one page.** A list of 25 cards must make one ontology request, not 25. Pinned in Task 1.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/api/index.js` | **modify.** Add `getEntityModel(name)`. One line, beside `textLanguages`. |
| `src/store/modules/entityModel.js` | **new.** Holds the fetched ontology and fetches it once. No formatting logic. |
| `src/store/modules/index.js` | **modify.** Export `useEntityModelStore`. |
| `src/composables/useEntityProperties.js` | **modify.** The only consumer: real labels, featured lists, caption. The three `ponytail:` placeholders become documented fallbacks. |
| `src/components/Entity/EntityCard/EntityCard.vue` | **modify.** Derives its rows from the entity's `entityType` when given no explicit list. |
| `src/views/Entity/Entity.vue` | **modify.** Fetches the ontology on mount; stops passing the flat `PROPERTIES` list. |
| `src/stories/components/Entity/EntityCard/EntityCard.stories.js` | **modify.** A story per schema, showing different rows for `Person` and `Company`. |

---

## Task 1: Fetch and cache the ontology

**Files:**
- Modify: `src/api/index.js`
- Create: `src/store/modules/entityModel.js`
- Modify: `src/store/modules/index.js`
- Test: `tests/unit/specs/store/modules/entityModel.spec.js`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - `Api.prototype.getEntityModel(name = 'ftm')` -> the raw ontology, via `sendAction('/api/models/' + name)`.
  - `useEntityModelStore()` exposing `model` (ref, `null` until fetched), `types` (computed, `{}` until fetched), `fetchOnce()`, and `type(name)` returning the type entry or `undefined`.

Follow `src/store/modules/languages.js`: setup-style `defineStore`, `useOnce` for fetch-once semantics, a `try/catch` that leaves the value empty rather than letting the rejection escape. A failed fetch must leave `model` null and allow a later retry, which is what `useOnce` already does on rejection.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/specs/store/modules/entityModel.spec.js`, mocking `api.getEntityModel`.

```js
describe('useEntityModelStore', () => {
  it('requests the ftm ontology by default', async () => {})

  // The payload is 233 KB. A list of 25 cards must not fetch it 25 times.
  it('fetches once however many callers ask', async () => {
    // three concurrent fetchOnce() calls -> getEntityModel called once
  })

  it('exposes a type by name', async () => {
    // type('Person').featured === ['name', 'nationality', 'birthDate']
  })

  it('returns undefined for a type the ontology does not carry', async () => {})

  // An older backend has no /api/models at all.
  it('leaves the model empty when the request fails, without throwing', async () => {
    // rejects -> model null, types {}, fetchOnce resolves
  })

  it('retries after a failed fetch', async () => {
    // first rejects, second resolves -> model populated
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn test:unit tests/unit/specs/store/modules/entityModel.spec.js`
Expected: FAIL, cannot resolve `@/store/modules/entityModel`.

- [ ] **Step 3: Add `getEntityModel(name = 'ftm')` to `src/api/index.js`, then implement the store and export it from `src/store/modules/index.js`**

- [ ] **Step 4: Run the test to verify it passes**

Run: `yarn test:unit tests/unit/specs/store/modules/entityModel.spec.js`
Expected: 6 passed.

- [ ] **Step 5: Lint and commit**

```bash
yarn lint --fix
git add src/api/index.js src/store/modules/entityModel.js src/store/modules/index.js \
        tests/unit/specs/store/modules/entityModel.spec.js
git commit -m "feat(entity): fetch and cache the FollowTheMoney ontology ICIJ/datashare#2525"
```

---

## Task 2: Read the ontology in `useEntityProperties`

The heart of the change. All three `ponytail:` placeholders become fallbacks for when the ontology is absent, rather than the normal path.

**Files:**
- Modify: `src/composables/useEntityProperties.js`
- Test: `tests/unit/specs/composables/useEntityProperties.spec.js`

**Interfaces:**
- Consumes: `useEntityModelStore().type(name)` (Task 1).
- Produces, added to the existing return value of `useEntityProperties()`:
  - `propertyLabel(entityType, key)` -> the ontology label for a namespaced key, else `humanizePropertyKey(key)`.
  - `featuredProperties(entity)` -> the ordered list of **namespaced** property keys a card should render for that entity, excluding stubs and excluding whatever the caption already shows.
  - `item(key)` keeps its signature but takes an optional second argument, `item(key, entityType)`, so a row can be labelled from the ontology. Called with one argument it behaves as today.
- `entityCaption(entity, type)` gains an optional second argument: the ontology type entry. Without it, the existing first-`name`-value rule stands.

Three rules the tests pin, because none of them is derivable from the endpoint alone:

- **Namespacing.** The ontology says `birthDate`, the index says `ftm_birthDate`. `featuredProperties` returns index keys, built from the entity's own `model`.
- **No duplicate caption.** `featured` begins with `name` for most schemata, and the card already renders a caption row from `caption`. A featured property that the caption list also names is dropped, so `Mr Yazmurad N Seryaev` does not appear twice.
- **Datashare-level rows still show.** `sourceDocument`, `model` and `project` are not in the ontology and are appended after the featured ones, in that order.

- [ ] **Step 1: Write the failing test**

Extend `tests/unit/specs/composables/useEntityProperties.spec.js`. Stub the model store with a fixture carrying `Person` (featured `['name','nationality','birthDate']`, caption `['name','alias']`, a `stub: true` property, and a `range: 'Address'` one) and `Interest` (no `featured`).

```js
describe('propertyLabel', () => {
  it('uses the ontology label for a known property', () => {
    // ('Person', 'ftm_birthDate') -> 'Birth date'
  })

  it('falls back to the humanized key when the ontology is absent', () => {
    // no model fetched -> ('Person', 'ftm_vatCode') -> 'Vat code'
  })

  it('falls back when the entity type is not in the ontology', () => {
    // ('Spaceship', 'ftm_birthDate') -> 'Birth date' via humanize, no throw
  })
})

describe('featuredProperties', () => {
  it('returns the schema featured properties, namespaced', () => {
    // Person -> ['ftm_nationality', 'ftm_birthDate', ...] then the datashare rows
  })

  it('drops a featured property the caption already shows', () => {
    // 'name' is featured and captioned -> no 'ftm_name' row
  })

  it('never returns a stub property', () => {})

  it('returns only the datashare rows for a type with no featured list', () => {
    // Interest -> ['name', 'sourceDocument', 'model', 'project']
  })

  it('returns only the datashare rows when the ontology failed to load', () => {})
})

describe('entityCaption with the ontology', () => {
  it('uses the first caption property that has a value', () => {
    // caption ['name','alias'], entity has only ftm_alias -> that value
  })

  it('falls back to the entity id when no caption property has a value', () => {})
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn test:unit tests/unit/specs/composables/useEntityProperties.spec.js`
Expected: FAIL, `propertyLabel is not a function`.

- [ ] **Step 3: Implement `propertyLabel`, `featuredProperties` and the `entityCaption` ontology path in `src/composables/useEntityProperties.js`**

Keep `humanizePropertyKey` exported: it is now the documented fallback, so rewrite its `ponytail:` comment to say that rather than pointing at an unlanded endpoint. Same for `entityCaption`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `yarn test:unit tests/unit/specs/composables/useEntityProperties.spec.js`
Expected: all PASS.

- [ ] **Step 5: Lint and commit**

```bash
yarn lint --fix
git add src/composables/useEntityProperties.js tests/unit/specs/composables/useEntityProperties.spec.js
git commit -m "feat(entity): label and feature properties from the ontology ICIJ/datashare#2525"
```

---

## Task 3: The card derives its own rows

**Files:**
- Modify: `src/components/Entity/EntityCard/EntityCard.vue`
- Modify: `src/components/Entity/EntityCard/EntityCardPropertiesEntry.vue`
- Modify: `src/components/Entity/EntityCard/EntityCardPropertiesEntryName.vue`
- Modify: `src/stories/components/Entity/EntityCard/EntityCard.stories.js`
- Test: `tests/unit/specs/components/Entity/EntityCard/EntityCard.spec.js`

**Interfaces:**
- Consumes: `featuredProperties(entity)`, `propertyLabel(entityType, key)` and `entityCaption(entity, type)` (Task 2).
- Produces: `EntityCard`'s `properties` prop becomes **optional**. Given, it is used verbatim, which is what the stories and ICIJ/datashare-client#555's view rely on until Task 4. Absent, the card derives its rows from `entity.entityType`.

`EntityCardPropertiesEntry` and `...EntryName` pass the entity's `entityType` into the composable so their label and caption come from the ontology.

- [ ] **Step 1: Write the failing test**

Extend `tests/unit/specs/components/Entity/EntityCard/EntityCard.spec.js`.

```js
describe('EntityCard with the ontology', () => {
  it('derives its rows from the entity schema when given no property list', () => {
    // Person entity -> rows include ftm_nationality, not Company's registrationNumber
  })

  // The design mockup shows exactly this: one list, different rows per card.
  it('renders different rows for two entities of different schemata', () => {})

  it('uses an explicit property list when one is given', () => {})

  it('labels a row from the ontology', () => {
    // the ftm_birthDate row reads 'Birth date'
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn test:unit tests/unit/specs/components/Entity/EntityCard/EntityCard.spec.js`
Expected: FAIL, the card renders the default flat list regardless of schema.

- [ ] **Step 3: Make `properties` optional on `EntityCard` and derive from `entityType` when absent; pass `entityType` through the two entry components**

- [ ] **Step 4: Add a `CompanyEntity` story beside the existing `Person` ones**

A `Company` fixture with `ftm_jurisdiction` and `ftm_registrationNumber`, no explicit `properties` arg, so the story shows the derived rows differing from the Person card's.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/components/Entity/EntityCard/`
Expected: all PASS.

- [ ] **Step 6: Lint and commit**

```bash
yarn lint --fix
git add src/components/Entity/EntityCard/ src/stories/components/Entity/EntityCard/EntityCard.stories.js \
        tests/unit/specs/components/Entity/EntityCard/EntityCard.spec.js
git commit -m "feat(entity): derive card rows from the entity schema ICIJ/datashare#2525"
```

---

## Task 4: Wire the view

**Files:**
- Modify: `src/views/Entity/Entity.vue`
- Test: `tests/unit/specs/views/Entity/Entity.spec.js`

**Interfaces:**
- Consumes: `useEntityModelStore().fetchOnce()` (Task 1); `EntityCard`'s optional `properties` prop (Task 3).
- Produces: nothing later tasks consume.

The view fetches the ontology on mount, alongside the entity search rather than after it, and stops passing `PROPERTIES`. Delete the constant and its `ponytail:` comment.

The ontology arriving after the first render is normal and must not be an error state: the card re-renders when the store fills.

- [ ] **Step 1: Write the failing test**

```js
it('fetches the ontology once on mount', () => {})

it('passes no property list, so each card uses its own schema', () => {
  // EntityCard props('properties') is undefined
})

it('renders cards before the ontology arrives', () => {
  // store empty -> cards still present, no error state
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn test:unit tests/unit/specs/views/Entity/Entity.spec.js`
Expected: FAIL, `properties` is the flat list.

- [ ] **Step 3: Fetch the ontology in `refresh()` and drop the `PROPERTIES` constant**

- [ ] **Step 4: Run the test to verify it passes**

Run: `yarn test:unit tests/unit/specs/views/Entity/Entity.spec.js`
Expected: all PASS.

- [ ] **Step 5: Check the page in the running app**

Run `yarn serve` against the backend on :8080, open `/entities`. Confirm a `Person` card and a `Company` card show different rows, that labels read as words rather than humanized keys, and that exactly one request goes to `/api/models/ftm` however many cards are on screen. This step is not optional: the two previous stories in this epic each had a defect that only the running app revealed.

- [ ] **Step 6: Lint and commit**

```bash
yarn lint --fix
git add src/views/Entity/Entity.vue tests/unit/specs/views/Entity/Entity.spec.js
git commit -m "feat(entity): let each card pick its own schema rows ICIJ/datashare#2525"
```

---

## Notes for the implementer

- Run only the spec paths each task names. Do not run the full unit suite.
- The branch is stacked: the PR targets `feat/entities-route`, as a draft.
- `range` is carried through but not rendered here. Relations are ICIJ/datashare#2511, and splitting them out of the properties list is that story's job.
