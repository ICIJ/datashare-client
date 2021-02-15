import some from 'lodash/some'
import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import app from './modules/app'
import batchSearch from './modules/batchSearch'
import document from './modules/document'
import documentNotes from './modules/documentNotes'
import hooks from './modules/hooks'
import indexing from './modules/indexing'
import insights from './modules/insights'
import pipelines from './modules/pipelines'
import search from './modules/search'
import settings from './modules/settings'
import treeView from './modules/treeView'
import userHistory from './modules/userHistory'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    app,
    batchSearch,
    document,
    documentNotes,
    hooks,
    indexing,
    insights,
    pipelines,
    search,
    settings,
    treeView,
    userHistory
  },
  strict: process.env.NODE_ENV === 'development',
  plugins: [
    createPersistedState({
      paths: [
        'app.redirectAfterLogin',
        'search.query',
        'search.size',
        'search.values',
        'search.reversed',
        'search.contextualized',
        'search.sort',
        'search.field',
        'search.index',
        'search.showFilters',
        'search.layout',
        'userHistory'
      ],
      filter (mutation) {
        // Only for some mutations
        return some(['search/', 'userHistory/', 'app/'], k => mutation.type.indexOf(k) === 0)
      },
      rehydrated (store) {
        // This a temporary retro-compatibility fix to ensure persisted
        // search's states are not corrupted for some users.
        store.commit('search/resetFilters')
      }
    })
  ]
})
