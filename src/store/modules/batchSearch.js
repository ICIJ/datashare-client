import remove from 'lodash/remove'

import Vue from 'vue'

export function initialState () {
  return {
    batchSearch: {},
    batchSearches: [],
    results: [],
    selectedQueries: [],
    total: 0,
    hasBatchSearch: false
  }
}

export const state = initialState()

export const mutations = {
  reset (state) {
    Object.assign(state, initialState())
  },
  batchSearch (state, batchSearch) {
    Vue.set(state, 'batchSearch', batchSearch)
  },
  batchSearches (state, batchSearches) {
    Vue.set(state, 'batchSearches', batchSearches)
  },
  removeBatchSearch (state, batchId) {
    remove(state.batchSearches, batchSearch => batchSearch.uuid === batchId)
    state.hasBatchSearch = state.batchSearches.length > 0
    state.total = state.total - 1
  },
  clearBatchSearches (state) {
    state.batchSearches = []
    state.hasBatchSearch = false
    state.total = 0
  },
  selectedQueries (state, selectedQueries) {
    Vue.set(state, 'selectedQueries', selectedQueries)
  },
  results (state, results) {
    Vue.set(state, 'results', results)
  },
  total (state, total) {
    Vue.set(state, 'total', total)
  },
  hasBatchSearch (state, hasBatchSearch) {
    state.hasBatchSearch = hasBatchSearch
  }
}

function actionBuilder (api) {
  return {
    async getBatchSearch ({ commit }, batchId) {
      let batchSearch = {}
      try {
        batchSearch = await api.getBatchSearch(batchId)
      } catch (_) {
        batchSearch = {}
      }
      return commit('batchSearch', batchSearch)
    },
    async hasBatchSearch ({ commit }) {
      try {
        const batchSearches = await api.getBatchSearches()
        commit('hasBatchSearch', batchSearches.total > 0)
      } catch (e) {
        commit('hasBatchSearch', false)
      }
    },
    async getBatchSearches ({ commit }, {
      from = 0,
      size = 100,
      sort = 'batch_date',
      order = 'asc',
      query = '*',
      field = 'all',
      project = [],
      state = [],
      batchDate = null,
      publishState = null
    }) {
      let batchSearches = []
      try {
        batchSearches = await api.getBatchSearches(from, size, sort, order, query, field, project, state, batchDate, publishState)
      } catch (_) {
        batchSearches = {
          items: [],
          total: 0
        }
      }
      commit('total', batchSearches.total)
      return commit('batchSearches', batchSearches.items)
    },
    async onSubmit ({
      commit,
      dispatch
    }, {
      name,
      csvFile,
      description,
      projects,
      phraseMatch,
      fuzziness,
      fileTypes,
      paths,
      published
    }) {
      await api.batchSearch(name, csvFile, description, projects, phraseMatch, fuzziness, fileTypes, paths, published)
      commit('hasBatchSearch', true)
      return dispatch('getBatchSearches', {})
    },
    async getBatchSearchResults ({ commit }, {
      batchId,
      from,
      size,
      queries,
      sort,
      order
    }) {
      let results = []
      try {
        results = await api.getBatchSearchResults(batchId, from, size, queries, sort, order)
      } catch (_) {
        results = []
      }
      return commit('results', results)
    },
    async deleteBatchSearch ({ commit }, { batchId }) {
      try {
        await api.deleteBatchSearch(batchId)
        commit('removeBatchSearch', batchId)
        return true
      } catch (_) {
        return false
      }
    },
    async updateBatchSearch (_, {
      batchId,
      published
    }) {
      try {
        await api.updateBatchSearch(batchId, published)
      } catch (_) {
        // TODO do something
      }
    },
    async deleteBatchSearches ({ commit }) {
      try {
        await api.deleteBatchSearches()
        commit('clearBatchSearches')
        return {}
      } catch (_) {
        // TODO do something
      }
    }
  }
}

export function batchStoreBuilder (api) {
  return {
    namespaced: true,
    state,
    mutations,
    actions: actionBuilder(api)
  }
}
