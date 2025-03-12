import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useViewProperties } from '@/composables/view-properties'
import { SORT_TYPE_KEY, useViewSettings } from '@/composables/view-settings'

export function useBatchSearchQueryProperties() {
  const { t } = useI18n()
  const { propertyItem } = useViewProperties()
  const { fieldsToSortByOptions, fieldsToPropertiesOptions } = useViewSettings()

  const query = propertyItem({
    icon: 'magnifying-glass',
    key: 'query',
    text: computed(() => t('task.batch-search-queries.list.fields.query')),
    sortable: false, // Disabled until the API supports `sort` and `order` params
    emphasis: true
  })

  const count = propertyItem({
    icon: 'files',
    key: 'count',
    sortingKey: 'doc_nb',
    text: computed(() => t('task.batch-search-queries.list.fields.count')),
    type: SORT_TYPE_KEY.NUMBER,
    sortable: false, // Disabled until the API supports `sort` and `order` params
    emphasis: true
  })

  const items = {
    query,
    count
  }

  const fields = Object.values(items)
  const sortByOptions = fieldsToSortByOptions(fields)
  const propertiesOptions = fieldsToPropertiesOptions(fields)

  return { items, fields, propertiesOptions, sortByOptions }
}
