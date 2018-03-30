import client from '@/api/client'
import Response from '@/api/Response'

import castArray from 'lodash/castArray'
import each from 'lodash/each'
import find from 'lodash/find'
import filter from 'lodash/filter'
import reduce from 'lodash/reduce'
import remove from 'lodash/remove'
import uniq from 'lodash/uniq'

export const state = {
  query: '',
  facets: [],
  response: Response.none()
}

export const getters = {
  getQuery (state) {
    return state.query
  },
  hasFacetValue (state) {
    return item => !!find(state.facets, facet => {
      return facet.name === item.name && facet.values.indexOf(item.value) > -1
    })
  },
  hasFacetValues (state) {
    return name => !!find(state.facets, facet => {
      return facet.name === name && facet.values.length > 0
    })
  },
  isFacetReversed (state) {
    return name => {
      return !!find(state.facets, facet => {
        return facet.name === name && facet.reverse
      })
    }
  },
  findFacet (state) {
    return name => find(state.facets, { name })
  },
  toRouteQuery (state, getters, rootState) {
    return {
      q: state.query,
      ...reduce(state.facets, (memo, facetValue) => {
        // We need to look for the facet's definition in order to us its `id`
        // as key for tge URL params. This was we track configured facet instead
        // of arbitrary values provided by the user. This allow to retreive special
        // behaviors depending on the facet definition.
        const facet = find(rootState.aggregation.facets, { name: facetValue.name })
        // We don't add facetValue that match with any existing facets
        // defined in the `aggregation` store.
        if (facet) {
          const key = facetValue.reverse ? `f[-${facet.name}]` : `f[${facet.name}]`
          memo[key] = facetValue.values
        }
        return memo
      }, {})
    }
  }
}

export const mutations = {
  clear (state) {
    state.query = ''
    state.facets = []
    state.response = Response.none()
  },
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
    // Look for existing facet for this name
    const existingFacet = find(state.facets, { name: facet.name })
    if (existingFacet) {
      existingFacet.values = uniq(existingFacet.values.concat(values))
    } else {
      state.facets.push({ name: facet.name, values, reverse: false })
    }
  },
  removeFacetValue (state, facet) {
    // Look for facet for this name
    const existingFacet = find(state.facets, { name: facet.name })
    if (existingFacet) {
      // Filter the values for this name to remove the given value
      existingFacet.values = filter(existingFacet.values, value => value !== facet.value)
      // If the facet is now empty (no values)...
      if (existingFacet.values.length === 0) {
        // ... we can remove it
        remove(state.facets, { name: existingFacet.name })
      }
    }
  },
  invertFacet (state, name, toggler = null) {
    // Look for facet for this name
    const existingFacet = find(state.facets, { name })
    if (existingFacet) {
      existingFacet.reverse = toggler !== null ? toggler : !existingFacet.reverse
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
  invertFacet ({ commit, dispatch }, name) {
    commit('invertFacet', name)
    return dispatch('query')
  },
  updateFromRouteQuery ({ commit, rootState }, query) {
    // Clear all existing options
    commit('clear')
    // Add the query to the state with a mutation to not triggering a search
    if (query.q) commit('query', query.q)
    // Iterate over the list of facet
    each(rootState.aggregation.facets, facet => {
      // The facet key are formatted in the URL as follow.
      // See `query-string` for more info about query string format.
      each([`f[${facet.name}]`, `f[-${facet.name}]`], (key, index) => {
        // Add the data if the value exist
        if (query.hasOwnProperty(key)) {
          // Because the values are grouped for each query parameter and because
          // the `addFacetValue` also accept an array of value, we can directly
          // use the query values.
          commit('addFacetValue', facet.itemParam({ key: query[key] }))
          // Invert the facet if we are using the second key (for reverse facet)
          commit('invertFacet', facet.name, index > 0)
        }
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations
}
