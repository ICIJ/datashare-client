import { get } from 'lodash'

import { LAYOUTS } from '@/enums/layouts'

export const state = () => ({
  redirectAfterLogin: null,
  sidebar: {
    compact: false,
    closed: false
  },
  settings: {
    closed: true,
    views: {
      projectList: {
        layout: LAYOUTS.TABLE,
        orderBy: ['name', 'asc'],
        perPage: 25
      },
      search: {
        layout: LAYOUTS.LIST,
        orderBy: ['_score', 'desc'],
        perPage: 25,
        properties: ['title', 'thumbnail', 'highlights', 'project']
      },
      taskList: {
        orderBy: ['name', 'desc'],
        perPage: 10,
        properties: ['id', 'name', 'createdAt', 'progress', 'result', 'state']
      }
    }
  },
  filters: {
    close: true
  },
  pins: {
    projects: []
  }
})

export const mutations = {
  sidebarCompact(state, compact) {
    state.sidebar.compact = compact
  },
  sidebarClosed(state, closed) {
    state.sidebar.closed = closed
  },
  settingsClosed(state, closed) {
    state.settings.closed = closed
  },
  filtersClosed(state, closed) {
    state.filters.closed = closed
  },
  setSettings(state, { view, ...settings }) {
    if (view in state.settings.views) {
      state.settings.views[view] = { ...state.settings.views[view], ...settings }
    }
  },
  setRedirectAfterLogin(state, path = null) {
    if (!path || !path.startsWith('/login')) {
      state.redirectAfterLogin = path
    }
  },
  pinProject(state, name) {
    if (!state.pins.projects.includes(name)) {
      state.pins.projects.push(name)
    }
  },
  unpinProject(state, name) {
    state.pins.projects = state.pins.projects.filter((n) => n !== name)
  }
}

export const getters = {
  getSettings(state) {
    return (view, name) => {
      return get(state.settings.views, [view, name].join('.'))
    }
  },
  isProjectPinned(state) {
    return (name) => state.pins.projects.includes(name)
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
  toggleSettingsClosed({ state, commit }, toggler = null) {
    if (toggler === null) {
      return commit('settingsClosed', !state.settings.closed)
    }
    return commit('settingsClosed', toggler)
  },
  toggleFiltersClosed({ state, commit }, toggler = null) {
    if (toggler === null) {
      return commit('filtersClosed', !state.filters.closed)
    }
    return commit('filtersClosed', toggler)
  },
  popRedirectAfterLogin({ state: { redirectAfterLogin }, commit }) {
    commit('setRedirectAfterLogin', null)
    return redirectAfterLogin
  }
}

export default {
  namespaced: true,
  getters,
  actions,
  mutations,
  state
}
