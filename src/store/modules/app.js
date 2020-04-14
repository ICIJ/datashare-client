import Vue from 'vue'
import { isNarrowScreen } from '@/utils/screen'

export const state = () => ({
  sidebar: {
    // Quick and dirty responsive default value
    reduced: isNarrowScreen()
  }
})

export const mutations = {
  sidebarReduced (state, reduced) {
    Vue.set(state.sidebar, 'reduced', reduced)
  }
}

export const actions = {
  toggleSidebar ({ state, commit }, toggler = null) {
    if (toggler === null) {
      return commit('sidebarReduced', !state.sidebar.reduced)
    }
    return commit('sidebarReduced', toggler)
  }
}

export default {
  namespaced: true,
  actions,
  mutations,
  state
}
