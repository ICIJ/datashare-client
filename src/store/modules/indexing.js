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
  tasks: []
}

export const getters = {
  getField
}

export const mutations = {
  updateField,
  updateTasks (state, raw) {
    state.tasks = raw
  },
  cleanTasks (state) {
    state.tasks = []
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
    setInterval(() => {
      datashare.getTasks().then(resp => resp.json().then(raw => commit('updateTasks', raw)))
    }, 2000)
  },
  stopPollTasks () {
    clearInterval()
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
