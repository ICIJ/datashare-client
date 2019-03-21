import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import document from './modules/document'
import userHistory from './modules/userHistory'
import indexing from './modules/indexing'
import search from './modules/search'
import treeView from './modules/treeView'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: { document, search, indexing, treeView, userHistory },
  strict: process.env.NODE_ENV !== 'production',
  plugins: [
    createPersistedState({
      paths: ['userHistory']
    })
  ]
})
