import castArray from 'lodash/castArray'
import isEqual from 'lodash/isEqual'
import slice from 'lodash/slice'
import split from 'lodash/split'
import some from 'lodash/some'
import without from 'lodash/without'
import xor from 'lodash/xor'

export const state = {
  openPaths: []
}

export const getters = {
  isOpen (state) {
    return path => {
      return some(state.openPaths, openPath => {
        const splitPath = split(path, '/')
        const splitOpenPath = split(openPath, '/')
        const slicedOpenPath = slice(splitOpenPath, 0, splitPath.length)
        return isEqual(splitPath, slicedOpenPath)
      })
    }
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
    state.openPaths = without(state.openPaths, path)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations
}
