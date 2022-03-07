import { concat, difference, map, uniq } from 'lodash'
import Vue from 'vue'
import Api from '@/api'

export const api = new Api()

export const state = {
  starredDocuments: []
}

export const mutations = {
  starredDocuments (state, starredDocuments) {
    Vue.set(state, 'starredDocuments', starredDocuments)
  },
  pushFromStarredDocuments (state, documentIds) {
    Vue.set(state, 'starredDocuments', uniq(concat(state.starredDocuments, documentIds)))
  },
  removeFromStarredDocuments (state, documentIds) {
    Vue.set(state, 'starredDocuments', difference(state.starredDocuments, documentIds))
  }
}

export const actions = {
  async starDocuments ({ commit, rootState }, documents) {
    const documentIds = map(documents, 'id')
    await api.starDocuments(rootState.search.index, documentIds)
    commit('pushFromStarredDocuments', documentIds)
  },
  async unstarDocuments ({ rootState, commit }, documents) {
    const documentIds = map(documents, 'id')
    await api.unstarDocuments(rootState.search.index, documentIds)
    commit('removeFromStarredDocuments', documentIds)
  },
  toggleStarDocument ({ state, dispatch }, documentId) {
    const documents = [{ id: documentId }]
    if (state.starredDocuments.indexOf(documentId) >= 0) {
      return dispatch('unstarDocuments', documents)
    } else {
      return dispatch('starDocuments', documents)
    }
  },
  async getStarredDocuments ({ rootState, commit }) {
    const starredDocuments = await api.getStarredDocuments(rootState.search.index)
    commit('starredDocuments', starredDocuments)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
