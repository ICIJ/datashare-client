import DatashareClient from '@/api/DatashareClient'
import remove from 'lodash/remove'

export const datashare = new DatashareClient()

export function initialState () {
  return {
    name: '',
    description: '',
    index: 'local-datashare',
    csvFile: null,
    batchSearches: [],
    selectedQueries: [],
    results: []
  }
}

export const state = initialState

export const mutations = {
  reset (state) {
    Object.assign(state, initialState())
  },
  resetForm (state) {
    state.name = ''
    state.description = ''
    state.index = 'local-datashare'
    state.csvFile = null
  },
  name (state, name) {
    state.name = name
  },
  description (state, description) {
    state.description = description
  },
  index (state, index) {
    state.index = index
  },
  csvFile (state, csvFile) {
    state.csvFile = csvFile
  },
  batchSearches (state, batchSearches) {
    state.batchSearches = batchSearches
  },
  results (state, results) {
    state.results = results
  },
  selectedQueries (state, selectedQueries) {
    state.selectedQueries = selectedQueries
  }
}

export const actions = {
  async getBatchSearches ({ commit }) {
    try {
      const batchSearches = await datashare.getBatchSearches()
      return commit('batchSearches', batchSearches)
    } catch (_) {}
  },
  async onSubmit ({ state, commit, dispatch }) {
    try {
      await datashare.batchSearch(state.index, state.name, state.description, state.csvFile)
      commit('resetForm')
      return dispatch('getBatchSearches')
    } catch (_) {}
  },
  async getBatchSearchResults ({ state, commit }, { batchId, from, size, queries, sort, order }) {
    try {
      const results = await datashare.getBatchSearchResults(batchId, from, size, queries, sort, order)
      return commit('results', results)
    } catch (_) {}
  },
  async deleteBatchSearch ({ state, dispatch }, { batchId }) {
    try {
      await datashare.deleteBatchSearch(batchId)
      remove(state.batchSearches, batchSearch => batchSearch === batchId)
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
