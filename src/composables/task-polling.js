import { computed, toValue, watch, useId, onBeforeUnmount } from 'vue'
import { random } from 'lodash'

import { usePolling } from '@/composables/polling'
import { useCore } from '@/composables/core'
import { useTaskStore } from '@/store/modules'

export function useTaskPolling({ names = [], sortBy = [], searchQuery = null } = {}) {
  const taskStore = useTaskStore()
  const loaderId = useId()
  const { wait } = useCore()
  const { unregisteredPoll, registerPollOnce } = usePolling()

  async function onShotTask() {
    try {
      wait.start(loaderId)
      await startPollingTasks()
    } finally {
      wait.end(loaderId)
    }
  }

  const isLoading = computed(() => wait.waiting(loaderId))
  const hasDoneTasks = computed(() => taskStore.hasDoneTasks)
  const hasPendingTasks = computed(() => taskStore.hasPendingTasks)
  const tasks = computed(() => taskStore.tasks)
  const noTasks = computed(() => !toValue(tasks).length)

  async function stopPendingTasks() {
    await taskStore.stopPendingTasks()
    await getTasks()
  }

  async function removeDoneTasks() {
    await taskStore.removeDoneTasks()
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
      size: null,
      from: 0
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

  watch(() => [names, sortBy, searchQuery], onShotTask, { immediate: true, deep: true })
  onBeforeUnmount(taskStore.reset)

  return { tasks, noTasks, getTasks, hasPendingTasks, hasDoneTasks, stopPendingTasks, removeDoneTasks, isLoading }
}
