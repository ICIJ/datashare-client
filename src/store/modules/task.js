import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { find, property } from 'lodash'

import { apiInstance as api } from '@/api/apiInstance'
import { TASK_STATUS } from '@/enums/taskStatus'

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

  const stopPendingTasks = async ({ names = [], ...params } = {}) => {
    const name = names.join('|')
    await api.stopPendingTasks({ name, ...params })
    setTasks(tasks.value.filter(({ id }) => isPending(id)))
  }

  const relaunchBatchSearch = async (id, title, description) => {
    await api.relaunchBatchSearch(id, title, description)
  }

  const removeTask = async (id) => {
    await api.removeTask(id)
    setTasks(tasks.value.filter((task) => task.id !== id))
  }

  const removeBatchSearch = async (id) => {
    await api.removeBatchSearch(id)
    await api.removeTask(id)
  }

  const removeDoneTasks = async ({ names = [], ...params } = {}) => {
    const name = names.join('|')
    await api.removeDoneTasks({ name, ...params })
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

  const getTasks = async ({ names = [], ...params } = {}) => {
    const name = names.join('|')
    const tasks = await api.getTasks({ name, ...params })
    return setTasks(tasks)
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
    removeTask,
    removeBatchSearch,
    removeDoneTasks
  }
})
