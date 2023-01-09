import remove from 'lodash/remove'
import map from 'lodash/map'

import Vue from 'vue'
import {
  RESET,
  SINGLE_BATCH_SEARCH,
  SINGLE_BATCH_SEARCH_QUERIES,
  BATCH_SEARCHES,
  REMOVE_BATCH_SEARCH,
  CLEAR_BATCH_SEARCH,
  SELECTED_QUERIES,
  RESULTS,
  TOTAL,
  HAS_BATCH_SEARCH
} from '@/store/mutation-types'

export function initialState() {
  return {
    batchSearch: {},
    batchSearches: [],
    results: [],
    queries: {},
    selectedQueries: [],
    total: 0,
    hasBatchSearch: false
  }
}

export const state = initialState()

export const getters = {
  queryKeys(state) {
    return map(state.queries, (count, label) => ({ label, count }))
  },
  nbSelectedQueries(state) {
    return state.selectedQueries?.length ?? 0
  }
}
export const mutations = {
  [RESET](state) {
    Object.assign(state, initialState())
  },
  [SINGLE_BATCH_SEARCH](state, batchSearch) {
    Vue.set(state, 'batchSearch', batchSearch)
  },
  [SINGLE_BATCH_SEARCH_QUERIES](state, queries) {
    state.queries = queries
  },
  [BATCH_SEARCHES](state, batchSearches) {
    Vue.set(state, 'batchSearches', batchSearches)
  },
  [REMOVE_BATCH_SEARCH](state, batchId) {
    remove(state.batchSearches, (batchSearch) => batchSearch.uuid === batchId)
    state.hasBatchSearch = state.batchSearches.length > 0
    state.total = state.total - 1
  },
  [CLEAR_BATCH_SEARCH](state) {
    state.batchSearches = []
    state.hasBatchSearch = false
    state.total = 0
  },
  [SELECTED_QUERIES](state, selectedQueries) {
    Vue.set(state, 'selectedQueries', selectedQueries)
  },
  [RESULTS](state, results) {
    Vue.set(state, 'results', results)
  },
  [TOTAL](state, total) {
    state.total = total
  },
  [HAS_BATCH_SEARCH](state, hasBatchSearch) {
    state.hasBatchSearch = hasBatchSearch
  }
}

export function actionBuilder(api) {
  return {
    async getBatchSearch({ commit }, batchId) {
      let batchSearch = {}
      try {
        batchSearch = await api.getBatchSearch(batchId)
      } finally {
        commit(SINGLE_BATCH_SEARCH, batchSearch)
      }
    },
    async getBatchSearchQueries({ commit }, batchId) {
      let queries = {}
      try {
        queries = await api.getBatchSearchQueries(batchId)
      } finally {
        commit(SINGLE_BATCH_SEARCH_QUERIES, queries)
      }
    },
    async hasBatchSearch({ commit }) {
      try {
        const batchSearches = await api.getBatchSearches()
        commit(HAS_BATCH_SEARCH, batchSearches.total > 0)
      } catch (e) {
        commit(HAS_BATCH_SEARCH, false)
      }
    },
    async getBatchSearches(
      { commit },
      {
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
      }
    ) {
      let batchSearches = []
      try {
        batchSearches = await api.getBatchSearches(
          from,
          size,
          sort,
          order,
          query,
          field,
          project,
          state,
          batchDate,
          publishState
        )
      } catch (_) {
        batchSearches = {
          items: [],
          total: 0
        }
      }
      commit(TOTAL, batchSearches.total)
      commit(BATCH_SEARCHES, batchSearches.items)
    },
    async onSubmit(
      { commit, dispatch },
      { name, csvFile, description, projects, phraseMatch, fuzziness, fileTypes, paths, published }
    ) {
      // send the new batch search
      await api.batchSearch(name, csvFile, description, projects, phraseMatch, fuzziness, fileTypes, paths, published)
      commit(HAS_BATCH_SEARCH, true)
      // get all batch searches including the new one
      return dispatch('getBatchSearches', {})
    },
    async getBatchSearchResults({ commit }, { batchId, from, size, queries, sort, order }) {
      let results = []
      try {
        results = await api.getBatchSearchResults(batchId, from, size, queries, sort, order)
      } catch (_) {
        results = []
      }
      commit(RESULTS, results)
    },
    async deleteBatchSearch({ commit }, { batchId }) {
      try {
        await api.deleteBatchSearch(batchId)
        commit(REMOVE_BATCH_SEARCH, batchId)
        return true
      } catch (_) {
        return false
      }
    },
    async updateBatchSearch(_, { batchId, published }) {
      try {
        await api.updateBatchSearch(batchId, published)
      } catch (_) {
        // TODO do something
      }
    },
    async deleteBatchSearches({ commit }) {
      try {
        await api.deleteBatchSearches()
        commit(CLEAR_BATCH_SEARCH)
        return {}
      } finally {
        // TODO do something
      }
    }
  }
}

export function batchStoreBuilder(api) {
  return {
    namespaced: true,
    state,
    mutations,
    getters,
    actions: actionBuilder(api)
  }
}
