import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { camelCase } from 'lodash'

import { useUrlParamsWithStore, useUrlParamWithStore } from '@/composables/useUrlParam'
import { useViewSettings, SORT_ORDER_KEY, INPUT_RADIO, INPUT_CHECKBOX } from '@/composables/useViewSettings'
import { useTaskProperties } from '@/composables/useTaskProperties'
import { useAppStore } from '@/store/modules'
import useMode from '@/composables/useMode'

export function useTaskSettings(pageName) {
  const appStore = useAppStore()
  const settingsView = camelCase(pageName)
  const { isServer } = useMode()
  const { t } = useI18n()
  const { sortByLabel, tSortByOption, perPageLabel, visiblePropertiesLabel } = useViewSettings()

  const perPage = ref({
    label: perPageLabel('task.title'),
    type: INPUT_RADIO,
    open: true,
    modelValue: useUrlParamWithStore('perPage', {
      transform: (value) => Math.max(10, parseInt(value)),
      get: () => appStore.getSettings(settingsView, 'perPage'),
      set: (perPage) => appStore.setSettings({ view: settingsView, perPage })
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

  const props = useTaskProperties(pageName)

  const items = props.items.filter((p) => isServer.value || p.key !== 'author')

  const sortBy = ref({
    label: sortByLabel,
    type: INPUT_RADIO,
    open: true,
    modelValue: useUrlParamsWithStore(['sort', 'order'], {
      get: () => appStore.getSettings(settingsView, 'orderBy'),
      set: (sort, order) => appStore.setSettings({ view: settingsView, orderBy: [sort, order] })
    }),
    options: items.reduce((acc, p) => {
      if (p.sortable) {
        const labelKey = p.sortingKey ?? p.key
        acc.push(
          { value: [p.key, SORT_ORDER_KEY.ASC], text: tSortByOption(labelKey, SORT_ORDER_KEY.ASC, p.type) },
          { value: [p.key, SORT_ORDER_KEY.DESC], text: tSortByOption(labelKey, SORT_ORDER_KEY.DESC, p.type) }
        )
      }
      return acc
    }, [])
  })

  const properties = ref({
    label: visiblePropertiesLabel,
    type: INPUT_CHECKBOX,
    open: true,
    modelValue: computed({
      get: () => appStore.getSettings(settingsView, 'properties'),
      set: (properties) => appStore.setSettings({ view: settingsView, properties })
    }),
    options: items.map((p) => ({
      value: p.key,
      icon: p.icon,
      thStyle: p.thStyle,
      colStyle: p.colStyle,
      disabled: !!p.required,
      sortable: !!p.sortable,
      emphasis: !!p.emphasis,
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
