import Vue from 'vue'
import Vuex from 'vuex'
import { getField, updateField } from 'vuex-map-fields'
import {DatashareClient} from '@/api/datashare'

Vue.use(Vuex)
const datashare = new DatashareClient()

export const state = {
  form: {
    index: true,
    path: '/home/datashare/data',
    extract: false,
    pipeline: null
  },
  pollHandle: null,
  tasks: []
}

export const getters = {
  getField
}

export const mutations = {
  updateField,
  cleanTasks (state) {
    state.tasks = []
  },
  updateTasks (state, raw) {
    state.tasks = raw
  },
  startPolling (state) {
    state.pollHandle = setInterval(() => {
      datashare.getTasks().then(resp => resp.json().then(raw => this.updateTasks(state, raw)))
    }, 2000)
  },
  stopPolling (state) {
    clearInterval(state.pollHandle)
    state.pollHandle = null
  }
}

export const actions = {
  query ({ state, commit }) {
    if (state.form.index) {
      datashare.index(state.form.path)
    }
    if (state.form.extract) {
      datashare.extract(state.form.pipeline)
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
