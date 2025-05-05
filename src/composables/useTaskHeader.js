import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useUrlParam } from '@/composables/useUrlParam'
import { useTaskSettings } from '@/composables/useTaskSettings'
import { useTaskStore } from '@/store/modules'

export function useTaskHeader(pageName) {
  const { t } = useI18n()
  const { perPage, sortBy } = useTaskSettings(pageName)
  const taskStore = useTaskStore()

  const addToRoute = computed(() => ({ name: `task.${pageName}.new` }))
  const addLabel = computed(() => t(`task.${pageName}.new.title`))

  const searchQuery = useUrlParam('q', '')
  const searchPlaceholder = computed(() => t(`task.${pageName}.list.searchPlaceholder`))

  const page = useUrlParam('page', {
    transform: (value) => parseInt(value),
    initialValue: 1
  })

  const totalRows = computed(() => taskStore?.pagination?.total ?? 0)
  const tasks = computed(() => taskStore.tasks)

  return {
    addToRoute,
    addLabel,
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
