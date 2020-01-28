import remove from 'lodash/remove'

import Api from '@/api'

export const datashare = new Api()

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
      const batchSearches = await datashare.getBatchSearches()
      return commit('batchSearches', batchSearches)
    } catch (_) {}
  },
  async onSubmit ({ state, commit, dispatch }, { name, csvFile, description, project, phraseMatch, fuzziness, fileTypes, paths, published }) {
    try {
      await datashare.batchSearch(name, csvFile, description, project, phraseMatch, fuzziness, fileTypes, paths, published)
      return dispatch('getBatchSearches')
    } catch (_) {}
  },
  async getBatchSearchResults ({ state, commit }, { batchId, from, size, queries, sort, order }) {
    try {
      const results = await datashare.getBatchSearchResults(batchId, from, size, queries, sort, order)
      return commit('results', results)
    } catch (_) {}
  },
  async deleteBatchSearch ({ state }, { batchId }) {
    try {
      await datashare.deleteBatchSearch(batchId)
      remove(state.batchSearches, batchSearch => batchSearch === batchId)
      return true
    } catch (_) {
      return false
    }
  },
  async updateBatchSearch ({ state }, { batchId, published }) {
    try {
      await datashare.updateBatchSearch(batchId, published)
    } catch (_) {}
  },
  async deleteBatchSearches ({ commit }) {
    try {
      await datashare.deleteBatchSearches()
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
