# Entity Card Implementation Plan (phase 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `EntityCard` component family and its Storybook stories, so a structured
(FollowTheMoney) entity from the `<project>.entities` index renders as a card.

**Architecture:** The generic half of `DocumentCardPropertiesEntry` is extracted into a shared
`CardPropertiesEntry`, leaving a document-specific adapter behind and allowing an entity-specific
adapter to be added. A single composable, `useEntityProperties`, owns every piece of property
metadata (icon, label, sortability), so the server-side FollowTheMoney ontology can later be
consumed in one place instead of threaded through components.

**Tech Stack:** Vue 3 (`<script setup>`), Pinia, vue-i18n, Vitest + `@vue/test-utils`,
Storybook 8, Bootstrap/SCSS, `@icij/murmur` (`AppIcon`), `unplugin-icons` (`~icons/ph/*`).

**Spec:** `docs/superpowers/specs/2026-10-16-entities-page-design.md`

## Global Constraints

- No em dashes or other non-ASCII characters in source, comments or copy. Use the `&#8212;`
  HTML entity where the UI needs a dash placeholder, exactly as `DocumentCardPropertiesEntry.vue`
  does today.
- Never use "icij" branding in example or fixture data. Use `example.com` / `example.org`.
- Only `src/lang/en.json` is edited by hand. The other locale files are managed by Crowdin.
- Run `yarn lint --fix` before every commit.
- Run only the spec files named in this plan. Do not run the full unit suite.
- Entity property values are **always arrays** in the index. No code may assume a scalar.
- Model property keys are namespaced with an underscore (`ftm_name`), never a colon. A colon is
  the field/value delimiter of Elasticsearch `query_string`, which is why the backend chose `_`.
- New components live under `src/components/Entity/EntityCard/`. Do not rename or modify the
  existing NER components in `src/components/Entity/` (EntityButton, EntityPopover, EntitySection,
  EntityOccurrences, EntityInContext).
- Do not use the app store key `entities` or the route name `task.entities`. Both belong to the
  NER extraction task. This feature uses `entityList`.

## Deviations from the spec, agreed while planning

Two, both simplifications. They are recorded here rather than silently applied:

1. The spec lists an `EntityCardPropertiesEntryDataSchema` component for the "Data schema" row.
   It is not needed. Naming the property key `model` and giving it the label "Data schema" in
   i18n lets the generic entry render it, because `entityPropertyValues` falls back from
   `entity.properties[key]` to `entity[key]`. Same fallback also covers `entityType`, so that
   component is not needed either. Net: 4 entry components instead of 6.
2. The spec's default property list was `['name', 'sourceDocument', 'dataSchema', 'project']`.
   It becomes `['name', 'entityType', 'sourceDocument', 'model', 'project']` to match (1) and to
   show the schema, which the mockup's detail panel treats as primary information.

## Review Focus

Five input classes the spec implies but which no obvious happy-path test exercises. Each has its
test assigned to the task that owns the code.

1. **A property key present in the settings list but absent from the entity.** Real for any
   heterogeneous dataset: one Person has `ftm_country`, the next does not. Must render the
   `&#8212;` placeholder, not `undefined` and not a crash. Pinned in Task 2 and Task 3.
2. **A property key no one has mapped (`ftm_incorporationDate`).** The ontology is server-side
   only, so this is the normal case, not an edge case. Must fall back to a humanized label and
   the default icon without throwing. This is exactly the `TypeError` that
   `DocumentCardPropertiesEntry.vue:27` would raise, so it is the reason the extraction exists.
   Pinned in Task 2 and Task 4.
3. **A multi-valued property (`ftm_name: ["Jane Doe", "J. Doe"]`).** Every value is an array in
   the index, so rendering only the first silently hides data. Pinned in Task 3.
4. **An entity with no name property at all.** `entityCaption` must fall back to `entityId`
   rather than render an empty, unclickable card. Pinned in Task 2.
