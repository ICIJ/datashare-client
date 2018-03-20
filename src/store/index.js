import Vue from 'vue'
import Vuex from 'vuex'

import search from './modules/search'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: { search },
  strict: process.env.NODE_ENV !== 'production'
})
