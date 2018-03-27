import client from '@/api/client'
import Response from '@/api/Response'

import castArray from 'lodash/castArray'
import find from 'lodash/find'
import filter from 'lodash/filter'
import remove from 'lodash/remove'
import uniq from 'lodash/uniq'

export const state = {
  query: '',
  facets: [],
  response: Response.none()
}

export const getters = {
  hasFacetValue (state) {
    return item => !!find(state.facets, facet => {
      return facet.field === item.field && facet.values.indexOf(item.value) > -1
    })
  },
  hasFacetValues (state) {
    return field => !!find(state.facets, facet => {
      return facet.field === field && facet.values.length > 0
    })
  },
  isFacetReversed (state) {
    return field => {
      return !!find(state.facets, facet => {
        return facet.field === field && facet.reverse
      })
    }
  }
}

export const mutations = {
  query (state, query) {
    state.query = query
    state.response = Response.none()
  },
  buildResponse (state, raw) {
    state.response = new Response(raw)
  },
  addFacetValue (state, facet) {
    // We cast the new facet values to allow several new values at the same time
    const values = castArray(facet.value)
    // Look for existing facet for this field
    const existingFacet = find(state.facets, { field: facet.field })
    if (existingFacet) {
      existingFacet.values = uniq(existingFacet.values.concat(values))
    } else {
      state.facets.push({ field: facet.field, values, reverse: false })
    }
  },
  removeFacetValue (state, facet) {
    // Look for facet for this field
    const existingFacet = find(state.facets, { field: facet.field })
    if (existingFacet) {
      // Filter the values for this field to remove the given value
      existingFacet.values = filter(existingFacet.values, value => value !== facet.value)
      // If the facet is now empty (no values)...
      if (existingFacet.values.length === 0) {
        // ... we can remove it
        remove(state.facets, { field: existingFacet.field })
      }
    }
  },
  invertFacet (state, field) {
    // Look for facet for this field
    const existingFacet = find(state.facets, { field })
    if (existingFacet) {
      existingFacet.reverse = !existingFacet.reverse
    }
  }
}

export const actions = {
  query ({ state, commit }, query = state.query) {
    commit('query', query)
    return client.searchDocs(query, state.facets).then(raw => { commit('buildResponse', raw) })
  },
  addFacetValue ({ commit, dispatch }, facet) {
    commit('addFacetValue', facet)
    return dispatch('query')
  },
  removeFacetValue ({ commit, dispatch }, facet) {
    commit('removeFacetValue', facet)
    return dispatch('query')
  },
  invertFacet ({ commit, dispatch }, field) {
    commit('invertFacet', field)
    return dispatch('query')
  }
}

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations
}