5. **An entity with an empty `documentIds`.** Statements always carry a provenance document id,
   so this should not happen, but the index does not enforce it. Must render the placeholder,
   not a `RouterLinkDocument` with an undefined id that resolves to a broken route. Pinned in
   Task 3.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/components/Card/CardPropertiesEntry.vue` | **new.** The generic card property row: icon, visually-hidden label, value slot. Knows nothing about documents or entities. |
| `src/components/Document/DocumentCard/DocumentCardPropertiesEntry.vue` | **modify.** Becomes a thin adapter: resolves icon/label from `useSearchProperties`, defaults the value to `document[property]`. Public props and rendered output unchanged. |
| `src/composables/useEntityProperties.js` | **new.** The only place that knows entity property metadata. Also exports `entityPropertyValues` and `entityCaption`. |
| `src/components/Entity/EntityCard/EntityCardPropertiesEntry.vue` | **new.** Entity adapter over `CardPropertiesEntry`. Renders an array of values. |
| `src/components/Entity/EntityCard/EntityCardPropertiesEntryName.vue` | **new.** The emphasized caption row. |
| `src/components/Entity/EntityCard/EntityCardPropertiesEntrySourceDocument.vue` | **new.** Links each `documentIds` entry through `RouterLinkDocument`. |
| `src/components/Entity/EntityCard/EntityCardPropertiesEntryProject.vue` | **new.** The project badge row, reusing `ProjectButton`. |
| `src/components/Entity/EntityCard/EntityCardProperties.vue` | **new.** Maps a property key to its entry component, falling back to the generic one. |
| `src/components/Entity/EntityCard/EntityCard.vue` | **new.** The card shell: layout, active/selected state. |
| `src/components/Entity/EntityCard/EntityCardPlaceholder.vue` | **new.** Loading state. |
| `src/store/modules/app.js` | **modify.** Add the `entityList` settings view. |
| `src/lang/en.json` | **modify.** Add the `entityCard` key block. |
| `src/stories/components/Entity/EntityCard/*.stories.js` | **new.** One story file per rendered component. |
| `tests/unit/specs/components/Document/DocumentCard/DocumentCardPropertiesEntry.spec.js` | **new.** Regression guard for the 12 untouched call sites. |
| `tests/unit/specs/composables/useEntityProperties.spec.js` | **new.** |
| `tests/unit/specs/components/Entity/EntityCard/EntityCardProperties.spec.js` | **new.** |

---

## Task 1: Extract the generic card property row

The regression-critical task. `DocumentCardPropertiesEntry` has exactly 12 call sites (verified:
`grep -rl "DocumentCardPropertiesEntry'" src/ | wc -l`). None of them may change behaviour.

**Files:**
- Create: `src/components/Card/CardPropertiesEntry.vue`
- Modify: `src/components/Document/DocumentCard/DocumentCardPropertiesEntry.vue` (whole file)
- Test: `tests/unit/specs/components/Document/DocumentCard/DocumentCardPropertiesEntry.spec.js`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `CardPropertiesEntry` with props `title: String`, `icon: [String, Object, Array]`,
  `hideIcon: Boolean`, and a default slot for the value. Root element carries the
  `card-properties-entry` class; children are `card-properties-entry__icon` and
  `card-properties-entry__value`.

Note for the implementer: no SCSS, test or story anywhere in the repo references the
`document-card-properties-entry` BEM child classes (verified by grep over `src/`, `tests/` and
`src/stories/`), so renaming the inner elements is safe. The root class is preserved anyway via
Vue's attribute fallthrough.

- [ ] **Step 1: Write the failing regression test**

Create `tests/unit/specs/components/Document/DocumentCard/DocumentCardPropertiesEntry.spec.js`:

```js
import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentCardPropertiesEntry from '@/components/Document/DocumentCard/DocumentCardPropertiesEntry'

describe('DocumentCardPropertiesEntry.vue', () => {
  const mountEntry = (props, slots = {}) => {
    const core = CoreSetup.init().useAll()
    return mount(DocumentCardPropertiesEntry, {
      global: { plugins: core.plugins },
      props,
      slots
    })
  }

  it('renders the document value for the given property', () => {
    const document = { author: 'Jane Doe <jane@example.com>' }
    const wrapper = mountEntry({ document, property: 'author' })
    expect(wrapper.text()).toContain('Jane Doe <jane@example.com>')
  })

  it('labels the entry with the property text from the search properties', () => {
    const document = { author: 'Jane Doe <jane@example.com>' }
    const wrapper = mountEntry({ document, property: 'author' })
    expect(wrapper.find('.visually-hidden').text()).toBe('Author:')
  })

  it('prefers an explicit title over the resolved one', () => {
    const document = { author: 'Jane Doe <jane@example.com>' }
    const wrapper = mountEntry({ document, property: 'author', title: 'Written by' })
    expect(wrapper.find('.visually-hidden').text()).toBe('Written by:')
  })

  it('hides the icon when hideIcon is set', () => {
    const document = { author: 'Jane Doe <jane@example.com>' }
    const wrapper = mountEntry({ document, property: 'author', hideIcon: true })
    expect(wrapper.find('.card-properties-entry__icon').exists()).toBe(false)
  })

  it('renders the slot instead of the document value when one is given', () => {
    const document = { author: 'Jane Doe <jane@example.com>' }
    const wrapper = mountEntry({ document, property: 'author' }, { default: '<b>slotted</b>' })
    expect(wrapper.text()).toContain('slotted')
    expect(wrapper.text()).not.toContain('Jane Doe')
  })

  it('falls back to a dash when the document has no such property', () => {
    const wrapper = mountEntry({ document: {}, property: 'author' })
    expect(wrapper.find('.card-properties-entry__value').text()).toBe('\u2014')
  })
})
```

- [ ] **Step 2: Run the test to see which assertions already hold**

Run: `yarn test:unit tests/unit/specs/components/Document/DocumentCard/DocumentCardPropertiesEntry.spec.js`

Expected: the first three and the fifth PASS against the current component. The `hideIcon` and
dash tests FAIL, because today's markup uses `document-card-properties-entry__icon` and
`document-card-properties-entry__value`. That is the point: these two pin the class rename.

- [ ] **Step 3: Create the generic row**

Create `src/components/Card/CardPropertiesEntry.vue`:

```vue
<script setup>
import { AppIcon } from '@icij/murmur'

defineProps({
  /**
   * Human-readable label for the row, announced to screen readers and shown in the icon tooltip.
   */
  title: {
    type: String
  },
  /**
   * Icon component or name, passed straight to AppIcon.
   */
  icon: {
    type: [String, Object, Array]
  },
  /**
   * Render the row without its leading icon.
   */
  hideIcon: {
    type: Boolean
  }
})
</script>

<template>
  <div class="card-properties-entry d-flex px-1 mb-2 text-secondary-emphasis">
    <div
      v-if="!hideIcon"
      v-b-tooltip.body
      class="card-properties-entry__icon above-stretched-link pe-2 flex-shrink-0"
      :title="title"
    >
      <app-icon
        size="1.25em"
        :name="icon"
      />
    </div>
    <span class="visually-hidden">{{ title }}:</span>
    <div class="card-properties-entry__value">
      <slot />
    </div>
  </div>
</template>
```

- [ ] **Step 4: Rewrite the document entry as an adapter**

Replace the whole of `src/components/Document/DocumentCard/DocumentCardPropertiesEntry.vue`:

```vue
<script setup>
import { computed, toValue } from 'vue'

import CardPropertiesEntry from '@/components/Card/CardPropertiesEntry'
import { useSearchProperties } from '@/composables/useSearchProperties'

const { items } = useSearchProperties()

const props = defineProps({
  document: {
    type: Object
  },
  property: {
    type: String
  },
  title: {
    type: String
  },
  icon: {
    type: [String, Object, Array]
  },
  hideIcon: {
    type: Boolean
  }
})

const field = computed(() => items[props.property] ?? {})
const display = computed(() => toValue(props.title ?? field.value.text ?? props.property))
const icon = computed(() => props.icon ?? field.value.icon ?? props.property)
</script>

<template>
  <card-properties-entry
    class="document-card-properties-entry"
    :title="display"
    :icon="icon"
    :hide-icon="hideIcon"
  >
    <slot>{{ document[property] ?? '&#8212;' }}</slot>
  </card-properties-entry>
