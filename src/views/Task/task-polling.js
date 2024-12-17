import { computed, onMounted, watch } from 'vue'
import { random } from 'lodash'
import { useStore } from 'vuex'

import { usePolling } from '@/composables/polling'
import { useCore } from '@/composables/core'

export function useTaskPolling(taskNames) {
  const { wait } = useCore()
  const store = useStore()
  const { registerPollOnce } = usePolling()

  watch(
    () => taskNames.value,
    () => {
      return onShotTask()
    }
  )
  onMounted(async () => {
    return onShotTask()
  })
  const loaderId = 'load task-list tasks'
  async function onShotTask() {
    try {
      wait.start(loaderId)
      await startPollingTasks()
    } catch (e) {
      throw new Error('load task-list tasks')
    } finally {
      wait.end(loaderId)
    }
  }
  const isLoading = computed(() => {
    return wait.waiting(loaderId)
  })
  const hasDoneTasks = computed(() => {
    return store.getters['indexing/hasDoneTasks']
  })
  const hasPendingTasks = computed(() => {
    return store.getters['indexing/hasPendingTasks']
  })

  async function stopPendingTasks() {
    await store.dispatch('indexing/stopPendingTasks')
    await store.dispatch('indexing/getTasks', taskNames.value)
  }

  async function deleteDoneTasks() {
    await store.dispatch('indexing/deleteDoneTasks')
    await store.dispatch('indexing/getTasks', taskNames.value)
  }

  const tasks = computed(() => {
    return store.state.indexing.tasks
  })

  async function getTasks() {
    await store.dispatch('indexing/getTasks', taskNames.value)
    // Continue to poll task if they are pending ones
    return hasPendingTasks.value
  }

  function startPollingTasks() {
    const fn = getTasks
    const timeout = () => random(1000, 4000)
    // Register the `getTasks` for later
    registerPollOnce({ fn, timeout })
    // Execute the `getTasks` method immediately
    return fn()
  }
  return { tasks, hasPendingTasks, hasDoneTasks, stopPendingTasks, deleteDoneTasks, isLoading }
}
