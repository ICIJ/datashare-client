# Entities page design

Date: 2026-10-16
Status: approved for implementation, phase 1 only

## Purpose

Datashare can now ingest structured entities (FollowTheMoney statements folded into
entities and projected into an Elasticsearch index). Nothing in the client surfaces them.
This spec covers a `/entities` page that lets a user browse those entities and open one to
inspect its properties, its source document and its provenance metadata.

The page is modelled on the existing search page, because the user task is the same:
scan a long result list, pick one, read it. Reusing that shape means reusing its
components, its settings mechanism and its URL-parameter conventions rather than
inventing parallel ones.

Out of scope: similar entities, diagram building, entity editing, entity export UI.

## Backend contract

The contract is already implemented server side. Nothing in this spec asks for backend
changes, with one exception called out under "Known gap: the ontology".

### The indexed entity

`EntitiesIndexRebuilder` projects the statement store into a per-project index named
`<project>.entities`, holding `StructuredEntity` documents:

```json
{
  "type": "StructuredEntity",
  "entityId": "<model-specific id>",
  "model": "ftm",
  "entityType": "Person",
  "modelVersions": ["3.x"],
  "documentIds": ["<datashare document id>"],
  "properties": { "ftm_name": ["Mr Yazmurad N Seryaev"], "ftm_country": ["tm"] },
  "propertiesAll": "<every value, folding-analyzed>"
}
```

The Elasticsearch `_id` is `"<model>_<entityId>"`, not `entityId` alone: the statement
store emits one entity per (entity id, model) pair, so two models describing the same
real-world entity must not overwrite each other.

Properties are namespaced with an underscore (`ftm_name`), not a colon. This is
deliberate on the backend side: a colon is the field/value delimiter of Elasticsearch's
`query_string`, so `properties.ftm:name:Jane` would be a parse error and every client
would have to escape the separator. The client must not re-introduce a colon form.

Mapping facts that constrain the UI (`datashare_entities_index_mappings.json`):

- every `properties.*` value is a `keyword` with a `.text` folding-analyzed subfield,
  and `ignore_above` 8191.
- every property value is copied into `propertiesAll`, which is the field a free-text
  search over entities should target.
- property values are always arrays. A single-valued property is an array of one.
  No UI code may assume a scalar.
- `entityType`, `model`, `modelVersions`, `documentIds` are keywords, so all four are
  aggregatable and usable as filters.

### HTTP surface

The only entity endpoint today is `GET /api/entities/:project/export?model=ftm`, which
streams ndjson. There is no entity search endpoint.

The page therefore queries `<project>.entities` through the existing `/api/index/search`
Elasticsearch proxy, exactly as the document search does. No new backend route is
needed for reading.

### Known gap: the ontology

The FollowTheMoney ontology lives server side only. `FtmTargetModel` reads the bundled
`defaultModel.json` and exposes `EntityType` (name, abstract flag, ancestors, properties,
required set, edge source/target) and `Property` (range, stub flag) to Java callers.
None of it is reachable over HTTP.

That ontology is what tells a UI:

- the human label of `ftm_birthDate`
- whether a property holds a literal or points at another entity, which is what
  separates "properties" from "relations"
- which schemata are edges, and what their source and target are
- an icon per schema

Exposing it is tracked as its own issue in this epic and is a prerequisite for the
"relations" half of the detail panel. Everything specified below is designed so that
the ontology, when it arrives, is consumed in exactly one place: the
`useEntityProperties` composable. No component reads property metadata directly.

Until then, labels are derived by humanizing the key after stripping the model prefix
(`ftm_birthDate` -> "Birth date"), and relations are not rendered.

## Naming collisions

Three names are already taken by unrelated features. The implementation must not reuse
them.

| Name | Already used by | Use instead |
| --- | --- | --- |
| `src/components/Entity/*` | NER named-entity components (EntityButton, EntityPopover, EntitySection), backed by `src/api/resources/NamedEntity.js` | new components live in the `src/components/Entity/EntityCard/` and `src/components/Entity/EntityView/` subfolders; existing NER components are not renamed |
| app store settings key `entities` (`src/store/modules/app.js:68`) | the NER extraction task list | `entityList` |
| route name `task.entities` | the NER extraction task | `entity`, `entity.list` |

Keeping the new components under `src/components/Entity/` while leaving the NER ones in
place is a deliberate trade: zero churn on 15 existing files, at the cost of one folder
holding two concepts. The subfolder split keeps them visually separate.

## Architecture

### Layout

Split view with a display toggle, mirroring the search page:

```
EntityPage
+-- EntityToolbar            search bar, project selector, settings toggle
+-- EntityEntries            list | grid | table toggle, pagination
|   +-- EntityEntriesList -> EntityCard (one per hit)
|   +-- EntityEntriesGrid -> EntityCardGrid
|   +-- EntityEntriesTable
+-- EntityView               detail panel for the selected entity
    +-- EntityViewTitle      caption, schema badge, counters
    +-- EntityViewTabs
        +-- Properties and relations
        +-- Source document
        +-- Metadata
```

