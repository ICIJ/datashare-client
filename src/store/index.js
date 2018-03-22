import Vue from 'vue'
import Vuex from 'vuex'

import search from './modules/search'
import document from './modules/document'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: { search, document },
  strict: process.env.NODE_ENV !== 'production'
})
