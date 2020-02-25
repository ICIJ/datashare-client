import some from 'lodash/some'
import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import batchSearch from './modules/batchSearch'
import config from './modules/config'
import document from './modules/document'
import documentNotes from './modules/documentNotes'
import hooks from './modules/hooks'
import indexing from './modules/indexing'
import insights from './modules/insights'
import search from './modules/search'
import treeView from './modules/treeView'
import userHistory from './modules/userHistory'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: { batchSearch, config, document, documentNotes, hooks, indexing, insights, search, treeView, userHistory },
  strict: process.env.NODE_ENV === 'development',
  plugins: [
    createPersistedState({
      paths: [
        'userHistory',
        'search.query',
        'search.size',
        'search.globalSearch',
        'search.values',
        'search.reversed',
        'search.sort',
        'search.field',
        'search.index',
        'search.showFilters',
        'search.layout'
      ],
      filter (mutation) {
        // Only for some mutations
        return some(['userHistory/', 'search/'], k => mutation.type.indexOf(k) === 0)
      },
      rehydrated (store) {
        // This a temporary retro-compatibility fix to ensure persisted
        // search's states are not corrupted for some users.
        store.commit('search/resetFilters')
      }
    })
  ]
})
