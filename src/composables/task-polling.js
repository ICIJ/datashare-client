import { computed, toValue, toRef, onMounted, watch, useId } from 'vue'
import { random } from 'lodash'

import { usePolling } from '@/composables/polling'
import { useCore } from '@/composables/core'
import { useTaskStore } from '@/store/modules/task'

export function useTaskPolling(taskNames = []) {
  const taskStore = useTaskStore()
  const loaderId = useId()
  const { wait } = useCore()
  const { registerPollOnce } = usePolling()

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

  async function stopPendingTasks() {
    await taskStore.stopPendingTasks()
    await taskStore.getTasks(toValue(taskNames))
  }

  async function deleteDoneTasks() {
    await taskStore.deleteDoneTasks()
    await taskStore.getTasks(toValue(taskNames))
  }

  async function getTasks() {
    await taskStore.getTasks(toValue(taskNames))
    // Continue to poll task if they are pending ones
    return hasPendingTasks.value
  }

  function startPollingTasks() {
    const fn = getTasks
    const timeout = () => random(1000, 4000)
    // Execute the `getTasks` method immediately
    // and if it's true, register a poll
    return fn() && registerPollOnce({ fn, timeout })
  }

  watch(toRef(taskNames), onShotTask)
  onMounted(onShotTask)

  return { tasks, hasPendingTasks, hasDoneTasks, stopPendingTasks, deleteDoneTasks, isLoading }
}
