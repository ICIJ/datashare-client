import Vue from 'vue'
import Vuex from 'vuex'
import { getField, updateField } from 'vuex-map-fields'
import { DatashareClient } from '@/api/DatashareClient'

Vue.use(Vuex)
const datashare = new DatashareClient()

function initialState () {
  return {
    form: {
      index: false,
      findNames: false,
      ocr: false,
      pipeline_corenlp: false,
      pipeline_opennlp: false,
      pipeline_mitie: false,
      pipeline_ixapipe: false,
      pipeline_gatenlp: false
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
  startPolling (state) {
    state.pollHandle = setInterval(() => {
      datashare.getTasks().then(resp => resp.json().then(raw => this.commit('indexing/updateTasks', raw)))
    }, 2000)
  },
  stopPolling (state) {
    clearInterval(state.pollHandle)
    state.pollHandle = null
  }
}

export const actions = {
  query ({ state, commit }) {
    if (state.form.index) datashare.index({ ocr: state.form.ocr })
    if (state.form.findNames) {
      if (state.form.pipeline_corenlp) datashare.findNames('CORENLP', { resume: true })
      if (state.form.pipeline_opennlp) datashare.findNames('OPENNLP', { resume: true })
      if (state.form.pipeline_mitie) datashare.findNames('MITIE', { resume: true })
      if (state.form.pipeline_ixapipe) datashare.findNames('IXAPIPE', { resume: true })
      if (state.form.pipeline_gatenlp) datashare.findNames('GATENLP', { resume: true })
    }
  },
  cleanTasks ({ state, commit }) {
    datashare.cleanTasks().then(commit('cleanTasks'))
  },
  startPollTasks ({ state, commit }) {
    commit('startPolling')
  },
  stopPollTasks ({ state, commit }) {
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
