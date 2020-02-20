import remove from 'lodash/remove'

import Api from '@/api'

export const api = new Api()

export function initialState () {
  return {
    batchSearches: [],
    selectedQueries: [],
    results: []
  }
}

export const state = initialState()

export const mutations = {
  reset (state) {
    Object.assign(state, initialState())
  },
  batchSearches (state, batchSearches) {
    state.batchSearches = batchSearches
  },
  selectedQueries (state, selectedQueries) {
    state.selectedQueries = selectedQueries
  },
  results (state, results) {
    state.results = results
  }
}

export const actions = {
  async getBatchSearches ({ commit }) {
    try {
      const batchSearches = await api.getBatchSearches()
      return commit('batchSearches', batchSearches)
    } catch (_) {}
  },
  async onSubmit ({ state, commit, dispatch }, { name, csvFile, description, project, phraseMatch, fuzziness, fileTypes, paths, published }) {
    try {
      await api.batchSearch(name, csvFile, description, project, phraseMatch, fuzziness, fileTypes, paths, published)
      return dispatch('getBatchSearches')
    } catch (_) {}
  },
  async getBatchSearchResults ({ state, commit }, { batchId, from, size, queries, sort, order }) {
    try {
      const results = await api.getBatchSearchResults(batchId, from, size, queries, sort, order)
      return commit('results', results)
    } catch (_) {}
  },
  async deleteBatchSearch ({ state }, { batchId }) {
    try {
      await api.deleteBatchSearch(batchId)
      remove(state.batchSearches, batchSearch => batchSearch === batchId)
      return true
    } catch (_) {
      return false
    }
  },
  async updateBatchSearch ({ state }, { batchId, published }) {
    try {
      await api.updateBatchSearch(batchId, published)
    } catch (_) {}
  },
  async deleteBatchSearches ({ commit }) {
    try {
      await api.deleteBatchSearches()
      return commit('batchSearches', [])
    } catch (_) {}
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
