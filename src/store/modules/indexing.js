import { getField, updateField } from 'vuex-map-fields'
import DatashareClient from '@/api/DatashareClient'

export const datashare = new DatashareClient()

export function initialState () {
  return {
    form: {
      ocr: false,
      pipeline: 'corenlp',
      offline: false
    },
    pollHandle: null,
    tasks: []
  }
}

export const state = initialState

export const getters = {
  getField
}

export const mutations = {
  reset (state) {
    // acquire initial state
    const s = initialState()
    Object.keys(s).forEach(key => { state[key] = s[key] })
  },
  updateField,
  cleanTasks (state) {
    state.tasks = []
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
    datashare.index({ ocr: state.form.ocr })
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
    }
  },
  cleanTasks ({ state, commit }) {
    datashare.cleanTasks().then(commit('cleanTasks'))
  },
  loadTasks ({ commit }) {
    return datashare.getTasks()
      .then(resp => {
        return resp.json().catch(() => [])
      })
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
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
