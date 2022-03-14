import Vue from 'vue'
import { has } from 'lodash'

import Api from '@/api'

export const api = new Api()

export const state = {
  allowedFor: {}
}

export const mutations = {
  clear (state) {
    Vue.set(state, 'allowedFor', {})
  },
  allowedFor (state, { index, allowed }) {
    Vue.set(state.allowedFor, index, allowed)
  }
}

export const actions = {
  async getIndexStatus ({ state }, index) {
    try {
      if (!has(state.allowedFor, index)) {
        // Not allowed index will throw an error
        await api.isDownloadAllowed(index)
      }
      return true
    } catch (_) {
      return false
    }
  },
  async fetchIndexStatus ({ commit, state }, index) {
    const allowed = actions.getIndexStatus({ state }, index)
    commit('allowedFor', { index, allowed })
  },
  async fetchIndicesStatus ({ commit, rootState, state }) {
    for (const index of rootState.search.indices) {
      actions.fetchIndexStatus({ commit, state }, index)
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
