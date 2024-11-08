import { computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import Fuse from 'fuse.js'
import { orderBy as orderArrayBy, property } from 'lodash'

import { useUtils } from '@/composables/utils'
import { useUrlParam, useUrlParamsWithStore, useUrlParamWithStore } from '@/composables/url-params'

export function useTaskHeader(pageName, hasAddButton, tasks) {
  const settingKey = 'task'
  const store = useStore()
  const { t } = useI18n()

  const { isServer } = useUtils()

  const toAddRoute = computed(() => {
    return !isServer.value && hasAddButton ? { name: `task.${pageName}.new` } : null
  })
  const searchQuery = useUrlParam('q', '')
  const page = useUrlParam('page', {
    transform: (value) => parseInt(value),
    initialValue: 1
  })
  const perPage = useUrlParamWithStore('perPage', {
    transform: (value) => Math.max(10, parseInt(value)),
    get: () => store.getters['app/getSettings'](settingKey, 'perPage'),
    set: (value) => store.commit('app/setSettings', { view: settingKey, perPage: parseInt(value) })
  })

  const orderBy = useUrlParamsWithStore(['sort', 'order'], {
    get: () => store.getters['app/getSettings'](settingKey, 'orderBy'),
    set: (sort, order) => store.commit('app/setSettings', { view: settingKey, orderBy: [sort, order] })
  })

  const searchPlaceholder = computed(() => t(`task.${pageName}.list.searchPlaceholder`))

  const fuse = computed(() => {
    const keys = ['name', 'id']
    const options = { shouldSort: false, keys }
    return new Fuse(tasks.value, options)
  })
  const filteredTasks = computed(() => {
    if (searchQuery.value) {
      return fuse.value.search(searchQuery.value).map(property('item'))
    }
    return tasks.value
  })
  const totalRows = computed(() => {
    return filteredTasks.value.length
  })
  const sortedTasks = computed(() => {
    const [sort, order] = orderBy.value
    return orderArrayBy(filteredTasks.value, sort, order)
  })

  const displayedTasks = computed(() => {
    const start = (page.value - 1) * perPage.value
    return sortedTasks.value?.slice(start, start + perPage.value)
  })

  return {
    toAddRoute,
    searchQuery,
    page,
    perPage,
    searchPlaceholder,
    displayedTasks,
    totalRows
  }
}
