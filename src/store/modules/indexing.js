import { getField, updateField } from 'vuex-map-fields'
import Api from '@/api'
import remove from 'lodash/remove'

export const datashare = new Api()

export function initialState () {
  return {
    form: {
      ocr: false,
      filter: true,
      pipeline: 'corenlp',
      offline: false
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
    datashare.index({ ocr: state.form.ocr, filter: state.form.filter })
  },
  runBatchSearch () {
    datashare.runBatchSearch()
  },
  submitFindNamedEntities ({ state }) {
    switch (state.form.pipeline) {
      case 'corenlp':
        datashare.findNames('CORENLP', { syncModels: !state.form.offline })
        break
      case 'opennlp':
        datashare.findNames('OPENNLP', { syncModels: !state.form.offline })
        break
      case 'mitie':
        datashare.findNames('MITIE', { syncModels: !state.form.offline })
        break
      case 'ixapipe':
        datashare.findNames('IXAPIPE', { syncModels: !state.form.offline })
        break
      case 'email':
        datashare.findNames('EMAIL', { syncModels: false })
        break
    }
  },
  stopPendingTasks ({ commit }) {
    datashare.stopPendingTasks().then(commit('stopPendingTasks'))
  },
  stopTask ({ commit }, name) {
    datashare.stopTask(name).then(commit('stopTask', name))
  },
  deleteDoneTasks ({ commit }) {
    datashare.deleteDoneTasks().then(commit('deleteDoneTasks'))
  },
  loadTasks ({ commit }) {
    return datashare.getTasks()
      .then(raw => {
        commit('updateTasks', raw)
        return raw
      })
  },
  startPollTasks ({ commit, dispatch }) {
    const pollHandle = setInterval(() => dispatch('loadTasks'), 2000)
    commit('setPollHandle', pollHandle)
  },
  stopPollTasks ({ commit }) {
    commit('stopPolling')
  },
  resetFindNamedEntitiesForm ({ commit }) {
    commit('resetFindNamedEntitiesForm')
  },
  resetExtractForm ({ commit }) {
    commit('resetExtractForm')
  },
  deleteAll ({ rootState }) {
    return datashare.deleteAll(rootState.search.index)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