</template>
```

The `items[props.property] ?? {}` guard is new and deliberate: the old code threw a TypeError on
an unmapped property. Nothing in the document path hits that, but removing the trap costs one
`??`.

- [ ] **Step 5: Run the test to verify it passes**

Run: `yarn test:unit tests/unit/specs/components/Document/DocumentCard/DocumentCardPropertiesEntry.spec.js`

Expected: 6 passed.

- [ ] **Step 6: Verify the 12 call sites still render**

Run: `yarn test:unit tests/unit/specs/components/Document`

Expected: no new failures. Note the pre-existing pass/fail count before you start if anything is
already red.

- [ ] **Step 7: Lint and commit**

```bash
yarn lint --fix
git add src/components/Card/CardPropertiesEntry.vue \
        src/components/Document/DocumentCard/DocumentCardPropertiesEntry.vue \
        tests/unit/specs/components/Document/DocumentCard/DocumentCardPropertiesEntry.spec.js
git commit -m "refactor(card): extract the generic card property row"
```

---

## Task 2: The `useEntityProperties` composable

The only place that knows entity property metadata. Everything the server-side ontology will
later supply enters here and nowhere else.

**Files:**
- Create: `src/composables/useEntityProperties.js`
- Modify: `src/lang/en.json`
- Modify: `src/store/modules/app.js` (add `entityList` beside the other view settings)
- Test: `tests/unit/specs/composables/useEntityProperties.spec.js`

**Interfaces:**
- Consumes: `useViewProperties().propertyItem`, `useViewSettings().fieldsToSortByOptions` and
  `.fieldsToPropertiesOptions`, both already used by `useSearchProperties`.
- Produces:
  - `ENTITY_FIELD` frozen object: `NAME: 'name'`, `ENTITY_TYPE: 'entityType'`,
    `SOURCE_DOCUMENT: 'sourceDocument'`, `MODEL: 'model'`, `PROJECT: 'project'`.
  - `entityPropertyValues(entity, key) -> string[]`
  - `entityCaption(entity) -> string`
  - `humanizePropertyKey(key) -> string`
  - `useEntityProperties() -> { items, item, fields, propertiesOptions, sortByOptions }` where
    `item(key)` resolves any key, known or not.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/specs/composables/useEntityProperties.spec.js`:

```js
import { toValue } from 'vue'

import CoreSetup from '~tests/unit/CoreSetup'
import {
  useEntityProperties,
  entityPropertyValues,
  entityCaption,
  humanizePropertyKey
} from '@/composables/useEntityProperties'

const entity = {
  entityId: 'NK-7f3a',
  model: 'ftm',
  entityType: 'Person',
  modelVersions: ['3.5.9'],
  documentIds: ['doc-1'],
  properties: {
    ftm_name: ['Jane Doe', 'J. Doe'],
    ftm_country: ['tm'],
    ftm_alias: []
  }
}

describe('humanizePropertyKey', () => {
  it('strips the model namespace and spaces out the camel case', () => {
    expect(humanizePropertyKey('ftm_birthDate')).toBe('Birth date')
  })

  it('keeps a key that carries no namespace', () => {
    expect(humanizePropertyKey('name')).toBe('Name')
  })

  it('returns an empty string for a missing key', () => {
    expect(humanizePropertyKey()).toBe('')
  })
})

describe('entityPropertyValues', () => {
  it('returns every value of a multi-valued model property', () => {
    expect(entityPropertyValues(entity, 'ftm_name')).toEqual(['Jane Doe', 'J. Doe'])
  })

  it('falls back to a root field when the key is not a model property', () => {
    expect(entityPropertyValues(entity, 'entityType')).toEqual(['Person'])
  })

  it('returns an empty array for a key the entity does not carry', () => {
    expect(entityPropertyValues(entity, 'ftm_incorporationDate')).toEqual([])
  })

  it('drops empty values so a present-but-blank property reads as absent', () => {
    expect(entityPropertyValues(entity, 'ftm_alias')).toEqual([])
  })

  it('tolerates a missing entity', () => {
    expect(entityPropertyValues(undefined, 'ftm_name')).toEqual([])
  })
})

describe('entityCaption', () => {
  it('uses the first value of the model name property', () => {
    expect(entityCaption(entity)).toBe('Jane Doe')
  })

  it('falls back to the entity id when there is no name', () => {
    expect(entityCaption({ entityId: 'NK-7f3a', model: 'ftm', properties: {} })).toBe('NK-7f3a')
  })
})

describe('useEntityProperties', () => {
  const withSetup = (fn) => {
    const core = CoreSetup.init().useAll()
    return core.mount({ template: '<span />', setup: () => fn() })
  }

  it('resolves a known field with its own label', () => {
    let resolved
    withSetup(() => {
      const { item } = useEntityProperties()
      resolved = item('sourceDocument')
      return {}
    })
    expect(toValue(resolved.text)).toBe('Source document')
  })

  it('resolves an unmapped model property to a humanized label', () => {
    let resolved
    withSetup(() => {
      const { item } = useEntityProperties()
      resolved = item('ftm_incorporationDate')
      return {}
    })
    expect(toValue(resolved.text)).toBe('Incorporation date')
    expect(resolved.icon).not.toBeNull()
  })
})
```

Note for the implementer: `CoreSetup` is at `tests/unit/CoreSetup.js`, aliased as
`~tests/unit/CoreSetup`. Check its API before writing the `withSetup` helper. If it exposes no
`mount`, use `@vue/test-utils`'s `mount` on an inline component with
`global: { plugins: core.plugins }` and assign from inside `setup`, the same way the other
composable specs in `tests/unit/specs/composables/` do. Follow whichever pattern is already
there rather than introducing a new one.

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn test:unit tests/unit/specs/composables/useEntityProperties.spec.js`

Expected: FAIL, "Failed to resolve import @/composables/useEntityProperties".

- [ ] **Step 3: Add the i18n keys**

In `src/lang/en.json`, add a top-level `entityCard` block (keep the file's existing key ordering
convention, alphabetical among its siblings):

```json
"entityCard": {
  "properties": {
    "name": "Name",
    "entityType": "Data schema",
    "sourceDocument": "Source document",
    "model": "Data model",
    "project": "Project"
  }
}
```

Do not touch `src/lang/ach.json`, `de.json`, `es.json`, `fr.json`, `ja.json` or `zh.json`.
Crowdin owns them.

- [ ] **Step 4: Write the composable**

Create `src/composables/useEntityProperties.js`:

```js
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import startCase from 'lodash/startCase'
import upperFirst from 'lodash/upperFirst'

