import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

import { useUrlParamsWithStore, useUrlParamWithStore } from '@/composables/url-params'
import { useViewSettings } from '@/composables/view-settings'
import { useTaskProperties } from '@/composables/task-properties'

export function useTaskSettings(pageName) {
  const store = useStore()
  const { t } = useI18n()

  const { SORT_ORDER_KEY, sortByLabel, tSortByOption, perPageLabel, visiblePropertiesLabel } = useViewSettings()

  const perPage = ref({
    label: perPageLabel('task.title'),
    type: 'radio',
    open: true,
    modelValue: useUrlParamWithStore('perPage', {
      transform: (value) => Math.max(10, parseInt(value)),
      get: () => store.getters['app/getSettings'](pageName, 'perPage'),
      set: (perPage) => store.commit('app/setSettings', { view: pageName, perPage })
    }),
    options: [
      {
        value: 10
      },
      {
        value: 25
      },
      {
        value: 50
      },
      {
        value: 100
      }
    ]
  })
  const vals = store.getters['app/getSettings'](pageName, 'properties')
  const { items } = useTaskProperties(vals)

  const sortBy = ref({
    label: sortByLabel,
    type: 'radio',
    open: true,
    modelValue: useUrlParamsWithStore(['sort', 'order'], {
      get: () => store.getters['app/getSettings'](pageName, 'orderBy'),
      set: (sort, order) => store.commit('app/setSettings', { view: pageName, orderBy: [sort, order] })
    }),
    options: items.reduce((acc, p) => {
      if (p.sortable) {
        const labelKey = p.sortingKey ?? p.key
        acc.push(
          { value: [p.key, SORT_ORDER_KEY.ASC], text: tSortByOption(labelKey, SORT_ORDER_KEY.ASC, p.sortType) },
          { value: [p.key, SORT_ORDER_KEY.DESC], text: tSortByOption(labelKey, SORT_ORDER_KEY.DESC, p.sortType) }
        )
      }
      return acc
    }, [])
  })

  const properties = ref({
    label: visiblePropertiesLabel,
    type: 'checkbox',
    open: true,
    modelValue: computed({
      get: () => store.getters['app/getSettings'](pageName, 'properties'),
      set: (properties) => store.commit('app/setSettings', { view: pageName, properties })
    }),
    options: items.map((p) => ({
      value: p.key,
      icon: p.icon,
      disabled: p.required,
      text: computed(() => t(`task.${pageName}.list.properties.${p.key}`))
    }))
  })

  const propertiesModelValueOptions = computed(() => {
    return properties.value.options.filter((p) => properties.value.modelValue.includes(p.value))
  })

  return {
    sortBy,
    properties,
    propertiesModelValueOptions,
    perPage
  }
}
