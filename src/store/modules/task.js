import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { find, property } from 'lodash'

import { apiInstance as api } from '@/api/apiInstance'
import { TASK_STATUS } from '@/enums/taskStatus'
import { TASK_NAME } from '@/enums/taskNames'

export const useTaskStore = defineStore('task', () => {
  const DEFAULT_PAGINATION = { count: 0, size: 0, from: 0, total: 0 }

  const tasks = ref([])
  const pagination = ref(DEFAULT_PAGINATION)

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
    // For retrocompatibility, batch search tasks can be proxified as TASK_STATUS.BATCH_SEARCH_PROXY
    // which create task on the fly in the backend so legacy batch search tasks are available in the
    // same API endpoint. Therefore those "proxy" batch search has no real task.
    if (getTask(id)?.name === TASK_NAME.BATCH_SEARCH) {
      await api.removeTask(id)
    }
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
    return getTask(id)?.args?.batchRecord ?? {}
  }

  const getBatchDownloadRecord = (id) => {
    return getTask(id)?.args?.batchDownload ?? {}
  }

  const fetchTasks = async ({ names = [], ...params } = {}) => {
    const name = names.join('|')
    const { items: tasks, pagination } = await api.getTasks({ name, ...params })    
    return setTasks(tasks, pagination)
  }

  const fetchTask = async (id) => {
    const task = await api.getTask(id)
    tasks.value.push(task)
    return task
  }

  const setTasks = (items = [], itemsPagination = DEFAULT_PAGINATION) => {
    tasks.value = items
    pagination.value = { ...DEFAULT_PAGINATION, ...itemsPagination }
    return tasks.value
  }

  return {
    tasks,
    pagination,
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
    fetchTasks,
    fetchTask,
    setTasks,
    stopPendingTasks,
    stopTask,
    removeTask,
    removeBatchSearch,
    removeDoneTasks
  }
})