import IPhIdentificationCard from '~icons/ph/identification-card'
import IPhStack from '~icons/ph/stack'
import IPhFile from '~icons/ph/file'
import IPhDatabase from '~icons/ph/database'
import IPhCirclesThreePlus from '~icons/ph/circles-three-plus'
import IPhTag from '~icons/ph/tag'

import { useViewProperties } from '@/composables/useViewProperties'
import { SORT_TYPE_KEY, useViewSettings } from '@/composables/useViewSettings'

/**
 * Fields the entity carries itself, as opposed to the model properties, which are namespaced
 * (`ftm_name`) and depend entirely on what a given project ingested.
 */
export const ENTITY_FIELD = Object.freeze({
  NAME: 'name',
  ENTITY_TYPE: 'entityType',
  SOURCE_DOCUMENT: 'sourceDocument',
  MODEL: 'model',
  PROJECT: 'project'
})

// The backend namespaces a property with an underscore rather than a colon, because a colon is
// the field/value delimiter of elasticsearch's query_string and "properties.ftm:name:Jane" is a
// parse error. See StructuredEntity.NAMESPACE_SEPARATOR.
const NAMESPACE_SEPARATOR = '_'

/**
 * ponytail: labels for model properties are humanized from the key, because the FollowTheMoney
 * ontology is server-side only: FtmTargetModel reads the bundled defaultModel.json and exposes it
 * to Java callers, with no HTTP route. Replace this with the ontology's own labels once the
 * epic's ontology endpoint lands. This function and `item` below are the only places to change.
 */
export function humanizePropertyKey(key = '') {
  const [, ...rest] = key.split(NAMESPACE_SEPARATOR)
  const bare = rest.length ? rest.join(NAMESPACE_SEPARATOR) : key
  return upperFirst(startCase(bare).toLowerCase())
}

/**
 * Every value held under `key`, always as an array.
 *
 * Model properties live under `properties`, the entity's own fields at the root, and the index
 * stores every property value as an array even when there is one. Callers get one shape for all
 * three, so no component has to know which kind of key it was handed.
 */
export function entityPropertyValues(entity, key) {
  const values = entity?.properties?.[key] ?? entity?.[key] ?? []
  return [].concat(values).filter((value) => value !== null && value !== undefined && value !== '')
}

/**
 * ponytail: FollowTheMoney has a caption concept, resolved per schema from an ordered list of
 * candidate properties, but the index holds no caption field and the resolution rules live in the
 * ontology. First name value, else the id. Upgrade with the ontology endpoint.
 */
export function entityCaption(entity) {
  const key = [entity?.model, 'name'].join(NAMESPACE_SEPARATOR)
  const [name] = entityPropertyValues(entity, key)
  return name ?? entity?.entityId ?? ''
}

export function useEntityProperties() {
  const { t } = useI18n()
  const { propertyItem } = useViewProperties()
  const { fieldsToSortByOptions, fieldsToPropertiesOptions } = useViewSettings()

  const name = propertyItem({
    icon: IPhIdentificationCard,
    key: ENTITY_FIELD.NAME,
    required: true,
    emphasis: true,
    text: computed(() => t('entityCard.properties.name'))
  })

  const entityType = propertyItem({
    icon: IPhStack,
    key: ENTITY_FIELD.ENTITY_TYPE,
    sortable: true,
    type: SORT_TYPE_KEY.ALPHA,
    text: computed(() => t('entityCard.properties.entityType'))
  })

  const sourceDocument = propertyItem({
    icon: IPhFile,
    key: ENTITY_FIELD.SOURCE_DOCUMENT,
    text: computed(() => t('entityCard.properties.sourceDocument'))
  })

  const model = propertyItem({
    icon: IPhDatabase,
    key: ENTITY_FIELD.MODEL,
    sortable: true,
    type: SORT_TYPE_KEY.ALPHA,
    text: computed(() => t('entityCard.properties.model'))
  })

  const project = propertyItem({
    icon: IPhCirclesThreePlus,
    key: ENTITY_FIELD.PROJECT,
    text: computed(() => t('entityCard.properties.project'))
  })

  const items = { name, entityType, sourceDocument, model, project }
  const fields = Object.values(items)
  const sortByOptions = fieldsToSortByOptions(fields)
  const propertiesOptions = fieldsToPropertiesOptions(fields)

  /**
   * Resolves any key to a property item. A key this composable does not know is a model property
   * from a dataset nobody mapped, which is the normal case while the ontology stays server-side,
   * so it gets a default icon and a humanized label rather than an error.
   */
  const item = (key) => {
    return items[key] ?? propertyItem({ icon: IPhTag, key, text: humanizePropertyKey(key) })
  }

  return { items, item, fields, propertiesOptions, sortByOptions }
}
```

Note for the implementer: confirm `~icons/ph/identification-card`, `~icons/ph/stack`,
`~icons/ph/database` and `~icons/ph/tag` resolve. `unplugin-icons` pulls them from the installed
`@iconify-json/ph` set, so a missing name fails at import time and the test in step 5 will say
so. Substitute a neighbouring Phosphor icon if one is absent.

- [ ] **Step 5: Run the test to verify it passes**

Run: `yarn test:unit tests/unit/specs/composables/useEntityProperties.spec.js`

Expected: all PASS.

- [ ] **Step 6: Add the app store settings view**

In `src/store/modules/app.js`, beside the other view settings (the `search` block is at line 36,
the NER task `entities` block at line 68), add:

```js
entityList: {
  layout: LAYOUTS.LIST,
  orderBy: ['_score', 'desc'],
  perPage: '25',
  properties: ['name', 'entityType', 'sourceDocument', 'model', 'project']
},
```

The key is `entityList`, not `entities`. `entities` is the NER extraction task list and is
already taken.

- [ ] **Step 7: Lint and commit**

```bash
yarn lint --fix
git add src/composables/useEntityProperties.js \
        tests/unit/specs/composables/useEntityProperties.spec.js \
        src/lang/en.json src/store/modules/app.js
