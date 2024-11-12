import { computed, ref } from 'vue'
import { useStore } from 'vuex'

import { useUrlParamsWithStore, useUrlParamWithStore } from '@/composables/url-params'
import { useViewSettings } from '@/composables/view-settings'
import { useTaskSettings } from '@/composables/task-settings'

export function useTaskProperties(pageName) {
  const store = useStore()

  const { SORT_ORDER_KEY, SORT_TYPE_KEY, sortByLabel, tSortByOption, perPageLabel, visiblePropertiesLabel } =
    useViewSettings()
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
  const sortBy = ref({
    label: sortByLabel,
    type: 'radio',
    open: true,
    modelValue: useUrlParamsWithStore(['sort', 'order'], {
      get: () => store.getters['app/getSettings'](pageName, 'orderBy'),
      set: (sort, order) => store.commit('app/setSettings', { view: pageName, orderBy: [sort, order] })
    }),
    options: [
      {
        value: ['name', 'asc'],
        text: tSortByOption('name', SORT_ORDER_KEY.ASC, SORT_TYPE_KEY.ALPHA)
      },
      {
        value: ['name', 'desc'],
        text: tSortByOption('name', SORT_ORDER_KEY.DESC, SORT_TYPE_KEY.ALPHA)
      },
      {
        value: ['id', 'asc'],
        text: tSortByOption('id', SORT_ORDER_KEY.ASC)
      },
      {
        value: ['id', 'desc'],
        text: tSortByOption('id', SORT_ORDER_KEY.DESC)
      },
      {
        value: ['progress', 'asc'],
        text: tSortByOption('progress', SORT_ORDER_KEY.ASC, SORT_TYPE_KEY.QUANTITY)
      },
      {
        value: ['progress', 'desc'],
        text: tSortByOption('progress', SORT_ORDER_KEY.DESC, SORT_TYPE_KEY.QUANTITY)
      },
      {
        value: ['creationDate', 'asc'],
        text: tSortByOption('creationDate', SORT_ORDER_KEY.ASC, SORT_TYPE_KEY.DATE)
      },
      {
        value: ['creationDate', 'desc'],
        text: tSortByOption('creationDate', SORT_ORDER_KEY.DESC, SORT_TYPE_KEY.DATE)
      }
    ]
  })

  const { propertiesOrder, propertiesLabel, propertiesIcon } = useTaskSettings()

  const properties = ref({
    label: visiblePropertiesLabel,
    type: 'checkbox',
    open: true,
    modelValue: computed({
      get: () => store.getters['app/getSettings'](pageName, 'properties'),
      set: (properties) => store.commit('app/setSettings', { view: pageName, properties })
    }),
    options: computed(() => {
      return propertiesOrder.map((value) => {
        const text = propertiesLabel.value[value]
        const icon = propertiesIcon[value]
        return { value, icon, text }
      })
    })
  })
  const fields = computed(() => {
    return [{ key: 'state' }]
  })

  return {
    fields,
    sortBy,
    properties,
    perPage
  }
}
