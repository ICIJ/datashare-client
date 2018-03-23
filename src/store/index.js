import Vue from 'vue'
import Vuex from 'vuex'

import aggregation from './modules/aggregation'
import document from './modules/document'
import search from './modules/search'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: { aggregation, document, search },
  strict: process.env.NODE_ENV !== 'production'
})
