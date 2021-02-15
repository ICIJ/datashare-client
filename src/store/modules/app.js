import Vue from 'vue'

export const state = () => ({
  redirectAfterLogin: null,
  sidebar: {
    reduced: true
  }
})

export const mutations = {
  sidebarReduced (state, reduced) {
    Vue.set(state.sidebar, 'reduced', reduced)
  },
  setRedirectAfterLogin (state, path = null) {
    if (!path || !path.startsWith('/login')) {
      Vue.set(state, 'redirectAfterLogin', path)
    }
  }
}

export const actions = {
  toggleSidebar ({ state, commit }, toggler = null) {
    if (toggler === null) {
      return commit('sidebarReduced', !state.sidebar.reduced)
    }
    return commit('sidebarReduced', toggler)
  },
  popRedirectAfterLogin ({ state: { redirectAfterLogin }, commit }) {
    commit('setRedirectAfterLogin', null)
    return redirectAfterLogin
  }
}

export default {
  namespaced: true,
  actions,
  mutations,
  state
}
