import map from 'lodash/map'

import DatashareClient from '@/api/DatashareClient'
import esClient from '@/api/esClient'
import Response from '@/api/Response'

export const datashare = new DatashareClient()

export function initialState () {
  return {
    name: '',
    description: '',
    index: 'local-datashare',
    csvFile: null,
    batchSearches: [],
    results: []
  }
}

export const state = initialState

export const mutations = {
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
  }
}

export const actions = {
  async getBatchSearches ({ commit }) {
    const batchSearches = await datashare.getBatchSearches().then(r => r.clone().json())
    commit('batchSearches', batchSearches)
    return batchSearches
  },
  onSubmit ({ state, commit, dispatch }) {
    try {
      return datashare.batchSearch(state.index, state.name, state.description, state.csvFile).then(() => {
        commit('resetForm')
        return dispatch('getBatchSearches')
      })
    } catch (e) {}
  },
  async getBatchSearchResults ({ state, commit }, batchId, from = 0, size = 100) {
    const results = await datashare.getBatchSearchResults(batchId, from, size).then(r => r.clone().json())
    await Promise.all(map(results, async result => {
      const raw = await esClient.getEsDoc(state.index, result.documentId, result.rootId)
      result.document = Response.instantiate(raw)
    }))
    commit('results', results)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
