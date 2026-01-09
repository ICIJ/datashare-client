import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import IPhMagnifyingGlass from '~icons/ph/magnifying-glass'
import IPhRanking from '~icons/ph/ranking'
import IPhFile from '~icons/ph/file'
import IPhCirclesThreePlus from '~icons/ph/circles-three-plus'
import IPhFileText from '~icons/ph/file-text'
import IPhFloppyDiskBack from '~icons/ph/floppy-disk-back'
import IPhTreeStructure from '~icons/ph/tree-structure'
import IPhCalendarBlank from '~icons/ph/calendar-blank'

import { useViewProperties } from '@/composables/useViewProperties'
import { SORT_TYPE_KEY, useViewSettings } from '@/composables/useViewSettings'

export function useBatchSearchResultProperties() {
  const { t } = useI18n()
  const { propertyItem } = useViewProperties()
  const { fieldsToSortByOptions, fieldsToPropertiesOptions } = useViewSettings()

  const query = propertyItem({
    icon: IPhMagnifyingGlass,
    key: 'query',
    text: computed(() => t('task.batch-search-results.show.fields.query')),
    sortable: true,
    required: true,
    emphasis: true
  })

  const documentNumber = propertyItem({
    icon: IPhRanking,
    key: 'documentNumber',
    sortingKey: 'doc_nb',
    text: computed(() => t('task.batch-search-results.show.fields.documentNumber')),
    type: SORT_TYPE_KEY.NUMBER,
    sortable: true,
    emphasis: true
  })

  const documentName = propertyItem({
    icon: IPhFile,
    key: 'documentName',
    text: computed(() => t('task.batch-search-results.show.fields.documentName')),
    emphasis: true
  })

  const project = propertyItem({
    icon: IPhCirclesThreePlus,
    key: 'project',
    sortingKey: 'prj_id',
    text: computed(() => t('task.batch-search-results.show.fields.project')),
    type: SORT_TYPE_KEY.ALPHA,
    sortable: true
  })

  const contentType = propertyItem({
    icon: IPhFileText,
    key: 'contentType',
    text: computed(() => t('task.batch-search-results.show.fields.contentType'))
  })

  const contentLength = propertyItem({
    icon: IPhFloppyDiskBack,
    key: 'contentLength',
    sortingKey: 'content_length',
    text: computed(() => t('task.batch-search-results.show.fields.contentLength')),
    type: SORT_TYPE_KEY.QUANTITY,
    sortable: true
  })

  const documentPath = propertyItem({
    icon: IPhTreeStructure,
    key: 'documentPath',
    sortingKey: 'doc_path',
    text: computed(() => t('task.batch-search-results.show.fields.documentPath')),
    type: SORT_TYPE_KEY.ALPHA,
    sortable: true,
    colStyle: { minWidth: 'min(400px, 100vw)' }
  })

  const creationDate = propertyItem({
    icon: IPhCalendarBlank,
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