git commit -m "feat(entity): add the entity properties composable"
```

---

## Task 3: The entity property row components

Four components: the generic row plus three that need their own rendering.

**Files:**
- Create: `src/components/Entity/EntityCard/EntityCardPropertiesEntry.vue`
- Create: `src/components/Entity/EntityCard/EntityCardPropertiesEntryName.vue`
- Create: `src/components/Entity/EntityCard/EntityCardPropertiesEntrySourceDocument.vue`
- Create: `src/components/Entity/EntityCard/EntityCardPropertiesEntryProject.vue`
- Test: `tests/unit/specs/components/Entity/EntityCard/EntityCardPropertiesEntry.spec.js`

**Interfaces:**
- Consumes: `CardPropertiesEntry` (Task 1); `useEntityProperties`, `entityPropertyValues`,
  `entityCaption` (Task 2); `RouterLinkDocument` and `ProjectButton` (existing).
- Produces: four components, each taking `entity: Object` and `property: String`.
  `EntityCardPropertiesEntrySourceDocument` additionally takes `index: String` (the
  Elasticsearch index the linked document lives in). `EntityCardPropertiesEntryProject`
  additionally takes `project: [Object, String]`.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/specs/components/Entity/EntityCard/EntityCardPropertiesEntry.spec.js`:

```js
import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import EntityCardPropertiesEntry from '@/components/Entity/EntityCard/EntityCardPropertiesEntry'
import EntityCardPropertiesEntrySourceDocument from '@/components/Entity/EntityCard/EntityCardPropertiesEntrySourceDocument'
import RouterLinkDocument from '@/components/RouterLink/RouterLinkDocument'

const entity = {
  entityId: 'NK-7f3a',
  model: 'ftm',
  entityType: 'Person',
  documentIds: ['doc-1', 'doc-2'],
  properties: { ftm_name: ['Jane Doe', 'J. Doe'], ftm_country: ['tm'] }
}

const mountWith = (component, props) => {
  const core = CoreSetup.init().useAll()
  return mount(component, { global: { plugins: core.plugins }, props })
}

describe('EntityCardPropertiesEntry.vue', () => {
  it('renders every value of a multi-valued property', () => {
    const wrapper = mountWith(EntityCardPropertiesEntry, { entity, property: 'ftm_name' })
    expect(wrapper.text()).toContain('Jane Doe')
    expect(wrapper.text()).toContain('J. Doe')
  })

  it('labels an unmapped model property with its humanized key', () => {
    const wrapper = mountWith(EntityCardPropertiesEntry, { entity, property: 'ftm_country' })
    expect(wrapper.find('.visually-hidden').text()).toBe('Country:')
  })

  it('falls back to a dash when the entity does not carry the property', () => {
    const wrapper = mountWith(EntityCardPropertiesEntry, { entity, property: 'ftm_birthDate' })
    expect(wrapper.find('.card-properties-entry__value').text()).toBe('\u2014')
  })

  it('reads a root field such as entityType, not only a model property', () => {
    const wrapper = mountWith(EntityCardPropertiesEntry, { entity, property: 'entityType' })
    expect(wrapper.text()).toContain('Person')
  })
})

describe('EntityCardPropertiesEntrySourceDocument.vue', () => {
  it('links every source document', () => {
    const wrapper = mountWith(EntityCardPropertiesEntrySourceDocument, {
      entity,
      property: 'sourceDocument',
      index: 'local-datashare'
    })
    expect(wrapper.findAllComponents(RouterLinkDocument)).toHaveLength(2)
  })

  it('renders a dash and no link when the entity has no source document', () => {
    const wrapper = mountWith(EntityCardPropertiesEntrySourceDocument, {
      entity: { ...entity, documentIds: [] },
      property: 'sourceDocument',
      index: 'local-datashare'
    })
    expect(wrapper.findAllComponents(RouterLinkDocument)).toHaveLength(0)
    expect(wrapper.text()).toContain('\u2014')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn test:unit tests/unit/specs/components/Entity/EntityCard/EntityCardPropertiesEntry.spec.js`

Expected: FAIL, "Failed to resolve import @/components/Entity/EntityCard/EntityCardPropertiesEntry".

- [ ] **Step 3: Write the generic entry**

Create `src/components/Entity/EntityCard/EntityCardPropertiesEntry.vue`:

```vue
<script setup>
import { computed, toValue } from 'vue'

import CardPropertiesEntry from '@/components/Card/CardPropertiesEntry'
import { useEntityProperties, entityPropertyValues } from '@/composables/useEntityProperties'

const props = defineProps({
  entity: {
    type: Object
  },
  property: {
    type: String
  },
  title: {
    type: String
  },
  icon: {
    type: [String, Object, Array]
  },
  hideIcon: {
    type: Boolean
  }
})

const { item } = useEntityProperties()

const field = computed(() => item(props.property))
const display = computed(() => toValue(props.title ?? field.value.text ?? props.property))
const icon = computed(() => props.icon ?? field.value.icon)
const values = computed(() => entityPropertyValues(props.entity, props.property))
</script>

<template>
  <card-properties-entry
    class="entity-card-properties-entry"
    :title="display"
    :icon="icon"
    :hide-icon="hideIcon"
  >
    <slot>{{ values.length ? values.join(', ') : '&#8212;' }}</slot>
  </card-properties-entry>
</template>
```

- [ ] **Step 4: Write the three specific entries**

Create `src/components/Entity/EntityCard/EntityCardPropertiesEntryName.vue`:

```vue
<script setup>
import { computed } from 'vue'

import EntityCardPropertiesEntry from './EntityCardPropertiesEntry'

import { entityCaption } from '@/composables/useEntityProperties'

const props = defineProps({
  entity: {
    type: Object
  },
  property: {
    type: String
  }
})

const caption = computed(() => entityCaption(props.entity))
</script>

<template>
  <entity-card-properties-entry
    class="entity-card-properties-entry-name"
    :entity="entity"
    :property="property"
  >
    <span class="entity-card-properties-entry-name__caption fw-bold text-body">{{ caption }}</span>
  </entity-card-properties-entry>
</template>
```

