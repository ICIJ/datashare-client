import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
const SORT_ORDER_KEY = Object.freeze({
  ASC: 'asc',
  DESC: 'desc'
})

const SORT_TYPE_KEY = Object.freeze({
  DEFAULT: 'default',
  ALPHA: 'alpha',
  NUMBER: 'number',
  QUANTITY: 'quantity',
  DATE: 'date'
})

export function useViewSettings() {
  const { t } = useI18n()
  const sortByLabel = computed(() => t('viewSettings.sortBy.label'))
  const visiblePropertiesLabel = computed(() => t('viewSettings.properties'))

  function tSortByOption(name, order = SORT_ORDER_KEY.ASC, type = SORT_TYPE_KEY.DEFAULT) {
    return computed(() =>
      t(`viewSettings.sortBy.format`, {
        name: t(`viewSettings.options.${name}`),
        order: t(`viewSettings.order.${type}.${order}`)
      })
    )
  }
  const tLayout = {
    label: computed((_) => t('viewSettings.view.label')),
    grid: computed((_) => t('viewSettings.view.grid')),
    table: computed((_) => t('viewSettings.view.table'))
  }
  const perPageLabel = (titleKey) => computed((_) => t('viewSettings.perPage', { title: t(titleKey) }))
  return { SORT_ORDER_KEY, SORT_TYPE_KEY, tSortByOption, sortByLabel, visiblePropertiesLabel, tLayout, perPageLabel }
}
