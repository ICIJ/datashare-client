import Vue from 'vue'
import Vuex from 'vuex'

import document from './modules/document'
import search from './modules/search'
import indexing from './modules/indexing'
import treeView from './modules/treeView'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: { document, search, indexing, treeView },
  strict: process.env.NODE_ENV !== 'production'
})
