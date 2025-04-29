import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useViewProperties } from '@/composables/useViewProperties'
import { SORT_TYPE_KEY, useViewSettings } from '@/composables/useViewSettings'

export function useSearchProperties() {
  const { t } = useI18n()
  const { propertyItem } = useViewProperties()
  const { fieldsToSortByOptions, fieldsToPropertiesOptions } = useViewSettings()

  const relevance = propertyItem({
    key: 'relevance',
    text: computed(() => t('documentRow.properties.relevance')),
    sortable: true,
    type: SORT_TYPE_KEY.NUMBER,
    sortingKey: '_score'
  })

  const thumbnail = propertyItem({
    icon: 'image',
    key: 'thumbnail',
    emphasis: true,
    text: computed(() => t('documentRow.properties.thumbnail'))
  })

  const title = propertyItem({
    icon: 'file-text',
    key: 'title',
    required: true,
    emphasis: true,
    sortable: true,
    sortingKey: 'titleNorm',
    type: SORT_TYPE_KEY.ALPHA,
    text: computed(() => t('documentRow.properties.title'))
  })

  const highlights = propertyItem({
    icon: 'quotes',
    key: 'highlights',
    text: computed(() => t('documentRow.properties.highlights'))
  })

  const author = propertyItem({
    icon: 'user-circle',
    key: 'author',
    text: computed(() => t('documentRow.properties.author'))
  })

  const path = propertyItem({
    icon: 'tree-structure',
    key: 'path',
    sortable: true,
    type: SORT_TYPE_KEY.ALPHA,
    text: computed(() => t('documentRow.properties.path'))
  })

  const tags = propertyItem({
    icon: 'hash',
    key: 'tags',
    text: computed(() => t('documentRow.properties.tags'))
  })

  const contentLength = propertyItem({
    icon: 'floppy-disk-back',
    key: 'contentLength',
    sortable: true,
    type: SORT_TYPE_KEY.NUMBER,
    text: computed(() => t('documentRow.properties.contentLength'))
  })

  const contentTextLength = propertyItem({
    icon: 'text-columns',
    key: 'contentTextLength',
    type: SORT_TYPE_KEY.NUMBER,
    text: computed(() => t('documentRow.properties.contentTextLength'))
  })

  const contentType = propertyItem({
    icon: 'file',
    key: 'contentType',
    text: computed(() => t('documentRow.properties.contentType'))
  })

  const creationDate = propertyItem({
    icon: 'calendar',
    key: 'creationDate',
    type: SORT_TYPE_KEY.DATE,
    sortable: true,
    sortingKey: 'metadata.tika_metadata_dcterms_created',
    text: computed(() => t('documentRow.properties.creationDate'))
  })

  const extractionDate = propertyItem({
    icon: 'calendar-plus',
    key: 'extractionDate',
    type: SORT_TYPE_KEY.DATE,
    sortable: true,
    text: computed(() => t('documentRow.properties.extractionDate'))
  })

  const extractionLevel = propertyItem({
    icon: 'paperclip',
    key: 'extractionLevel',
    text: computed(() => t('documentRow.properties.extractionLevel'))
  })

  const language = propertyItem({
    icon: 'globe-hemisphere-west',
    key: 'language',
    text: computed(() => t('documentRow.properties.language'))
  })

  const project = propertyItem({
    icon: 'circles-three-plus',
    key: 'project',
    text: computed(() => t('documentRow.properties.project'))
  })

  const numberOfPages = propertyItem({
    icon: 'files',
    key: 'numberOfPages',
    text: computed(() => t('document.numberOfPages'))
  })

  const items = {
    thumbnail,
    title,
    highlights,
    author,
    path,
    tags,
    contentLength,
    contentTextLength,
    contentType,
    creationDate,
    extractionLevel,
    language,
    project,
    numberOfPages
  }

  const fields = Object.values(items)
  const sortByOptions = fieldsToSortByOptions([relevance, ...fields, extractionDate])
  const propertiesOptions = fieldsToPropertiesOptions(fields)

  return { items, fields, propertiesOptions, sortByOptions }
}
