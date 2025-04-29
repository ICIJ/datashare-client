import { computed, toValue, watch, onBeforeUnmount } from 'vue'
import { random } from 'lodash'

import { usePolling } from '@/composables/usePolling'
import { useWait } from '@/composables/useWait'
import { useTaskStore } from '@/store/modules'

export function useTaskPolling({ names = [], sortBy = [], perPage = null, page = 1, searchQuery = null } = {}) {
  const taskStore = useTaskStore()
  const { waitFor, isLoading } = useWait()
  const { unregisteredPoll, registerPollOnce } = usePolling()

  const startPollingTasksWithLoader = waitFor(() => {
    return startPollingTasks()
  })

  const hasDoneTasks = computed(() => taskStore.hasDoneTasks)
  const hasPendingTasks = computed(() => taskStore.hasPendingTasks)
  const tasks = computed(() => taskStore.tasks)
  const noTasks = computed(() => !toValue(tasks).length)

  async function stopPendingTasks() {
    await taskStore.stopPendingTasks({ names: toValue(names) })
    await getTasks()
  }

  async function removeDoneTasks() {
    await taskStore.removeDoneTasks({ names: toValue(names) })
    await getTasks()
  }

  async function getTasks() {
    await taskStore.getTasks({
      names: toValue(names),
      sort: toValue(sortBy)?.[0],
      order: toValue(sortBy)?.[1] ?? 'asc',
      // Filters can be build with arbitrary values
      'args.batchRecord.name': toValue(searchQuery),
      // The tasks API endpoint has limited support for pagination so we get all tasks at once
      size: toValue(perPage),
      from: (toValue(page) - 1) * toValue(perPage)
    })
    // Continue to poll task if they are pending ones
    return hasPendingTasks.value
  }

  async function startPollingTasks() {
    const fn = getTasks
    const timeout = () => random(1000, 4000)
    // Ensure the polling is registered before firing the first poll
    unregisteredPoll({ fn })
    // Execute the `getTasks` method immediately
    // and if it's true, register a poll
    return (await fn()) && registerPollOnce({ fn, timeout })
  }

  watch(() => [names, sortBy, searchQuery, page, perPage], startPollingTasksWithLoader, { immediate: true, deep: true })
  onBeforeUnmount(taskStore.reset)

  return { tasks, noTasks, getTasks, hasPendingTasks, hasDoneTasks, stopPendingTasks, removeDoneTasks, isLoading }
}
