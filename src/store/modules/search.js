import client from '@/api/client'
import Response from '@/api/Response'

import castArray from 'lodash/castArray'
import find from 'lodash/find'
import uniq from 'lodash/uniq'

export const state = {
  query: '',
  facets: [],
  response: Response.none()
}

export const mutations = {
  query (state, query) {
    state.query = query
    state.response = Response.none()
  },
  buildResponse (state, raw) {
    state.response = new Response(raw)
  },
  addFacet (state, facet) {
    // We cast the new facet values to allow several new values at the same time
    const values = castArray(facet.value)
    // Look for existing facet for this field
    const existingFacet = find(state.facets, { field: facet.field })
    if (existingFacet) {
      existingFacet.values = uniq(existingFacet.values.concat(values))
    } else {
      state.facets.push({ field: facet.field, values })
    }
  }
}

export const actions = {
  query ({ state, commit }, query = state.query) {
    commit('query', query)
    return client.searchDocs(query, state.facets).then(raw => { commit('buildResponse', raw) })
  },
  addFacet ({ commit, dispatch }, facet) {
    commit('addFacet', facet)
    return dispatch('query')
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
