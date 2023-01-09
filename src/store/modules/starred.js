import { castArray, groupBy, findIndex, map } from 'lodash'

export const state = {
  // A collection of `{ index, id }` documents
  documents: []
}

export const mutations = {
  documents(state, documents = []) {
    state.documents.splice(0, state.documents.length)
    mutations.pushDocuments(state, documents)
  },
  pushDocument(state, { index, id } = {}) {
    const i = findIndex(state.documents, { index, id })
    // Document doesnt exist yet in the state
    if (i === -1) {
      state.documents.push({ index, id })
    }
  },
  pushDocuments(state, documents = []) {
    for (const document of castArray(documents)) {
      mutations.pushDocument(state, document)
    }
  },
  removeDocument(state, { index, id } = {}) {
    const i = findIndex(state.documents, { index, id })
    // Document exist, we can remove it
    if (i > -1) {
      state.documents.splice(i, 1)
    }
  },
  removeDocuments(state, documents = []) {
    for (const document of castArray(documents)) {
      mutations.removeDocument(state, document)
    }
  }
}
function actionsBuilder(api) {
  return {
    async starDocuments({ commit }, documents = []) {
      const documentsByIndex = groupBy(castArray(documents), 'index')
      for (const [index, documents] of Object.entries(documentsByIndex)) {
        const documentIds = map(documents, 'id')
        await api.starDocuments(index, documentIds)
        commit('pushDocuments', documents)
      }
    },
    async unstarDocuments({ commit }, documents = []) {
      const documentsByIndex = groupBy(castArray(documents), 'index')
      for (const [index, documents] of Object.entries(documentsByIndex)) {
        const documentIds = map(documents, 'id')
        await api.unstarDocuments(index, documentIds)
        commit('removeDocuments', documents)
      }
    },
    toggleStarDocument({ state, dispatch }, { index, id } = {}) {
      const i = findIndex(state.documents, { index, id })
      if (i > -1) {
        return dispatch('unstarDocuments', { index, id })
      } else {
        return dispatch('starDocuments', { index, id })
      }
    },
    async fetchIndicesStarredDocuments({ commit, rootState }, indices = null) {
      for (const index of castArray(indices || rootState.search.indices)) {
        const ids = await api.getStarredDocuments(index)
        const documents = castArray(ids).map((id) => ({ id, index }))
        commit('documents', documents)
      }
    }
  }
}

export function starredStoreBuilder(api) {
  return {
    namespaced: true,
    state,
    mutations,
    actions: actionsBuilder(api)
  }
}
