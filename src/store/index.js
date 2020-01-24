import createPersistedState from 'vuex-persistedstate'
import some from 'lodash/some'
import Vue from 'vue'
import Vuex from 'vuex'

import batchSearch from './modules/batchSearch'
import config from './modules/config'
import document from './modules/document'
import documentNotes from './modules/documentNotes'
import hooks from './modules/hooks'
import indexing from './modules/indexing'
import search from './modules/search'
import treeView from './modules/treeView'
import userHistory from './modules/userHistory'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: { batchSearch, config, document, documentNotes, hooks, indexing, search, treeView, userHistory },
  strict: process.env.NODE_ENV !== 'production',
  plugins: [
    createPersistedState({
      paths: ['userHistory', 'search'],
      filter (mutation) {
        // Only for some mutations
        return some(['userHistory/', 'search/'], k => mutation.type.indexOf(k) === 0)
      }
    })
  ]
})
