import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { find } from 'lodash'

import { apiInstance as api } from '@/api/apiInstance'
import { TASK_STATUS } from '@/enums/taskStatus'
import { TASK_NAME } from '@/enums/taskNames'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref([])

  const pendingTasks = computed(() => tasks.value.filter(({ state }) => state.toLowerCase() === TASK_STATUS.RUNNING))
  const hasPendingTasks = computed(() => pendingTasks.value.length > 0)
  const hasDoneTasks = computed(() => tasks.value.length - pendingTasks.value.length > 0)

  const reset = () => {
    setTasks([])
  }

  const stopTask = async (uuid) => {
    await api.stopTask(uuid)
  }
  const stopPendingTasks = async () => {
    // todo add filter on task name
    await api.stopPendingTasks()
  }
  const copyBatchSearch = async (uuid, title, description) => {
    await api.copyBatchSearch(uuid, title, description)
    await getTasks([TASK_NAME.BATCH_SEARCH])
  }
  const deleteTask = async (uuid) => {
    await api.deleteTask(uuid)
    setTasks(tasks.value.filter((task) => task.id !== uuid))
  }

  const deleteDoneTasks = async () => {
    // todo add filter on task name
    await api.deleteDoneTasks()
    setTasks(tasks.value.filter(({ state }) => state.toLowerCase() !== TASK_STATUS.DONE))
  }
  const getTask = (uuid) => {
    return find(tasks.value, ({ id }) => id === uuid)
  }
  const isRunning = (uuid) => {
    return getTask(uuid)?.state.toLowerCase() === TASK_STATUS.RUNNING
  }
  const getBatchSearchRecord = (uuid) => {
    return getTask(uuid)?.args.batchRecord
  }
  const getBatchDownloadRecord = (uuid) => {
    return getTask(uuid)?.args?.batchDownload
  }
  const getTasks = async (names = []) => {
    if (names.length) {
      // Execute the `getTasks` method for each task name
      const all = await Promise.all(names.map((name) => api.getTasks(name)))
      return setTasks(all.flat())
    }
    return setTasks(await api.getTasks())
  }

  const setTasks = (value = []) => {
    tasks.value = value
    return tasks.value
  }

  return {
    tasks,
    pendingTasks,
    hasPendingTasks,
    hasDoneTasks,
    isRunning,
    copyBatchSearch,
    reset,
    getTask,
    getBatchSearchRecord,
    getBatchDownloadRecord,
    getTasks,
    setTasks,
    stopPendingTasks,
    stopTask,
    deleteTask,
    deleteDoneTasks
  }
})
