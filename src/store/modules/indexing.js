import { filter, remove, sortBy } from 'lodash'

import { TASK_STATUS } from '@/enums/taskStatus'

export function initialState() {
  return {
    form: {
      filter: true,
      language: null,
      ocr: false,
      offline: false,
      path: null,
      defaultProject: null,
      pipeline: 'CORENLP'
    },
    tasks: []
  }
}

export const state = initialState()
export const getters = {
  sortedTasks(state) {
    // Move running tasks on top
    const states = [TASK_STATUS.RUNNING]
    return sortBy(state.tasks, ({ state }) => -states.indexOf(state))
  },
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
export const mutations = {
  reset(state) {
    Object.assign(state, initialState())
  },
  stopPendingTasks(state) {
    remove(state.tasks, (item) => item.state === 'RUNNING')
  },
  stopTask(state, name) {
    remove(state.tasks, (item) => item.name === name)
  },
  deleteDoneTasks(state) {
    remove(state.tasks, (item) => item.state === 'DONE')
  },
  updateTasks(state, tasks) {
    state.tasks = tasks
  },
  resetExtractForm(state) {
    state.form.ocr = initialState().form.ocr
    state.form.language = initialState().form.language
    state.form.filter = initialState().form.filter
    state.form.path = initialState().form.path
  },
  resetFindNamedEntitiesForm(state) {
    state.form.pipeline = initialState().form.pipeline
    state.form.offline = initialState().form.offline
  },
  formOcr(state, value) {
    state.form.ocr = value
  },
  formFilter(state, value) {
    state.form.filter = value
  },
  formPath(state, value) {
    state.form.path = value
  },
  formLanguage(state, value) {
    state.form.language = value
  },
  formDefaultProject(state, value) {
    state.form.defaultProject = value
  },
  formPipeline(state, value) {
    state.form.pipeline = value
  },
  formOffline(state, value) {
    state.form.offline = value
  }
}

function actionsBuilder(api) {
  return {
    submitExtract({ state }) {
      if (state.form.path) {
        return api.indexPath(state.form.path, state.form)
      }
      return api.index(state.form)
    },
    submitFindNamedEntities({ state }) {
      const defaultProject = state.form.defaultProject ?? null
      const options = { syncModels: !state.form.offline, defaultProject }
      return api.findNames(state.form.pipeline, options)
    },
    async stopPendingTasks({ commit }) {
      try {
        await api.stopPendingTasks()
        return commit('stopPendingTasks')
      } catch (_) {}
    },
    async stopTask({ commit }, name) {
      try {
        await api.stopTask(name)
        commit('stopTask', name)
      } catch (_) {}
    },
    async deleteDoneTasks({ commit }) {
      try {
        await api.deleteDoneTasks()
        commit('deleteDoneTasks')
      } catch (_) {}
    },
    async getTasks({ commit }) {
      try {
        const tasks = await api.getTasks()
        commit('updateTasks', tasks)
      } catch (_) {
        commit('updateTasks', [])
      }
    },
    async deleteAll() {
      await api.deleteAll()
    },
    getNerPipelines() {
      return api.getNerPipelines()
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
