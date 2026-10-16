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
  return [].concat(values).filter(value => value !== null && value !== undefined && value !== '')
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
