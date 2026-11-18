import { computed, toValue, watch, onBeforeUnmount } from 'vue'
import isEqual from 'lodash/isEqual'
import random from 'lodash/random'
import { usePolling } from '@/composables/usePolling'
import { useWait } from '@/composables/useWait'
import { useTaskStore } from '@/store/modules'

export function useTaskPolling({ types = [], sortBy = [], perPage = null, page = 1, searchQuery = null } = {}) {
  const taskStore = useTaskStore()
  const { waitFor, isLoading } = useWait()
  const { unregisteredPoll, registerPollOnce } = usePolling()

  const startPollingTasksWithLoader = waitFor(() => {
    return startPollingTasks()
  })

  const hasDoneTasks = computed(() => taskStore.hasDoneTasks)
  const hasPendingTasks = computed(() => taskStore.hasPendingTasks)
  const hasRunningTasks = computed(() => taskStore.hasRunningTasks)
  const tasks = computed(() => taskStore.tasks)
  const noTasks = computed(() => !toValue(tasks).length)

  async function stopPendingTasks() {
    await taskStore.stopPendingTasks({ types: toValue(types) })
    await fetchTasks()
  }

  async function removeDoneTasks() {
    await taskStore.removeDoneTasks({ types: toValue(types) })
    await fetchTasks()
  }

  function getParams() {
    const query = toValue(searchQuery)
    return {
      types: [...toValue(types)],
      sort: toValue(sortBy)?.[0],
      order: toValue(sortBy)?.[1] ?? 'asc',
      // Only include the search filter when query is non-empty to avoid
      // sending an invalid pattern to the backend (which treats it as regex)
      ...(query ? { 'args.batchRecord.name': query } : {}),
      // The tasks API endpoint has limited support for pagination so we get all tasks at once
      size: toValue(perPage),
      from: (toValue(page) - 1) * toValue(perPage)
    }
  }

  async function fetchTasks() {
    await taskStore.fetchTasks(getParams())
    // Continue to poll task if they are pending ones
    return hasPendingTasks.value || hasRunningTasks.value
  }

  async function startPollingTasks() {
    const fn = fetchTasks
    const timeout = () => random(1000, 4000)
    // Ensure the polling is registered before firing the first poll
    unregisteredPoll({ fn })
    // Execute the `fetchTasks` method immediately
    // and if it's true, register a poll
    try {
      return (await fn()) && registerPollOnce({ fn, timeout })
    }
    catch (error) {
      registerPollOnce({ fn, timeout })
      throw error
    }
  }

  // Sources such as `useUrlParamsWithStore` change identity on unrelated route updates, so
  // only restart the polling (and show the loader) when the request itself changes.
  watch(getParams, (params, oldParams) => isEqual(params, oldParams) || startPollingTasksWithLoader(), { immediate: true })
  onBeforeUnmount(taskStore.reset)

  return { tasks, noTasks, fetchTasks, startPollingTasks, hasPendingTasks, hasRunningTasks, hasDoneTasks, stopPendingTasks, removeDoneTasks, isLoading }
}
