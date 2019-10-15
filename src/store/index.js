import some from 'lodash/some'
import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import batchSearch from './modules/batchSearch'
import document from './modules/document'
import indexing from './modules/indexing'
import search from './modules/search'
import treeView from './modules/treeView'
import userHistory from './modules/userHistory'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: { batchSearch, document, indexing, search, treeView, userHistory },
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
