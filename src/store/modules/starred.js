import { castArray, concat, difference, groupBy, map, uniq } from 'lodash'
import Vue from 'vue'
import Api from '@/api'

export const api = new Api()

export const state = {
  documents: []
}

export const mutations = {
  documents (state, documents) {
    Vue.set(state, 'documents', documents)
  },
  pushDocuments (state, documentIds) {
    Vue.set(state, 'documents', uniq(concat(state.documents, documentIds)))
  },
  removeDocuments (state, documentIds) {
    Vue.set(state, 'documents', difference(state.documents, documentIds))
  }
}

export const actions = {
  async starDocuments ({ commit }, documents = []) {
    const documentsByIndex = groupBy(castArray(documents), 'index')
    for (const [index, documents] of Object.entries(documentsByIndex)) {
      const documentIds = map(documents, 'id')
      await api.starDocuments(index, documentIds)
      commit('pushDocuments', documentIds)
    }
  },
  async unstarDocuments ({ commit }, documents = []) {
    const documentsByIndex = groupBy(castArray(documents), 'index')
    for (const [index, documents] of Object.entries(documentsByIndex)) {
      const documentIds = map(documents, 'id')
      await api.unstarDocuments(index, documentIds)
      commit('removeDocuments', documentIds)
    }
  },
  toggleStarDocument ({ state, dispatch }, document) {
    if (state.documents.indexOf(document.id) >= 0) {
      return dispatch('unstarDocuments', document)
    } else {
      return dispatch('starDocuments', document)
    }
  },
  async getStarredDocuments ({ commit, rootState }) {
    for (const index of castArray(rootState.search.index)) {
      const documents = await api.getStarredDocuments(index)
      commit('documents', documents)
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