This is the same decomposition as `views/Search/Search.vue` plus
`components/Document/DocumentEntries/` plus `views/Document/DocumentView/`. Each unit
has the same responsibility as its document counterpart, so the two pages stay legible
to anyone who has read either.

### Routing

```
name: 'entity',      path: '/entities'    components: { default, settings }
name: 'entity.list', path: ''             (index child, breadcrumb: false)
```

The settings named-view slot is how the search page attaches its settings offcanvas
(`src/router/index.js`, `components: { default, settings }`). The entities page uses the
same mechanism, so `EntityListSettings` is a route component, not a child of the page.

Sidebar: a new `app-sidebar-section-entry` in the Search section of
`src/components/AppSidebar/AppSidebar.vue`, after "Saved searches", pointing at
`{ name: 'entity.list' }`. The Search section spans lines 197 to 222 and its last entry
today is "Saved searches". The mockup shows an "Alerts" entry below Entities; no such
entry exists in the sidebar today, so Entities is appended as the last entry.

### Store

A Pinia module `entity`, following `src/store/modules/search`: query string, project,
page, perPage, sort order, selected entity id, response, error and ready flag. URL is
the source of truth for the query parameters, through `useUrlParamWithStore` and
`useUrlParamsWithStore`, as the search page does.

### Settings

`appStore` gains an `entityList` view:

```js
entityList: {
  layout: LAYOUTS.LIST,
  orderBy: ['_score', 'desc'],
  perPage: '25',
  properties: ['name', 'sourceDocument', 'dataSchema', 'project']
}
```

`EntityListSettings` is a `PageSettings` with sections for sort, per page, layout and
properties, built from `useEntityProperties().propertiesOptions` and `sortByOptions`,
structurally identical to `views/Search/SearchSettings.vue`.

The properties list is the "arranged in the setting page" requirement. Note the open
question it raises in "Deferred decisions" below: the choosable set is partly
dataset-dependent.

## Components

### The shared row: `src/components/Card/CardPropertiesEntry.vue`

`DocumentCardPropertiesEntry.vue` today is two things glued together: a generic row
(icon, visually-hidden label, value slot, spacing) and a document-specific resolver
(`useSearchProperties()` lookup keyed on the property name, defaulting the value to
`document[property]`).

An entity card cannot use it as-is. Line 27 evaluates `items[props.property].text`
against `useSearchProperties()`, which has no entry for `ftm_name`, so it throws a
TypeError. Passing `title` and `icon` explicitly does not avoid it, because the computed
still dereferences `items[property]`.

So the generic half is extracted:

```
CardPropertiesEntry.vue
  props: icon, title, hideIcon
  slot:  the value
```

`DocumentCardPropertiesEntry.vue` is rewritten as a thin adapter over it, resolving
icon and label from `useSearchProperties` and defaulting the slot to `document[property]`.
Its public props (`document`, `property`, `title`, `icon`, `hideIcon`) and its rendered
output are unchanged, so its 12 call sites are untouched.

`EntityCardPropertiesEntry.vue` is a second adapter, resolving from `useEntityProperties`
and rendering an array of values.

Sharing the row but not the resolver is the point: entity properties are multi-valued
arrays under namespaced keys, document properties are scalars under fixed keys. Sharing
the resolver would be the wrong reuse.

### `useEntityProperties`

The single place that knows property metadata. Returns `{ items, fields,
propertiesOptions, sortByOptions }`, the same shape as `useSearchProperties`, built with
`useViewProperties().propertyItem` so `PageSettings` and the table head consume it
unchanged.

It covers two kinds of key, and the distinction is what the card's component map keys on:

| Kind | Keys | Source on the entity |
| --- | --- | --- |
| Datashare-level, fixed | `sourceDocument`, `dataSchema`, `project`, `entityType` | `documentIds`, `model`, the project being searched, `entityType` |
| Model-level, dynamic | any `ftm_*` | `properties[key]` |

The fixed keys get an explicit icon and i18n label. The dynamic ones get a default icon
and a humanized label, which is the ontology placeholder.

### `EntityCard`

Props mirror `DocumentCard` so the list container can drive both the same way:
`entity`, `properties`, `active`, `selected`, `selectMode`, `target`, `routeName`.

```
EntityCard
+-- EntityCardProperties
    +-- EntityCardPropertiesEntry                 generic ftm_* row
    +-- EntityCardPropertiesEntrySourceDocument   router-link to the document
    +-- EntityCardPropertiesEntryDataSchema       the model
    +-- EntityCardPropertiesEntryProject          ProjectButton badge, footer
```

`EntityCardProperties` maps property key to component exactly as
`DocumentCardProperties.vue` does, falling back to the generic entry for any key it does
not recognise. That fallback is what lets an unknown dataset render at all.

Title: the card bolds a caption, as the mockup shows. FollowTheMoney has a caption
concept but it is not in the index and resolving it properly needs the ontology.
Phase 1 uses `properties.ftm_name?.[0] ?? entityId`, carrying a `ponytail:` comment
naming the ontology issue as the upgrade path.

`EntityCardPlaceholder` mirrors `DocumentCardPlaceholder` for the loading state.

### `EntityView` and its tabs