Create `src/components/Entity/EntityCard/EntityCardPropertiesEntrySourceDocument.vue`:

```vue
<script setup>
import { computed } from 'vue'

import EntityCardPropertiesEntry from './EntityCardPropertiesEntry'

import RouterLinkDocument from '@/components/RouterLink/RouterLinkDocument'

const props = defineProps({
  entity: {
    type: Object
  },
  property: {
    type: String
  },
  /**
   * The elasticsearch index holding the source documents, i.e. the project name.
   */
  index: {
    type: String,
    required: true
  }
})

// ponytail: the mockup shows document titles, which the entities index does not hold. Resolving
// them means a second lookup against <project> for every id on screen. Showing the id is enough
// to navigate; add the lookup when the list view lands and can batch it.
const documentIds = computed(() => props.entity?.documentIds ?? [])
</script>

<template>
  <entity-card-properties-entry
    class="entity-card-properties-entry-source-document"
    :entity="entity"
    :property="property"
  >
    <template v-if="documentIds.length">
      <router-link-document
        v-for="id in documentIds"
        :id="id"
        :key="id"
        :index="index"
        :routing="id"
        class="entity-card-properties-entry-source-document__link d-block text-truncate"
      >
        {{ id }}
      </router-link-document>
    </template>
    <template v-else>&#8212;</template>
  </entity-card-properties-entry>
</template>
```

Create `src/components/Entity/EntityCard/EntityCardPropertiesEntryProject.vue`:

```vue
<script setup>
import EntityCardPropertiesEntry from './EntityCardPropertiesEntry'

import ProjectButton from '@/components/Project/ProjectButton'

defineProps({
  entity: {
    type: Object
  },
  property: {
    type: String
  },
  project: {
    type: [Object, String],
    required: true
  }
})
</script>

<template>
  <entity-card-properties-entry
    class="entity-card-properties-entry-project"
    :entity="entity"
    :property="property"
    hide-icon
  >
    <project-button
      :project="project"
      no-link
      disabled
    />
  </entity-card-properties-entry>
</template>
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `yarn test:unit tests/unit/specs/components/Entity/EntityCard/EntityCardPropertiesEntry.spec.js`

Expected: 6 passed.

- [ ] **Step 6: Lint and commit**

```bash
yarn lint --fix
git add src/components/Entity/EntityCard/ \
        tests/unit/specs/components/Entity/EntityCard/EntityCardPropertiesEntry.spec.js
git commit -m "feat(entity): add the entity card property rows"
```

---

## Task 4: The card itself

**Files:**
- Create: `src/components/Entity/EntityCard/EntityCardProperties.vue`
- Create: `src/components/Entity/EntityCard/EntityCard.vue`
- Create: `src/components/Entity/EntityCard/EntityCardPlaceholder.vue`
- Test: `tests/unit/specs/components/Entity/EntityCard/EntityCardProperties.spec.js`

**Interfaces:**
- Consumes: the four entry components and `useEntityProperties` from Tasks 2 and 3.
- Produces: `EntityCard` with props `entity: Object`, `project: [Object, String]`,
  `index: String`, `properties: Array` (default
  `['name', 'entityType', 'sourceDocument', 'model', 'project']`), `active: Boolean`,
  `selected: Boolean`, `selectMode: Boolean`. `EntityCardPlaceholder` with props
  `properties: Array`, `repeat: Number`.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/specs/components/Entity/EntityCard/EntityCardProperties.spec.js`:

```js
import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import EntityCardProperties from '@/components/Entity/EntityCard/EntityCardProperties'
import EntityCardPropertiesEntry from '@/components/Entity/EntityCard/EntityCardPropertiesEntry'
import EntityCardPropertiesEntryName from '@/components/Entity/EntityCard/EntityCardPropertiesEntryName'
import EntityCardPropertiesEntrySourceDocument from '@/components/Entity/EntityCard/EntityCardPropertiesEntrySourceDocument'
import EntityCardPropertiesEntryProject from '@/components/Entity/EntityCard/EntityCardPropertiesEntryProject'

const entity = {
  entityId: 'NK-7f3a',
  model: 'ftm',
  entityType: 'Person',
  documentIds: ['doc-1'],
  properties: { ftm_name: ['Jane Doe'], ftm_country: ['tm'] }
}

const mountProperties = (properties) => {
  const core = CoreSetup.init().useAll()
  return mount(EntityCardProperties, {
    global: { plugins: core.plugins },
    props: { entity, properties, project: 'banana-papers', index: 'banana-papers' }
  })
}

describe('EntityCardProperties.vue', () => {
  it('routes a known key to its own entry component', () => {
    const wrapper = mountProperties(['name', 'sourceDocument', 'project'])
    expect(wrapper.findComponent(EntityCardPropertiesEntryName).exists()).toBe(true)
    expect(wrapper.findComponent(EntityCardPropertiesEntrySourceDocument).exists()).toBe(true)
    expect(wrapper.findComponent(EntityCardPropertiesEntryProject).exists()).toBe(true)
  })

  it('falls back to the generic entry for an unmapped model property', () => {
    const wrapper = mountProperties(['ftm_country'])
    expect(wrapper.findComponent(EntityCardPropertiesEntryName).exists()).toBe(false)
    expect(wrapper.findAllComponents(EntityCardPropertiesEntry).length).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('tm')
  })

  it('renders a row per requested property, in the requested order', () => {
    const wrapper = mountProperties(['name', 'ftm_country', 'model'])
    const rows = wrapper.findAll('.card-properties-entry')
    expect(rows).toHaveLength(3)
    expect(rows[1].text()).toContain('tm')
  })

  it('renders nothing for an empty property list', () => {
    const wrapper = mountProperties([])
    expect(wrapper.findAll('.card-properties-entry')).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn test:unit tests/unit/specs/components/Entity/EntityCard/EntityCardProperties.spec.js`

Expected: FAIL, "Failed to resolve import @/components/Entity/EntityCard/EntityCardProperties".

- [ ] **Step 3: Write the properties mapper**

Create `src/components/Entity/EntityCard/EntityCardProperties.vue`:

