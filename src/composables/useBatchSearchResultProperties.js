import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useViewProperties } from '@/composables/useViewProperties'
import { SORT_TYPE_KEY, useViewSettings } from '@/composables/useViewSettings'

export function useBatchSearchResultProperties() {
  const { t } = useI18n()
  const { propertyItem } = useViewProperties()
  const { fieldsToSortByOptions, fieldsToPropertiesOptions } = useViewSettings()

  const query = propertyItem({
    icon: 'magnifying-glass',
    key: 'query',
    text: computed(() => t('task.batch-search-results.show.fields.query')),
    sortable: true,
    required: true,
    emphasis: true
  })

  const documentNumber = propertyItem({
    icon: 'ranking',
    key: 'documentNumber',
    sortingKey: 'doc_nb',
    text: computed(() => t('task.batch-search-results.show.fields.documentNumber')),
    type: SORT_TYPE_KEY.NUMBER,
    sortable: true,
    emphasis: true
  })

  const documentName = propertyItem({
    icon: 'file',
    key: 'documentName',
    text: computed(() => t('task.batch-search-results.show.fields.documentName')),
    emphasis: true
  })

  const project = propertyItem({
    icon: 'circles-three-plus',
    key: 'project',
    sortingKey: 'prj_id',
    text: computed(() => t('task.batch-search-results.show.fields.project')),
    type: SORT_TYPE_KEY.ALPHA,
    sortable: true
  })

  const contentType = propertyItem({
    icon: 'file-text',
    key: 'contentType',
    text: computed(() => t('task.batch-search-results.show.fields.contentType'))
  })

  const contentLength = propertyItem({
    icon: 'floppy-disk-back',
    key: 'contentLength',
    sortingKey: 'content_length',
    text: computed(() => t('task.batch-search-results.show.fields.contentLength')),
    type: SORT_TYPE_KEY.QUANTITY,
    sortable: true
  })

  const documentPath = propertyItem({
    icon: 'tree-structure',
    key: 'documentPath',
    sortingKey: 'doc_path',
    text: computed(() => t('task.batch-search-results.show.fields.documentPath')),
    type: SORT_TYPE_KEY.ALPHA,
    sortable: true,
    colStyle: { minWidth: 'min(400px, 100vw)' }
  })

  const creationDate = propertyItem({
    icon: 'calendar-blank',
    key: 'creationDate',
    sortingKey: 'creation_date',
    text: computed(() => t('task.batch-search-results.show.fields.creationDate')),
    type: SORT_TYPE_KEY.DATE,
    sortable: true
  })

  const items = {
    query,
    documentNumber,
    documentName,
    project,
    contentType,
    contentLength,
    documentPath,
    creationDate
  }

  const fields = Object.values(items)
  const sortByOptions = fieldsToSortByOptions(fields)
  const propertiesOptions = fieldsToPropertiesOptions(fields)

  return { items, fields, propertiesOptions, sortByOptions }
}