| Tab | Content | Depends on the ontology |
| --- | --- | --- |
| Properties and relations | every `properties.*` key and its values, with a filter input over them, as in the mockup | the relations half does |
| Source document | links to each id in `documentIds`, resolved to document titles | no |
| Metadata | `entityId`, `model`, `modelVersions`, `entityType`, raw `_id` | no |

The header counters in the mockup (`# 9`, `7`, `3`) are properties count, relations count
and source documents count. The relations counter stays at zero until the ontology lands.

Phase 1 ships none of this. It is specified here so the card's props and the store's
selected-entity handling are shaped correctly now rather than reworked later.

## Error handling

Three failure modes, each with a defined behaviour:

1. **The entities index does not exist for a project.** A project ingested before the
   entities index existed, or one that never ingested entities, has no
   `<project>.entities` index. Elasticsearch rejects a whole multi-index request when
   any named index is missing, so the entity search must pass
   `ignore_unavailable: true`, as `src/api/elasticsearch.js` already does for project
   statistics (the comment there cites icij/datashare#2384). The page then renders the
   empty state, not an error.
2. **Query error.** Same treatment as the search page: an `EmptyState` with the error
   illustration, the message surfaced, no stack.
3. **An unknown property key.** Renders through the generic entry with a humanized
   label. Never throws. This is the normal case for any dataset we have not hand-mapped,
   so it is a supported path, not a degraded one.

## Testing

Phase 1 is components and stories, so the check is at that level.

- A Storybook story per new component, following
  `src/stories/components/Document/DocumentCard/DocumentCard.stories.js`: `argTypes`
  with a `check` control over the property keys, a realistic `args.entity` fixture.
- The fixture is a real `StructuredEntity` shape, multi-valued properties included, so
  the array assumption is exercised by every story rather than asserted in prose.
- One unit spec on `EntityCardProperties` covering the three cases that carry logic:
  a known fixed key routes to its specific component, an unknown `ftm_*` key falls back
  to the generic entry, and a multi-valued property renders all its values.
- One unit spec on `DocumentCardPropertiesEntry` after the extraction, asserting its
  rendered output is unchanged. This is the regression guard for the 12 untouched call
  sites.

Per the repo convention, run only these spec files, not the full suite.

## Phasing

Phase 1, the only phase approved now:

```
src/components/Card/CardPropertiesEntry.vue                          new
src/components/Document/DocumentCard/DocumentCardPropertiesEntry.vue rewritten as adapter
src/components/Entity/EntityCard/EntityCard.vue                      new
src/components/Entity/EntityCard/EntityCardProperties.vue            new
src/components/Entity/EntityCard/EntityCardPropertiesEntry.vue       new
src/components/Entity/EntityCard/EntityCardPropertiesEntrySourceDocument.vue new
src/components/Entity/EntityCard/EntityCardPropertiesEntryDataSchema.vue     new
src/components/Entity/EntityCard/EntityCardPropertiesEntryProject.vue        new
src/components/Entity/EntityCard/EntityCardPlaceholder.vue           new
src/composables/useEntityProperties.js                               new
src/stories/components/Entity/EntityCard/*.stories.js                new
src/store/modules/app.js                                             entityList settings
src/i18n/*                                                           entityCard.* keys
```

Explicitly not in phase 1, by agreement:

- the select-mode checkbox. The mockup's "Select several entities to start building a
  diagram" banner belongs to the diagram feature, which is out of scope. `EntityCard`
  still takes `selected` and `selectMode` props so the list can drive it later, but
  ships no checkbox child.
- grid and table layouts
- the detail panel and its tabs
- the route, the sidebar entry and the Pinia store

Later phases, in dependency order: list container and toolbar; route, sidebar and store;
detail panel and tabs; the ontology issue; relations.

## Settled decisions

Recorded against ICIJ/datashare#2495 after the card shipped.

1. **Which properties a card shows.** Each card shows its own schema's **featured** properties,
   from the FollowTheMoney ontology. There is no property-picker in the entities settings panel,
   unlike search; the ontology is the single source of truth. The design mockup already assumed
   this: in one list a `Person` card renders *Employer* while another renders *Family* and
   *Relative*.

   This makes the ontology endpoint (ICIJ/datashare#2510) a prerequisite for the list story, and
   it means `EntityCard`'s flat `properties` array is provisional: the card will derive its rows
   per entity from `entityType`.

2. **Sorting a multi-valued property.** Alphabetical, which is elasticsearch's default
   multi-value behaviour: `min` ascending, `max` descending. No explicit `mode` on the sort
   clause.

3. **How many values a card row shows.** At most three, then an ellipsis, with the full list in
   the row's `title` and repeated in a visually-hidden span. One verbose property cannot push the
   other rows off the card. Shipped with the card.

4. **Does the list span projects.** Yes. An entity belongs to one project but can cite several
   source documents (`documentIds` is a Set folded from every statement's provenance). The list
   queries several `<project>.entities` indices at once. Two consequences: the ES `_id` is
   `<model>_<entityId>` and is unique only within an index, so the list key must include the
   project; and each card takes its project from its own hit's `_index`, not from a page-level
   selection.
