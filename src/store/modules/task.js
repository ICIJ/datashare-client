import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { apiInstance as api } from '@/api/apiInstance'
import { TASK_STATUS } from '@/enums/taskStatus'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref([])

  const pendingTasks = computed(() => tasks.value.filter(({ state }) => state.toLowerCase() === TASK_STATUS.RUNNING))
  const hasPendingTasks = computed(() => pendingTasks.value.length > 0)
  const hasDoneTasks = computed(() => tasks.value.length - pendingTasks.value.length > 0)

  const reset = () => {
    setTasks([])
  }

  const stopPendingTasks = async () => {
    await api.stopPendingTasks()
    setTasks(tasks.value.filter(({ state }) => state.toLowerCase() !== TASK_STATUS.RUNNING))
  }

  const stopTask = async (name) => {
    await api.stopTask(name)
    setTasks(tasks.value.filter((t) => t.name !== name))
  }

  const deleteDoneTasks = async () => {
    await api.deleteDoneTasks()
    setTasks(tasks.value.filter(({ state }) => state.toLowerCase() !== TASK_STATUS.DONE))
  }

  const getTasks = async (names = []) => {
    if (names.length) {
      // Execute the `getTasks` method for each name (we use .bind to keep the context)
      const tasksArray = await Promise.all(names.map(api.getTasks.bind(api)))
      // Since we have an array of arrays, we need to flatten it
      return setTasks(tasksArray.flat())
    }
    return setTasks(await api.getTasks())
  }

  const setTasks = (newTasks) => {
    tasks.value = newTasks
    return tasks.value
  }

  return {
    tasks,
    pendingTasks,
    hasPendingTasks,
    hasDoneTasks,
    reset,
    getTasks,
    setTasks,
    stopPendingTasks,
    stopTask,
    deleteDoneTasks
  }
})
