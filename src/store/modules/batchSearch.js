import remove from 'lodash/remove'

import Api from '@/api'

export const api = new Api()

export function initialState () {
  return {
    batchSearch: {},
    batchSearches: [],
    results: [],
    selectedQueries: []
  }
}

export const state = initialState()

export const mutations = {
  reset (state) {
    Object.assign(state, initialState())
  },
  batchSearch (state, batchSearch) {
    state.batchSearch = batchSearch
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
  async getBatchSearch ({ commit }, batchId) {
    let batchSearch
    try {
      batchSearch = await api.getBatchSearch(batchId)
    } catch (_) {
      batchSearch = {}
    }
    return commit('batchSearch', batchSearch)
  },
  async getBatchSearches ({ commit }) {
    let batchSearches
    try {
      batchSearches = await api.getBatchSearches()
    } catch (_) {
      batchSearches = []
    }
    return commit('batchSearches', batchSearches)
  },
  async onSubmit ({ state, commit, dispatch }, { name, csvFile, description, project, phraseMatch, fuzziness, fileTypes, paths, published }) {
    await api.batchSearch(name, csvFile, description, project, phraseMatch, fuzziness, fileTypes, paths, published)
    return dispatch('getBatchSearches')
  },
  async getBatchSearchResults ({ state, commit }, { batchId, from, size, queries, sort, order }) {
    let results
    try {
      results = await api.getBatchSearchResults(batchId, from, size, queries, sort, order)
    } catch (_) {
      results = []
    }
    return commit('results', results)
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
