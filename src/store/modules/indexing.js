import { getField, updateField } from 'vuex-map-fields'
import DatashareClient from '@/api/DatashareClient'

export const datashare = new DatashareClient()

export function initialState () {
  return {
    form: {
      ocr: false,
      pipeline: 'corenlp'
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
  setPoolHandle (state, poolHandle) {
    state.pollHandle = poolHandle
  },
  stopPolling (state) {
    clearInterval(state.pollHandle)
    state.pollHandle = null
  }
}

export const actions = {
  submitExtract ({ state }) {
    datashare.index({ ocr: state.form.ocr })
  },
  submitFindNamedEntities ({ state }) {
    switch (state.form.pipeline) {
      case 'corenlp':
        datashare.findNames('CORENLP', { resume: !state.form.index })
        break
      case 'opennlp':
        datashare.findNames('OPENNLP', { resume: !state.form.index })
        break
      case 'mitie':
        datashare.findNames('MITIE', { resume: !state.form.index })
        break
      case 'ixapipe':
        datashare.findNames('IXAPIPE', { resume: !state.form.index })
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
    const poolHandle = setInterval(() => dispatch('loadTasks'), 2000)
    commit('setPoolHandle', poolHandle)
  },
  stopPollTasks ({ commit }) {
    commit('stopPolling')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
