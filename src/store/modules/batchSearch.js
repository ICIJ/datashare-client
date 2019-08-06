import DatashareClient from '@/api/DatashareClient'

export const datashare = new DatashareClient()

export function initialState () {
  return {
    name: '',
    description: '',
    index: 'local-datashare',
    csvFile: null,
    batchSearches: [],
    batchSearch: []
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
  batchSearch (state, batchSearch) {
    state.batchSearch = batchSearch
  }
}

export const actions = {
  getBatchSearches ({ commit }) {
    return datashare.getBatchSearches().then(r => r.clone().json()).then(batchSearches => commit('batchSearches', batchSearches))
  },
  onSubmit ({ state, commit, dispatch }) {
    try {
      return datashare.batchSearch(state.index, state.name, state.description, state.csvFile).then(() => {
        commit('resetForm')
        return dispatch('getBatchSearches')
      })
    } catch (e) {}
  },
  async getBatchSearchResults ({ commit }, batchId) {
    const batchSearch = await datashare.getBatchSearchResults(batchId).then(r => r.clone().json())
    commit('batchSearch', batchSearch)
    return batchSearch
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
