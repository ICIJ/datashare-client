import { castArray, flatten, property, eq } from 'lodash'
import { toRaw } from 'vue'

import diff from '@/utils/diff'

export const state = () => ({
  steps: []
})

export const mutations = {
  push(state, { query, count }) {
    const split = (value) => value.split(',')
    query.indices = flatten(castArray(query.indices).map(split))
    state.steps.push({ query, count })
  }
}

export const actions = {
  push({ commit, getters }, { query, count = 0 }) {
    if (!getters.exists(query)) {
      commit('push', { query, count })
    }
  }
}

export const getters = {
  exists(state) {
    return (query) => {
      const eqQuery = (q) => eq(q, query)
      return state.steps.map(property('query')).some(eqQuery)
    }
  },
  journey(state) {
    return state.steps.reduce((result, step, index) => {
      const { query } = toRaw(step)
      const { query: previousQuery } = index === 0 ? { query: {} } : toRaw(state.steps[index - 1])
      return [...result, diff(previousQuery, query)]
    }, [])
  }
}

export function searchBreadcrumbStoreBuilder() {
  return {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
  }
}
