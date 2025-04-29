import { computed, toValue } from 'vue'
import { useI18n } from 'vue-i18n'

import { useUrlParam } from '@/composables/url-params'
import { useTaskSettings } from '@/composables/task-settings'
import { useTaskStore } from '@/store/modules'

export function useTaskHeader(pageName) {
  const { t } = useI18n()
  const { perPage, sortBy } = useTaskSettings(pageName)
  const taskStore = useTaskStore()

  const toAddRoute = computed(() => {
    return { name: `task.${pageName}.new` }
  })

  const searchQuery = useUrlParam('q', '')

  const page = useUrlParam('page', {
    transform: (value) => parseInt(value),
    initialValue: 1
  })

  const searchPlaceholder = computed(() => t(`task.${pageName}.list.searchPlaceholder`))

  const totalRows = computed(() => {
    return toValue(taskStore.tasks ?? []).length
  })

  const tasks = computed(() => {
    const from = (page.value - 1) * toValue(perPage).modelValue
    const to = +toValue(perPage).modelValue + from
    return toValue(taskStore.tasks).slice(from, to)
  })

  return {
    toAddRoute,
    searchQuery,
    searchPlaceholder,
    tasks,
    totalRows,
    page,
    perPage: computed({
      get: () => perPage.value.modelValue,
      set: (value) => (perPage.value.modelValue = value)
    }),
    sortBy: computed({
      get: () => sortBy.value.modelValue,
      set: (value) => (sortBy.value.modelValue = value)
    })
  }
}
