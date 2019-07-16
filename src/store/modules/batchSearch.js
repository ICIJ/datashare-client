import DatashareClient from '@/api/DatashareClient'

export const datashare = new DatashareClient()

export function initialState () {
  return {
    name: '',
    description: '',
    csvFile: null,
    batchSearches: []
  }
}

export const state = initialState

export const mutations = {
  resetForm (state) {
    state.name = ''
    state.description = ''
    state.csvFile = null
  },
  name (state, name) {
    state.name = name
  },
  description (state, description) {
    state.description = description
  },
  csvFile (state, csvFile) {
    state.csvFile = csvFile
  },
  batchSearches (state, batchSearches) {
    state.batchSearches = batchSearches
  }
}

export const actions = {
  getBatchSearches ({ commit }) {
    return datashare.getBatchSearches().then(r => r.clone().json()).then(batchSearches => commit('batchSearches', batchSearches))
  },
  onSubmit ({ rootState, state, commit, dispatch }) {
    try {
      return datashare.batchSearch(rootState.search.index, state.name, state.description, state.csvFile).then(r => {
        commit('resetForm')
        return dispatch('getBatchSearches')
      })
    } catch (e) {}
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
