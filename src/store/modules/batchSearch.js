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
  getBatchSearches ({ commit }) {
    return datashare.getBatchSearches().then(batchSearches => {
      return commit('batchSearches', batchSearches)
    })
  },
  async onSubmit ({ state, commit, dispatch }) {
    try {
      await datashare.batchSearch(state.index, state.name, state.description, state.csvFile)
      commit('resetForm')
      return dispatch('getBatchSearches')
    } catch (_) {}
  },
  async getBatchSearchResults ({ state, commit }, { batchId, from, size, queries, sort, order }) {
    const results = await datashare.getBatchSearchResults(batchId, from, size, queries, sort, order)
    return commit('results', results)
  },
  async deleteBatchSearch ({ state, dispatch }, { batchId }) {
    try {
      await datashare.deleteBatchSearch(batchId)
      remove(state.batchSearches, batchSearch => batchSearch === batchId)
    } catch (_) {}
  },
  deleteBatchSearches ({ commit }) {
    return datashare.deleteBatchSearches().then(commit('batchSearches', []))
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
