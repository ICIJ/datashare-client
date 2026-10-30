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
import { useStructuredEntityModelStore } from '@/store/modules/structuredEntityModel'
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
 * How many values a card row shows before it stops and counts the rest. A property can hold any
 * number of values and an entity can be cited by hundreds of documents; without a cap one verbose
 * row pushes every other row off the card.
 */
export const MAX_VALUES = 3

/**
 * The fallback label, used when the ontology has nothing to say about a key: an older backend with
 * no /api/models route, a failed fetch, or a type the fetched model does not carry. It mangles
 * acronyms (`ftm_vatCode` reads "Vat code"), which is why it is the fallback and not the rule.
 */
export function humanizePropertyKey(key) {
  const [, ...rest] = (key ?? '').split(NAMESPACE_SEPARATOR)
  const bare = rest.length ? rest.join(NAMESPACE_SEPARATOR) : (key ?? '')
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
  // Own keys only, and never the containers themselves. A bare `?? entity?.[key]` would hand back
  // the properties bag for `properties`, the whole analyzed blob for `propertiesAll`, and
  // Object.prototype members for `constructor` or `toString`, each of which renders as garbage in
  // a card row. The settings list is hard-coded today but the spec plans to drive it from an
  // index aggregation, so the key reaching here will eventually come from data.
  const values = own(entity?.properties, key) ? entity.properties[key] : rootValues(entity, key)
  return [].concat(values).filter(value => typeof value === 'string' && value !== '')
}

// Fields the entity carries at its root that a card may legitimately render. `properties` and
// `propertiesAll` are containers, not values, so they are not here.
const ROOT_KEYS = Object.freeze([...Object.values(ENTITY_FIELD), 'entityId', 'documentIds', 'modelVersions'])

function own(object, key) {
  return object !== null && typeof object === 'object' && Object.hasOwn(object, key)
}

function rootValues(entity, key) {
  return ROOT_KEYS.includes(key) && own(entity, key) ? entity[key] : []
}

/** The index key a bare ontology property name is stored under: `birthDate` -> `ftm_birthDate`. */
function namespaced(entity, property) {
  return [entity?.model, property].join(NAMESPACE_SEPARATOR)
}

/**
 * The bare property a type captions this entity on: the first of its ordered caption candidates
 * that actually holds a value. `null` when none does.
 */
function captionProperty(entity, type) {
  const candidates = type?.caption?.length ? type.caption : ['name']
  return candidates.find(property => entityPropertyValues(entity, namespaced(entity, property)).length) ?? null
}

/**
 * How an entity is named on screen: the value of its caption property, else the entity id.
 *
 * The type defaults to the ontology's own, so no component has to reach into the store to caption
 * an entity. It is resolved per call rather than captured, which keeps a caller inside a computed
 * reactive to the ontology arriving late.
 */
export function entityCaption(entity, type = undefined) {
  const resolved = type === undefined ? useStructuredEntityModelStore().type(entity?.entityType) : type
  const property = captionProperty(entity, resolved)
  const [value] = property ? entityPropertyValues(entity, namespaced(entity, property)) : []
  return value ?? entity?.entityId ?? ''
}

/**
 * The label for a namespaced property key, from the ontology when it knows the type and the
 * property, and humanized from the key when it does not.
 */
export function propertyLabel(entityType, key) {
  const type = useStructuredEntityModelStore().type(entityType)
  const [, ...rest] = (key ?? '').split(NAMESPACE_SEPARATOR)
  const bare = rest.join(NAMESPACE_SEPARATOR)
  return type?.properties?.[bare]?.label ?? humanizePropertyKey(key)
}

// Rows every card shows whatever its schema, appended after the featured ones. None of them is an
// ontology property: they describe the entity's place in Datashare, not the thing it models.
const DATASHARE_ROWS = Object.freeze([
  ENTITY_FIELD.SOURCE_DOCUMENT,
  ENTITY_FIELD.MODEL,
  ENTITY_FIELD.PROJECT
])

/**
 * The ordered row keys a card renders for this entity: the caption, then its schema's featured
 * properties, then the Datashare-level rows.
 *
 * Two exclusions. A stub property is inferred from a relation rather than written, so it holds no
 * values and would render an empty row. The one property the caption actually used would print
 * the same text twice, since `featured` opens with a caption candidate for most schemata.
 */
export function featuredProperties(entity) {
  const type = useStructuredEntityModelStore().type(entity?.entityType)
  // Only the property the caption actually used, not every candidate. On the live Address,
  // `full` and `city` are both candidates, so excluding all of them hid the city even when it
  // held the only value the entity had.
  const captioned = captionProperty(entity, type)
  const featured = (type?.featured ?? [])
    .filter(property => property !== captioned)
    .filter(property => !type?.properties?.[property]?.stub)
    .map(property => namespaced(entity, property))
  // The schema row sits right after the caption: the featured rows below it differ per schema, so
  // without it two cards in one list look different for no visible reason.
  return [ENTITY_FIELD.NAME, ENTITY_FIELD.ENTITY_TYPE, ...featured, ...DATASHARE_ROWS]
}

export function useEntityProperties() {
  const { t } = useI18n()
  const { propertyItem } = useViewProperties()
  const { fieldsToSortByOptions, fieldsToPropertiesOptions } = useViewSettings()

  // Sorts on entityId, not on a name property: the caption is resolved client side from whichever
  // property the schema captions on, so there is no single indexed field behind it.
  const name = propertyItem({
    icon: IPhIdentificationCard,
    key: ENTITY_FIELD.NAME,
    required: true,
    emphasis: true,
    sortable: true,
    sortingKey: 'entityId',
    type: SORT_TYPE_KEY.ALPHA,
    text: computed(() => t('entityCard.properties.name'))
  })

  // A sort option only, never a card row, which is why it stays out of `items`.
  const relevance = propertyItem({
    key: 'relevance',
    sortable: true,
    sortingKey: '_score',
    type: SORT_TYPE_KEY.NUMBER,
    text: computed(() => t('entityCard.properties.relevance'))
  })

  const entityType = propertyItem({
    icon: IPhStack,
    key: ENTITY_FIELD.ENTITY_TYPE,
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
    text: computed(() => t('entityCard.properties.model'))
  })

  const project = propertyItem({
    icon: IPhCirclesThreePlus,
    key: ENTITY_FIELD.PROJECT,
    text: computed(() => t('entityCard.properties.project'))
  })

  const items = { name, entityType, sourceDocument, model, project }
  const fields = Object.values(items)
  // Lazy: only the settings panel reads these, while every card row calls this composable for
  // `item` alone. Building them eagerly made a row cost the whole options list, which a page of
  // cards pays once per row.
  const sortByOptions = computed(() => fieldsToSortByOptions([relevance, ...fields]))
  const propertiesOptions = computed(() => fieldsToPropertiesOptions(fields))

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
