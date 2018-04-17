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
  }
}

export const actions = {
  query ({ state, commit }) {
    console.log(state)
    if (state.form.index) {
      datashare.index(state.form.path).then(raw => { commit('updateTasks', raw) })
    }
    if (state.form.extract) {
      datashare.extract(state.form.pipeline).then(raw => { commit('updateTasks', raw) })
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
