import { computed, toValue } from 'vue'
import Fuse from 'fuse.js'
import { orderBy as orderArrayBy, property } from 'lodash'
import { useI18n } from 'vue-i18n'

import { useUrlParam } from '@/composables/url-params'
import { useTaskSettings } from '@/composables/task-settings'
import useMode from '@/composables/mode'

export function useTaskHeader(pageName, hasAddButton, tasks) {
  const { t } = useI18n()
  const { isServer } = useMode()
  const settingKey = 'task'
  const { perPage, sortBy } = useTaskSettings(settingKey)

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
    return new Fuse(toValue(tasks), options)
  })

  const filteredTasks = computed(() => {
    if (searchQuery.value) {
      return fuse.value.search(searchQuery.value).map(property('item'))
    }
    return toValue(tasks)
  })

  const totalRows = computed(() => {
    return toValue(filteredTasks).length
  })

  const sortedTasks = computed(() => {
    const [sort, order] = toValue(sortBy).modelValue
    return orderArrayBy(toValue(filteredTasks), sort, order)
  })

  const displayedTasks = computed(() => {
    const start = (page.value - 1) * toValue(perPage).modelValue
    return sortedTasks.value?.slice(start, start + toValue(perPage).modelValue)
  })

  const noTasks = computed(() => {
    return toValue(tasks).length === 0
  })

  return {
    toAddRoute,
    searchQuery,
    page,
    perPage: perPage.value.modelValue,
    searchPlaceholder,
    displayedTasks,
    noTasks,
    totalRows,
    sortBy
  }
}
