import { filter, flatten, remove } from 'lodash'

import { TASK_STATUS } from '@/enums/taskStatus'

export function initialState() {
  return {
    tasks: []
  }
}

export const state = initialState()
export const getters = {
  pendingTasks(state) {
    return filter(state.tasks, { state: TASK_STATUS.RUNNING })
  },
  hasPendingTasks(state, getters) {
    return getters.pendingTasks.length > 0
  },
  hasDoneTasks(state, getters) {
    return state.tasks.length - getters.pendingTasks.length > 0
  }
}
const STOP_PENDING_TASKS = 'STOP_PENDING_TASKS'
const STOP_TASK = 'STOP_TASK'
const DELETE_DONE_TASKS = 'DELETE_DONE_TASKS'
const UPDATE_TASKS = 'UPDATE_TASKS'
const RESET = 'RESET'

export const mutations = {
  [RESET](state) {
    Object.assign(state, initialState())
  },
  [STOP_PENDING_TASKS](state) {
    remove(state.tasks, (item) => item.state.toLowerCase() === TASK_STATUS.RUNNING)
  },
  [STOP_TASK](state, name) {
    remove(state.tasks, (item) => item.name === name)
  },
  [DELETE_DONE_TASKS](state) {
    remove(state.tasks, (item) => item.state.toLowerCase() === TASK_STATUS.DONE)
  },
  [UPDATE_TASKS](state, tasks) {
    state.tasks = tasks
  }
}

function actionsBuilder(api) {
  return {
    async stopPendingTasks({ commit }) {
      await api.stopPendingTasks()
      commit(STOP_PENDING_TASKS)
    },
    async stopTask({ commit }, id) {
      await api.stopTask(id)
      commit(STOP_TASK, id)
    },
    async deleteDoneTasks({ commit }) {
      await api.deleteDoneTasks()
      commit(DELETE_DONE_TASKS)
    },
    async getTasks({ commit }, taskNames) {
      try {
        if (taskNames.length === 0) {
          const tasks = await api.getTasks()
          commit(UPDATE_TASKS, tasks)
        } else {
          const tasks = await Promise.all(taskNames.map((t) => api.getTasks(t)))
          commit(UPDATE_TASKS, flatten(tasks))
        }
      } catch (_) {
        commit(UPDATE_TASKS, [])
      }
    }
  }
}

export function indexingStoreBuilder(api) {
  return {
    namespaced: true,
    state,
    getters,
    mutations,
    actions: actionsBuilder(api)
  }
}
