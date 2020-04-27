import { remove } from 'lodash'
import { getField, updateField } from 'vuex-map-fields'

import Api from '@/api'

export const api = new Api()

export function initialState () {
  return {
    form: {
      filter: true,
      ocr: false,
      offline: false,
      pipeline: 'CORENLP'
    },
    pollHandle: null,
    tasks: []
  }
}

export const state = initialState()

export const getters = {
  getField
}

export const mutations = {
  updateField,
  reset (state) {
    // acquire initial state
    const s = initialState()
    Object.keys(s).forEach(key => { state[key] = s[key] })
  },
  stopPendingTasks (state) {
    remove(state.tasks, item => item.state === 'RUNNING')
  },
  stopTask (state, name) {
    remove(state.tasks, item => item.name === name)
  },
  deleteDoneTasks (state) {
    remove(state.tasks, item => item.state === 'DONE')
  },
  updateTasks (state, raw) {
    state.tasks = raw
  },
  setPollHandle (state, pollHandle) {
    state.pollHandle = pollHandle
  },
  stopPolling (state) {
    clearInterval(state.pollHandle)
    state.pollHandle = null
  },
  resetExtractForm (state) {
    state.form.ocr = initialState().form.ocr
  },
  resetFindNamedEntitiesForm (state) {
    state.form.pipeline = initialState().form.pipeline
    state.form.offline = initialState().form.offline
  }
}

export const actions = {
  submitExtract ({ state }) {
    api.index({ ocr: state.form.ocr, filter: state.form.filter })
  },
  runBatchSearch () {
    api.runBatchSearch()
  },
  submitFindNamedEntities ({ state }) {
    api.findNames(state.form.pipeline, { syncModels: !state.form.offline })
  },
  stopPendingTasks ({ commit }) {
    api.stopPendingTasks().then(commit('stopPendingTasks'))
  },
  stopTask ({ commit }, name) {
    api.stopTask(name).then(commit('stopTask', name))
  },
  deleteDoneTasks ({ commit }) {
    api.deleteDoneTasks().then(commit('deleteDoneTasks'))
  },
  loadTasks ({ commit }) {
    return api.getTasks()
      .then(raw => {
        commit('updateTasks', raw)
        return raw
      })
  },
  startPollTasks ({ commit, dispatch }) {
    const pollHandle = setInterval(() => dispatch('loadTasks'), 2000)
    commit('setPollHandle', pollHandle)
  },
  deleteAll ({ rootState }) {
    return api.deleteAll(rootState.search.index)
  },
  getNerPipelines () {
    return api.getNerPipelines()
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
