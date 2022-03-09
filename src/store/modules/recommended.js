import { flatten, map, sumBy } from 'lodash'
import Vue from 'vue'

import Api from '@/api'

export const api = new Api()

export const state = {
  byUsers: [],
  documents: [],
  total: 0
}

export const mutations = {
  documents (state, documents) {
    Vue.set(state, 'documents', documents)
  },
  byUsers (state, byUsers) {
    Vue.set(state, 'byUsers', byUsers)
  },
  total (state, total) {
    Vue.set(state, 'total', total)
  }
}

export const actions = {
  async fetchIndicesRecommendations ({ rootState, commit }) {
    try {
      const { indices } = rootState.search
      const recommendationsByProject = indices.map(index => api.getRecommendationsByProject(index))
      const recommendations = await Promise.all(recommendationsByProject)
      const total = sumBy(recommendations, 'totalCount')
      const aggregates = flatten(map(recommendations, 'aggregates'))
      const byUsers = aggregates.map(({ count, ...user }) => ({ user: user.item.id, count }))
      const sumByUsers = byUsers.reduce((merged, { user, count }) => {
        merged[user] ||= { user, count: 0 }
        merged[user].count += count
        return merged
      }, {})
      commit('byUsers', Object.values(sumByUsers))
      commit('total', total)
    } catch (_) {
      commit('byUsers', [])
      commit('total', 0)
    }
  },
  async getDocumentsRecommendedBy ({ rootState, commit }, users) {
    try {
      if (users.length) {
        const { indices } = rootState.search
        const documentsByProject = indices.map(index => api.getDocumentsRecommendedBy(index, users))
        commit('documents', flatten(await Promise.all(documentsByProject)))
      } else {
        commit('documents', [])
      }
    } catch (_) {
      commit('documents', [])
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