```vue
<script setup>
import EntityCardPropertiesEntry from './EntityCardPropertiesEntry'
import EntityCardPropertiesEntryName from './EntityCardPropertiesEntryName'
import EntityCardPropertiesEntryProject from './EntityCardPropertiesEntryProject'
import EntityCardPropertiesEntrySourceDocument from './EntityCardPropertiesEntrySourceDocument'

import { ENTITY_FIELD } from '@/composables/useEntityProperties'

// Keys needing their own rendering. Everything else, including every model property and the
// entity's own `entityType` and `model`, goes through the generic entry: an unmapped key is the
// normal case while the FollowTheMoney ontology stays server-side.
const entryComponents = {
  [ENTITY_FIELD.NAME]: EntityCardPropertiesEntryName,
  [ENTITY_FIELD.SOURCE_DOCUMENT]: EntityCardPropertiesEntrySourceDocument,
  [ENTITY_FIELD.PROJECT]: EntityCardPropertiesEntryProject
}

defineProps({
  entity: {
    type: Object
  },
  properties: {
    type: Array,
    default: () => []
  },
  project: {
    type: [Object, String],
    required: true
  },
  index: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="entity-card-properties text-break">
    <component
      :is="entryComponents[key] ?? EntityCardPropertiesEntry"
      v-for="key in properties"
      :key="key"
      :entity="entity"
      :property="key"
      :project="project"
      :index="index"
    />
  </div>
</template>
```

Note for the implementer: `project` and `index` are passed to every row. Vue drops an unknown
prop into `$attrs`, and both `EntityCardPropertiesEntry` and the two others that do not declare
them inherit them onto the root element as attributes. That is harmless here, but if lint or a
snapshot complains, add `inheritAttrs: false` via a second `<script>` block to the components
that do not use them.

- [ ] **Step 4: Write the card and the placeholder**

Create `src/components/Entity/EntityCard/EntityCard.vue`:

```vue
<script setup>
import { computed } from 'vue'

import EntityCardProperties from './EntityCardProperties'

const props = defineProps({
  entity: {
    type: Object
  },
  /**
   * The project the entity belongs to, shown as a badge and used to resolve source documents.
   */
  project: {
    type: [Object, String],
    required: true
  },
  /**
   * The elasticsearch index holding the source documents. Defaults to the project name.
   */
  index: {
    type: String
  },
  properties: {
    type: Array,
    default: () => ['name', 'entityType', 'sourceDocument', 'model', 'project']
  },
  active: {
    type: Boolean
  },
  selected: {
    type: Boolean
  },
  /**
   * Reserved for the selection the diagram feature will need. The card reflects `selected` but
   * ships no checkbox yet.
   */
  selectMode: {
    type: Boolean,
    default: false
  }
})

const index = computed(() => props.index ?? (typeof props.project === 'string' ? props.project : props.project?.name))

const classList = computed(() => ({
  'entity-card--active': props.active,
  'entity-card--select-mode': props.selectMode,
  'entity-card--selected': props.selectMode && props.selected
}))
</script>

<template>
  <div
    class="entity-card"
    :class="classList"
  >
    <entity-card-properties
      class="entity-card__properties"
      :entity="entity"
      :properties="properties"
      :project="project"
      :index="index"
    />
  </div>
</template>

<style lang="scss">
.entity-card {
  display: flex;
  gap: $spacer-sm;
  padding: $spacer;
  background: var(--bs-body);
  border-radius: var(--bs-border-radius);
  position: relative;

  &:hover {
    background: var(--bs-tertiary-bg-subtle);
  }

  &--selected:not(&--active) {
    box-shadow: 0 0 0 1px var(--bs-action-text-emphasis) inset;
  }

  &--active {
    box-shadow: 0 0 0 1px var(--bs-primary) inset;
  }

  &__properties {
    flex: 1;
  }
}
</style>
```

Create `src/components/Entity/EntityCard/EntityCardPlaceholder.vue`:

```vue
<script setup>
import random from 'lodash/random'

import AppPlaceholder from '@/components/AppPlaceholder/AppPlaceholder'

defineProps({
  properties: {
    type: Array,
    default: () => ['name', 'entityType', 'sourceDocument', 'model', 'project']
  },
  repeat: {
    type: Number,
    default: 1
  }
})
</script>

<template>
  <div
    v-for="i in repeat"
    :key="i"
    class="entity-card-placeholder p-3 d-flex gap-3"
  >
    <div class="entity-card-placeholder__properties d-flex flex-column gap-2 h-100 w-100">
      <app-placeholder :width="random(40, 70)" />
      <div
        v-for="j in properties.length - 1"
        :key="j"
        class="d-flex flex-grow-1 gap-1 align-items-start"
      >
        <app-placeholder width="1em" />
        <app-placeholder :width="random(5, 20)" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.entity-card-placeholder {
  background: var(--bs-body);
  border-radius: var(--bs-border-radius);

  &__properties {
    flex: 1;
  }
}
</style>
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `yarn test:unit tests/unit/specs/components/Entity/EntityCard/`

Expected: all PASS, the Task 3 spec included.

- [ ] **Step 6: Lint and commit**

```bash
yarn lint --fix
git add src/components/Entity/EntityCard/ \
        tests/unit/specs/components/Entity/EntityCard/EntityCardProperties.spec.js
git commit -m "feat(entity): add the entity card"
```

---

## Task 5: Stories

The deliverable you review the design against. Every story uses a realistic `StructuredEntity`
fixture with multi-valued properties, so the array assumption is exercised on screen rather than
only in tests.

**Files:**
- Create: `src/stories/components/Entity/EntityCard/EntityCard.stories.js`
- Create: `src/stories/components/Entity/EntityCard/EntityCardProperties.stories.js`
- Create: `src/stories/components/Entity/EntityCard/EntityCardPlaceholder.stories.js`

**Interfaces:**
- Consumes: `EntityCard`, `EntityCardProperties`, `EntityCardPlaceholder` from Task 4.
- Produces: nothing other tasks depend on.

- [ ] **Step 1: Write the EntityCard story**

Create `src/stories/components/Entity/EntityCard/EntityCard.stories.js`:

```js
import { vueRouter } from 'storybook-vue3-router'

import EntityCard from '@/components/Entity/EntityCard/EntityCard'

