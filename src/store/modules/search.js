import esClient from '@/api/esClient'
import Response from '@/api/Response'

import castArray from 'lodash/castArray'
import each from 'lodash/each'
import filter from 'lodash/filter'
import find from 'lodash/find'
import floor from 'lodash/floor'
import max from 'lodash/max'
import reduce from 'lodash/reduce'
import remove from 'lodash/remove'
import uniq from 'lodash/uniq'

export function initialState () {
  return {
    query: '*',
    from: 0,
    size: 25,
    facets: [],
    sort: 'relevance',
    response: Response.none(),
    isReady: true
  }
}

export const state = initialState

export const getters = {
  getQuery (state) {
    return state.query
  },
  getFrom (state) {
    return state.from
  },
  getSize (state) {
    return state.size
  },
  getSort (state) {
    return state.sort
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
      size: state.size,
      sort: state.sort,
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
  reset (state) {
    // acquire initial state
    const s = initialState()
    Object.keys(s).forEach(key => {
      state[key] = s[key]
    })
  },
  resetFacets (state) {
    state.facets.slice(0, state.facets.length)
  },
  query (state, query) {
    state.query = query
    state.response = Response.none()
  },
  from (state, from) {
    state.from = Number(from)
    state.response = Response.none()
  },
  size (state, size) {
    state.size = Number(size)
    state.response = Response.none()
  },
  sort (state, sort) {
    state.sort = sort
    state.response = Response.none()
  },
  isReady (state, isReady = !state.isReady) {
    state.isReady = isReady
  },
  buildResponse (state, raw) {
    state.isReady = true
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
  excludeFacet (state, name) {
    // Look for facet for this name
    const existingFacet = find(state.facets, { name })
    if (existingFacet) {
      existingFacet.reverse = true
    }
  },
  toggleFacet (state, name) {
    // Look for facet for this name
    const existingFacet = find(state.facets, { name })
    if (existingFacet) {
      existingFacet.reverse = !existingFacet.reverse
    }
  }
}

export const actions = {
  reset ({ commit, dispatch }, name) {
    commit('reset')
    return dispatch('query')
  },
  resetFacets ({ commit, dispatch }, name) {
    commit('resetFacets')
    return dispatch('query')
  },
  query ({ state, commit }, queryOrParams = { query: state.query, from: state.from, size: state.size, sort: state.sort }) {
    commit('query', typeof queryOrParams === 'string' || queryOrParams instanceof String ? queryOrParams : queryOrParams.query)
    commit('from', typeof queryOrParams === 'string' || queryOrParams instanceof String ? state.from : queryOrParams.from)
    commit('size', typeof queryOrParams === 'string' || queryOrParams instanceof String ? state.size : queryOrParams.size)
    commit('sort', typeof queryOrParams === 'string' || queryOrParams instanceof String ? state.sort : queryOrParams.sort)
    commit('isReady', false)
    return esClient.searchDocs(state.query, state.facets, state.from, state.size, state.sort).then(raw => {
      commit('buildResponse', raw)
      return raw
    })
  },
  firstPage ({ commit, dispatch }) {
    commit('from', 0)
    return dispatch('query')
  },
  previousPage ({ state, commit, dispatch }) {
    commit('from', max([0, state.from - state.size]))
    return dispatch('query')
  },
  nextPage ({ state, commit, dispatch }) {
    const nextFrom = state.from + state.size
    nextFrom < state.response.total ? commit('from', nextFrom) : commit('from', state.from)
    return dispatch('query')
  },
  lastPage ({ state, commit, dispatch }) {
    // Calculate the "from" parameter to display the last page
    commit('from', state.size * floor(state.response.total / state.size))
    return dispatch('query')
  },
  addFacetValue ({ commit, dispatch }, facet) {
    commit('addFacetValue', facet)
    return dispatch('query')
  },
  removeFacetValue ({ commit, dispatch }, facet) {
    commit('removeFacetValue', facet)
    return dispatch('query')
  },
  toggleFacet ({ commit, dispatch }, name) {
    commit('toggleFacet', name)
    return dispatch('query')
  },
  updateFromRouteQuery ({ commit, rootState }, query) {
    // Reset all existing options
    commit('reset')
    // Add the query to the state with a mutation to not triggering a search
    if (query.q) commit('query', query.q)
    if (query.size) commit('size', query.size)
    if (query.sort) commit('sort', query.sort)
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
          if (index) commit('excludeFacet', facet.name)
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
