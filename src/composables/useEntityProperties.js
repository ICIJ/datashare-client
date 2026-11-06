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
 * How many values a card row shows before it stops and counts the rest. A property can hold any
 * number of values and an entity can be cited by hundreds of documents; without a cap one verbose
 * row pushes every other row off the card.
 */
export const MAX_VALUES = 3

/**
 * ponytail: labels for model properties are humanized from the key, because the FollowTheMoney
 * ontology is server-side only: FtmTargetModel reads the bundled defaultModel.json and exposes it
 * to Java callers, with no HTTP route. Replace this with the ontology's own labels once the
 * epic's ontology endpoint lands. This function and `item` below are the only places to change.
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
  const sortByOptions = fieldsToSortByOptions([relevance, ...fields])
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
