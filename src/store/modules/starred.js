import { concat, difference, map, uniq } from 'lodash'
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
  async starDocuments ({ commit, rootState }, documents) {
    const documentIds = map(documents, 'id')
    await api.starDocuments(rootState.search.index, documentIds)
    commit('pushDocuments', documentIds)
  },
  async unstarDocuments ({ rootState, commit }, documents) {
    const documentIds = map(documents, 'id')
    await api.unstarDocuments(rootState.search.index, documentIds)
    commit('removeDocuments', documentIds)
  },
  toggleStarDocument ({ state, dispatch }, documentId) {
    const documents = [{ id: documentId }]
    if (state.documents.indexOf(documentId) >= 0) {
      return dispatch('unstarDocuments', documents)
    } else {
      return dispatch('starDocuments', documents)
    }
  },
  async getStarredDocuments ({ rootState, commit }) {
    const documents = await api.getStarredDocuments(rootState.search.index)
    commit('documents', documents)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
