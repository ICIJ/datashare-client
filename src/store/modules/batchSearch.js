import DatashareClient from '@/api/DatashareClient'

export const datashare = new DatashareClient()

export function initialState () {
  return {
    name: '',
    description: '',
    csvFile: null
  }
}

export const state = initialState

export const mutations = {
  reset (state) {
    const s = initialState()
    Object.keys(s).forEach(key => { state[key] = s[key] })
  },
  name (state, name) {
    state.name = name
  },
  description (state, description) {
    state.description = description
  },
  csvFile (state, csvFile) {
    state.csvFile = csvFile
  }
}

export const actions = {
  onSubmit ({ rootState, state, commit }) {
    try {
      datashare.batchSearch(rootState.search.index, state.name, state.description, state.csvFile).then(() => commit('reset'))
    } catch (e) {}
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
