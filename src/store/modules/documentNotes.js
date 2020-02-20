import filter from 'lodash/filter'
import hasIn from 'lodash/hasIn'
import set from 'lodash/set'

import Api from '@/api'

export const api = new Api()

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
  filterNotesByPath ({ state }, { project, path }) {
    return filter(state.notes[project], note => path.match(new RegExp(note.path.replace('file://', ''))))
  },
  async retrieveNotes ({ state, commit, dispatch }, { project, path }) {
    if (!hasIn(state.notes, project)) {
      const notes = await api.retrieveNotes(project)
      commit('setNotes', { project, notes })
    }
    return dispatch('filterNotesByPath', { project, path })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
