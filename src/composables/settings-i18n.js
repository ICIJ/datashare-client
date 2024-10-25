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

export function useSettingsI18n() {
  const { t } = useI18n()
  const sortByLabel = computed(() => t('settingsI18n.sortBy.label'))

  function tSortByOption(name, order = SORT_ORDER_KEY.ASC, type = SORT_TYPE_KEY.DEFAULT) {
    return computed(() =>
      t(`settingsI18n.sortBy.format`, {
        name: t(`settingsI18n.options.${name}`),
        order: t(`settingsI18n.order.${type}.${order}`)
      })
    )
  }
  const tLayout = {
    label: computed((_) => t('settingsI18n.view.label')),
    grid: computed((_) => t('settingsI18n.view.grid')),
    table: computed((_) => t('settingsI18n.view.table'))
  }
  const perPageLabel = (titleKey) => computed((_) => t('settingsI18n.perPage', { title: t(titleKey) }))
  return { SORT_ORDER_KEY, SORT_TYPE_KEY, tSortByOption, sortByLabel, tLayout, perPageLabel }
}
