import { computed, isRef, toValue } from 'vue'
import { useI18n } from 'vue-i18n'

export const SORT_ORDER_KEY = Object.freeze({
  ASC: 'asc',
  DESC: 'desc'
})

export const SORT_TYPE_KEY = Object.freeze({
  DEFAULT: 'default',
  ALPHA: 'alpha',
  NUMBER: 'number',
  QUANTITY: 'quantity',
  DATE: 'date'
})

export const INPUT_RADIO = 'radio'
export const INPUT_CHECKBOX = 'checkbox'

export function useViewSettings() {
  const { t } = useI18n()
  const sortByLabel = computed(() => t('viewSettings.sortBy.label'))
  const visiblePropertiesLabel = computed(() => t('viewSettings.properties'))

  function perPageLabel(titleKey) {
    return computed(() => t('viewSettings.perPage', { title: t(titleKey) }))
  }

  function fieldsToPropertiesOptions(fields) {
    return fields.map(({ text, key: value, icon, required: disabled = false }) => {
      const tText = text ?? t(`viewSettings.options.${value}`)
      return { text: tText, value, icon, disabled }
    })
  }

  function fieldsToSortByOptions(fields) {
    return fields
      .filter(field => field.sortable)
      .map((field) => {
        const sortingKey = field.sortingKey ?? field.key
        const type = field.type ?? SORT_TYPE_KEY.DEFAULT
        const options = [
          {
            text: tSortByOption(field.text, SORT_ORDER_KEY.ASC, type),
            value: [sortingKey, SORT_ORDER_KEY.ASC]
          },
          {
            text: tSortByOption(field.text, SORT_ORDER_KEY.DESC, type),
            value: [sortingKey, SORT_ORDER_KEY.DESC]
          }
        ]
        // If the field is sortable by date, we display the option in reverse so
        // "recent" is the first option (DESC) and "old" is the second option (ASC)
        return type === SORT_TYPE_KEY.DATE ? options.reverse() : options
      })
      .flat()
  }

  function tSortByOption(key, order = SORT_ORDER_KEY.ASC, type = SORT_TYPE_KEY.DEFAULT) {
    return computed(() => {
      const tName = isRef(key) ? toValue(key) : t(`viewSettings.options.${key}`)
      const tOrder = t(`viewSettings.order.${type}.${order}`)
      return t(`viewSettings.sortBy.format`, { name: tName, order: tOrder })
    })
  }

  const tLayout = {
    label: computed(() => t('viewSettings.layout.label')),
    grid: computed(() => t('viewSettings.layout.grid')),
    table: computed(() => t('viewSettings.layout.table')),
    list: computed(() => t('viewSettings.layout.list'))
  }

  return {
    fieldsToPropertiesOptions,
    fieldsToSortByOptions,
    tSortByOption,
    sortByLabel,
    visiblePropertiesLabel,
    tLayout,
    perPageLabel
  }
}
