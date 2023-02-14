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
  NB_BATCH_SEARCHES
} from '@/store/mutation-types'

export function initialState() {
  return {
    batchSearch: {},
    batchSearches: [],
    results: [],
    queries: {},
    selectedQueries: [],
    total: 0,
    nbBatchSearches: 0
  }
}

export const state = initialState()

export const getters = {
  queryKeys(state) {
    return map(state.queries, (count, label) => ({ label, count }))
  },
  nbSelectedQueries(state) {
    return state.selectedQueries?.length ?? 0
  },
  hasBatchSearch(state) {
    return state.nbBatchSearches > 0
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
    const removed = remove(state.batchSearches, (batchSearch) => batchSearch.uuid === batchId)
    if (removed.length) {
      state.total = state.total - 1
      state.nbBatchSearches = state.nbBatchSearches - 1
    }
  },
  [CLEAR_BATCH_SEARCH](state) {
    state.batchSearches = []
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
  [NB_BATCH_SEARCHES](state, nbBatchSearches) {
    state.nbBatchSearches = nbBatchSearches
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
        publishState = null,
        init = false
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
      if (init) {
        commit(NB_BATCH_SEARCHES, batchSearches.total)
      }
    },
    async onSubmit(
      { commit, dispatch },
      { name, csvFile, description, projects, phraseMatch, fuzziness, fileTypes, paths, published }
    ) {
      // send the new batch search
      await api.batchSearch(name, csvFile, description, projects, phraseMatch, fuzziness, fileTypes, paths, published)
      // get all batch searches including the new one
      return dispatch('getBatchSearches', { init: true })
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
