import { castArray, findLastIndex, flatten } from 'lodash'
import { toRaw } from 'vue'

import diff from '@/utils/diff'

export const state = () => ({
  steps: []
})

export const mutations = {
  push(state, query) {
    const split = (value) => value.split(',')
    query.indices = flatten(castArray(query.indices).map(split))
    state.steps.push(query)
  }
}

export const actions = {
  push({ commit, getters }, query) {
    if (!getters.exists(query)) {
      commit('push', query)
    }
  }
}

export const getters = {
  exists(state) {
    return (query) => {
      return state.steps.includes(query)
    }
  },
  journey(state) {
    return state.steps.reduce((result, step, index) => {
      const query = toRaw(step)
      const previousQuery = index === 0 ? {} : toRaw(state.steps[index - 1])
      return [...result, { ...diff(previousQuery, query) }]
    }, [])
  },
  paramLastIndex(state, getters) {
    return (param, value) => {
      return findLastIndex(getters.journey, ({ $additions, $updates }) => {
        return $additions?.[param]?.includes(value) || $updates?.[param]?.$additions?.includes(value)
      })
    }
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