const routes = [
  { path: '/', name: 'document' },
  { path: '/ds', name: 'document-standalone' },
  { path: '/project/:name', name: 'project.view' }
]

// The shape EntitiesIndexRebuilder writes into the "<project>.entities" index: namespaced,
// always-array property values, the entity's own fields at the root.
const entity = {
  entityId: 'NK-7f3a2c91',
  model: 'ftm',
  entityType: 'Person',
  modelVersions: ['3.5.9'],
  documentIds: ['e1f2a3b4c5d6', 'a9b8c7d6e5f4'],
  properties: {
    ftm_name: ['Mr Yazmurad N Seryaev', 'Y. Seryaev'],
    ftm_country: ['Turkmenistan'],
    ftm_birthDate: ['1954-03-12'],
    ftm_position: ['Head of Mission'],
    ftm_sourceUrl: ['https://example.org/heads-of-mission.csv']
  }
}

const properties = [
  'name',
  'entityType',
  'ftm_country',
  'ftm_birthDate',
  'ftm_position',
  'sourceDocument',
  'model',
  'project'
]

export default {
  title: 'Components/Entity/EntityCard/EntityCard',
  decorators: [vueRouter(routes)],
  component: EntityCard,
  tags: ['autodocs'],
  argTypes: {
    properties: {
      control: 'check',
      options: properties
    }
  },
  args: {
    entity,
    project: 'banana-papers',
    index: 'banana-papers',
    properties,
    active: false,
    selected: false,
    selectMode: false
  },
  render: (args) => ({
    components: { EntityCard },
    setup: () => ({ args }),
    template: `<entity-card v-bind="args" />`
  })
}

export const Default = {}

export const Active = { args: { active: true } }

// The heterogeneous case: a second entity in the same dataset carrying none of the properties the
// first one has. Every missing row must render the dash placeholder.
export const SparseEntity = {
  args: {
    entity: {
      entityId: 'NK-00ff11',
      model: 'ftm',
      entityType: 'Company',
      modelVersions: ['3.5.9'],
      documentIds: ['e1f2a3b4c5d6'],
      properties: {}
    }
  }
}

// No source document, which the index does not forbid even though statements always carry one.
export const NoSourceDocument = {
  args: {
    entity: { ...entity, documentIds: [] }
  }
}
```

- [ ] **Step 2: Write the EntityCardProperties story**

Create `src/stories/components/Entity/EntityCard/EntityCardProperties.stories.js`:

```js
import { vueRouter } from 'storybook-vue3-router'

import EntityCardProperties from '@/components/Entity/EntityCard/EntityCardProperties'

const routes = [
  { path: '/', name: 'document' },
  { path: '/ds', name: 'document-standalone' },
  { path: '/project/:name', name: 'project.view' }
]

const entity = {
  entityId: 'NK-7f3a2c91',
  model: 'ftm',
  entityType: 'Person',
  modelVersions: ['3.5.9'],
  documentIds: ['e1f2a3b4c5d6'],
  properties: {
    ftm_name: ['Mr Yazmurad N Seryaev', 'Y. Seryaev'],
    ftm_country: ['Turkmenistan'],
    ftm_incorporationDate: ['1999-01-04']
  }
}

export default {
  title: 'Components/Entity/EntityCard/EntityCardProperties',
  decorators: [vueRouter(routes)],
  component: EntityCardProperties,
  tags: ['autodocs'],
  args: {
    entity,
    project: 'banana-papers',
    index: 'banana-papers',
    properties: ['name', 'entityType', 'ftm_country', 'sourceDocument', 'model', 'project']
  },
  render: (args) => ({
    components: { EntityCardProperties },
    setup: () => ({ args }),
    template: `<entity-card-properties v-bind="args" />`
  })
}

export const Default = {}

// An ontology-free label: "ftm_incorporationDate" has no mapping anywhere, so it must read as
// "Incorporation date" through the humanizing fallback.
export const UnmappedProperty = {
  args: { properties: ['name', 'ftm_incorporationDate'] }
}

// Both values of a multi-valued property have to be visible.
export const MultiValuedProperty = {
  args: { properties: ['ftm_name'] }
}
```

- [ ] **Step 3: Write the placeholder story**

Create `src/stories/components/Entity/EntityCard/EntityCardPlaceholder.stories.js`:

```js
import EntityCardPlaceholder from '@/components/Entity/EntityCard/EntityCardPlaceholder'

export default {
  title: 'Components/Entity/EntityCard/EntityCardPlaceholder',
  component: EntityCardPlaceholder,
  tags: ['autodocs'],
  args: {
    properties: ['name', 'entityType', 'sourceDocument', 'model', 'project'],
    repeat: 3
  },
  render: (args) => ({
    components: { EntityCardPlaceholder },
    setup: () => ({ args }),
    template: `<entity-card-placeholder v-bind="args" />`
  })
}

export const Default = {}
```

- [ ] **Step 4: Check the stories render**

Run: `yarn storybook`

Open `Components/Entity/EntityCard` and confirm, for each story:
- Default: every row has an icon, the name is bold, the two `ftm_name` values both show, the two
  source document ids are links.
- SparseEntity: every row except `entityType`, `model` and `project` shows the dash. Nothing
  blank, nothing `undefined`, no console error.
- UnmappedProperty: the label reads "Incorporation date".
- NoSourceDocument: the source document row shows a dash and no link.

Stop the server when done.

- [ ] **Step 5: Lint and commit**

```bash
yarn lint --fix
git add src/stories/components/Entity/EntityCard/
git commit -m "docs(entity): add the entity card stories"
```

---

## Notes for the implementer

- This repo's commit convention is `type(scope): summary ICIJ/datashare#N`. The commit messages
  in this plan carry no issue number because the epic's sub-issues do not exist yet. Append
  ` ICIJ/datashare#N` to each one if a number has been assigned by the time you commit.
- Do not run the full unit suite. Only the spec paths named in each task.
- If `CoreSetup.init().useAll()` turns out not to provide i18n with the English messages, check
  what the existing specs under `tests/unit/specs/components/Document/` do and follow that.
  Every label assertion in this plan depends on `src/lang/en.json` being loaded.
