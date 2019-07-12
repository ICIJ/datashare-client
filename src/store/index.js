import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import batchSearches from './modules/batchSearches'
import document from './modules/document'
import indexing from './modules/indexing'
import search from './modules/search'
import treeView from './modules/treeView'
import userHistory from './modules/userHistory'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: { batchSearches, document, indexing, search, treeView, userHistory },
  strict: process.env.NODE_ENV !== 'production',
  plugins: [
    createPersistedState({
      paths: ['userHistory']
    })
  ]
})
