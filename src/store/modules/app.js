import Vue from 'vue'

export const state = () => ({
  sidebar: {
    reduced: true
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
