export const state = () => ({
  redirectAfterLogin: null,
  sidebar: {
    compact: false,
    closed: false
  }
})

export const mutations = {
  sidebarCompact(state, compact) {
    state.sidebar.compact = compact
  },
  sidebarClosed(state, closed) {
    state.sidebar.closed = closed
  },
  setRedirectAfterLogin(state, path = null) {
    if (!path || !path.startsWith('/login')) {
      state.redirectAfterLogin = path
    }
  }
}

export const actions = {
  toggleSidebarCompact({ state, commit }, toggler = null) {
    if (toggler === null) {
      return commit('sidebarCompact', !state.sidebar.compact)
    }
    return commit('sidebarCompact', toggler)
  },
  toggleSidebarClosed({ state, commit }, toggler = null) {
    if (toggler === null) {
      return commit('sidebarClosed', !state.sidebar.closed)
    }
    return commit('sidebarClosed', toggler)
  },
  popRedirectAfterLogin({ state: { redirectAfterLogin }, commit }) {
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
