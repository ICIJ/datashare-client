import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { find, property } from 'lodash'

import { apiInstance as api } from '@/api/apiInstance'
import { TASK_STATUS } from '@/enums/taskStatus'
import { TASK_NAME } from '@/enums/taskNames'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref([])

  const pendingTasks = computed(() => tasks.value.map(property('id')).filter(isPending))
  const hasPendingTasks = computed(() => pendingTasks.value.length > 0)
  const hasDoneTasks = computed(() => tasks.value.length - pendingTasks.value.length > 0)

  const reset = () => {
    setTasks([])
  }

  const stopTask = async (id) => {
    await api.stopTask(id)
  }

  const stopPendingTasks = async () => {
    await api.stopPendingTasks()
  }

  const relaunchBatchSearch = async (id, title, description) => {
    await api.relaunchBatchSearch(id, title, description)
    await getTasks([TASK_NAME.BATCH_SEARCH])
  }

  const deleteTask = async (id) => {
    await api.deleteTask(id)
    setTasks(tasks.value.filter((task) => task.id !== id))
  }

  const deleteBatchSearch = async (id) => {
    await api.deleteBatchSearch(id)
    await api.deleteTask(id)
  }

  const deleteDoneTasks = async () => {
    await api.deleteDoneTasks()
    setTasks(tasks.value.filter(({ id }) => isDone(id)))
  }

  const getTask = (id) => {
    return find(tasks.value, { id })
  }

  const getTaskState = (id) => {
    return getTask(id)?.state.toLowerCase()
  }

  const isPending = (id) => {
    return isQueued(id) || isRunning(id)
  }

  const isRunning = (id) => {
    return getTaskState(id) === TASK_STATUS.RUNNING
  }

  const isQueued = (id) => {
    return getTaskState(id) === TASK_STATUS.QUEUED
  }

  const isOver = (id) => {
    return !isRunning(id) && !isQueued(id)
  }

  const isDone = (id) => {
    return getTaskState(id) === TASK_STATUS.DONE
  }

  const getBatchSearchRecord = (id) => {
    return getTask(id)?.args?.batchRecord
  }

  const getBatchDownloadRecord = (id) => {
    return getTask(id)?.args?.batchDownload
  }

  const getTasks = async (names = []) => {
    if (names.length) {
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
    isPending,
    isRunning,
    isQueued,
    isOver,
    relaunchBatchSearch,
    reset,
    getTask,
    getBatchSearchRecord,
    getBatchDownloadRecord,
    getTasks,
    setTasks,
    stopPendingTasks,
    stopTask,
    deleteTask,
    deleteBatchSearch,
    deleteDoneTasks
  }
})
