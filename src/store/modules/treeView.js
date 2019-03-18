import castArray from 'lodash/castArray'
import remove from 'lodash/remove'
import some from 'lodash/some'
import startsWith from 'lodash/startsWith'
import xor from 'lodash/xor'

export const state = {
  openPaths: []
}

export const getters = {
  isOpen (state) {
    return path => some(state.openPaths, p => startsWith(p, path))
  }
}

export const mutations = {
  togglePath (state, path) {
    state.openPaths = xor(state.openPaths, castArray(path))
    return getters.isOpen(state)(path)
  },
  addPath (state, path) {
    if (state.openPaths.indexOf(path) === -1) {
      state.openPaths.push(path)
    }
  },
  removePath (state, path) {
    state.openPaths = remove(state.openPaths, path)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations
}
