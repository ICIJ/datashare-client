import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import document from './modules/document'
import search from './modules/search'
import indexing from './modules/indexing'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: { document, search, indexing },
  plugins: [
    createPersistedState({
      paths: ['search'],
      filter: (mutation) => {
        // Only for search mutations
        return mutation.type.indexOf('search/') === 0
      }
    })
  ],
  strict: process.env.NODE_ENV !== 'production'
})
