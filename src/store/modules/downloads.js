import Vue from 'vue'
import { has } from 'lodash'

export const state = {
  allowedFor: {}
}

export const mutations = {
  clear(state) {
    Vue.set(state, 'allowedFor', {})
  },
  allowedFor(state, { index, allowed }) {
    Vue.set(state.allowedFor, index, allowed)
  }
}

function actionBuilder(api) {
  const getIndexStatus = async ({ state }, index) => {
    try {
      if (!has(state.allowedFor, index)) {
        // Not allowed index will throw an error
        await api.isDownloadAllowed(index)
      }
      return true
    } catch (_) {
      return false
    }
  }
  const fetchIndexStatus = async ({ commit, state }, index) => {
    const allowed = await getIndexStatus({ state }, index)
    commit('allowedFor', {
      index,
      allowed
    })
  }
  const fetchIndicesStatus = async ({ commit, rootState, state }) => {
    const promises = []
    for (const index of rootState.search.indices) {
      promises.push(fetchIndexStatus({ commit, state }, index))
    }
    return Promise.all(promises)
  }
  return {
    getIndexStatus,
    fetchIndexStatus,
    fetchIndicesStatus
  }
}

export function downloadsBuilder(api) {
  const actions = actionBuilder(api)
  return {
    namespaced: true,
    state,
    mutations,
    actions
  }
}
