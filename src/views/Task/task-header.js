import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Fuse from 'fuse.js'
import { orderBy as orderArrayBy, property } from 'lodash'

import { useUtils } from '@/composables/utils'
import { useUrlParam } from '@/composables/url-params'
import { useTaskProperties } from '@/views/Task/task-properties'

export function useTaskHeader(pageName, hasAddButton, tasks) {
  const { t } = useI18n()

  const { isServer } = useUtils()
  const settingKey = 'task'
  const { perPage, sortBy } = useTaskProperties(settingKey)

  const toAddRoute = computed(() => {
    return !isServer.value && hasAddButton ? { name: `task.${pageName}.new` } : null
  })
  const searchQuery = useUrlParam('q', '')
  const page = useUrlParam('page', {
    transform: (value) => parseInt(value),
    initialValue: 1
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
    const [sort, order] = sortBy.value.modelValue
    return orderArrayBy(filteredTasks.value, sort, order)
  })

  const displayedTasks = computed(() => {
    const start = (page.value - 1) * perPage.value.modelValue
    return sortedTasks.value?.slice(start, start + perPage.value.modelValue)
  })

  return {
    toAddRoute,
    searchQuery,
    page,
    perPage: perPage.value.modelValue,
    searchPlaceholder,
    displayedTasks,
    totalRows,
    sortBy
  }
}
