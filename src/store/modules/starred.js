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

function prepareDocumentIds(documents) {
  const documentsByIndex = groupBy(castArray(documents), 'index')
  const indexWithDocIds = []
  for (const [index, documents] of Object.entries(documentsByIndex)) {
    indexWithDocIds.push({ index, documentIds: map(documents, 'id') })
  }
  return indexWithDocIds
}

function actionsBuilder(api) {
  return {
    async starDocuments({ commit }, documents = []) {
      const starDocs = prepareDocumentIds(documents).map(function ({ index, documentIds }) {
        return api.starDocuments(index, documentIds)
      })
      await Promise.all(starDocs)
      commit('pushDocuments', documents)
    },
    async unstarDocuments({ commit }, documents = []) {
      const unstarDocs = prepareDocumentIds(documents).map(function ({ index, documentIds }) {
        return api.unstarDocuments(index, documentIds)
      })
      await Promise.all(unstarDocs)
      commit('removeDocuments', documents)
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
      const promisesIds = []
      const docs = []
      for (const index of castArray(indices || rootState.search.indices)) {
        const getStarredDocs = api.getStarredDocuments(index).then((ids) => {
          const items = castArray(ids).map((id) => ({ id, index }))
          docs.push(...items)
        })
        promisesIds.push(getStarredDocs)
      }
      // TODO: what to do on error?
      await Promise.all(promisesIds)
      commit('documents', docs)
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
