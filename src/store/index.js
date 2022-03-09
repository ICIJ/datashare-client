import some from 'lodash/some'
import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import app from './modules/app'
import batchSearch from './modules/batchSearch'
import document from './modules/document'
import documentNotes from './modules/documentNotes'
import downloads from './modules/downloads'
import hooks from './modules/hooks'
import indexing from './modules/indexing'
import insights from './modules/insights'
import pipelines from './modules/pipelines'
import recommended from './modules/recommended'
import search from './modules/search'
import settings from './modules/settings'
import starred from './modules/starred'
import treeView from './modules/treeView'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    app,
    batchSearch,
    document,
    documentNotes,
    downloads,
    hooks,
    indexing,
    insights,
    pipelines,
    recommended,
    search,
    settings,
    starred,
    treeView
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
        'search.indices',
        'search.showFilters',
        'search.layout'
      ],
      filter (mutation) {
        // Only for some mutations
        return some(['search/', 'app/'], k => mutation.type.indexOf(k) === 0)
      },
      rehydrated (store) {
        // This a temporary retro-compatibility fix to ensure persisted
        // search's states are not corrupted for some users.
        store.commit('search/resetFilters')
      }
    })
  ]
})
