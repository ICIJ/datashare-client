import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import IPhMagnifyingGlass from '~icons/ph/magnifying-glass'
import IPhFiles from '~icons/ph/files'

import { useViewProperties } from '@/composables/useViewProperties'
import { SORT_TYPE_KEY, useViewSettings } from '@/composables/useViewSettings'

export function useBatchSearchQueryProperties() {
  const { t } = useI18n()
  const { propertyItem } = useViewProperties()
  const { fieldsToSortByOptions, fieldsToPropertiesOptions } = useViewSettings()

  const queryNumber = propertyItem({
    key: 'queryNumber',
    sortingKey: 'query_number',
    text: computed(() => t('task.batch-search-queries.list.fields.queryNumber')),
    type: SORT_TYPE_KEY.NUMBER,
    sortable: true,
    emphasis: true
  })

  const query = propertyItem({
    icon: IPhMagnifyingGlass,
    key: 'query',
    text: computed(() => t('task.batch-search-queries.list.fields.query')),
    required: true,
    sortable: true,
    emphasis: true
  })

  const count = propertyItem({
    icon: IPhFiles,
    key: 'count',
    sortingKey: 'query_results',
    text: computed(() => t('task.batch-search-queries.list.fields.count')),
    type: SORT_TYPE_KEY.NUMBER,
    sortable: true,
    emphasis: true
  })

  const items = {
    queryNumber,
    query,
    count
  }

  const fields = Object.values(items)
  const sortByOptions = fieldsToSortByOptions(fields)
  const propertiesOptions = fieldsToPropertiesOptions(fields)

  return { items, fields, propertiesOptions, sortByOptions }
}
