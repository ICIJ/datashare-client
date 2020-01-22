import get from 'lodash/get'
import hasIn from 'lodash/hasIn'
import set from 'lodash/set'

import DatashareClient from '@/api/DatashareClient'

export const datashare = new DatashareClient()

export function initialState () {
  return {
    notes: {}
  }
}
export const state = initialState()

export const mutations = {
  reset (state) {
    const s = initialState()
    Object.keys(s).forEach(key => { state[key] = s[key] })
  },
  setNotes (state, { project, notes }) {
    set(state, ['notes', project], notes)
  }
}

export const actions = {
  async retrieveNotes ({ state, commit }, { project, path }) {
    if (!hasIn(state.notes, project)) {
      const notes = await datashare.retrieveNotes(project, path)
      commit('setNotes', { project, notes })
    }
    return get(state, ['notes', project])
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
