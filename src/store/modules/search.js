import esClient from '@/api/esClient'
import Response from '@/api/Response'
import types from '@/utils/types.json'
import { FacetDate, FacetNamedEntity, FacetPath, FacetText, levels } from '@/store/facetsStore'

import castArray from 'lodash/castArray'
import each from 'lodash/each'
import filter from 'lodash/filter'
import find from 'lodash/find'
import floor from 'lodash/floor'
import get from 'lodash/get'
import max from 'lodash/max'
import reduce from 'lodash/reduce'
import uniq from 'lodash/uniq'

export function initialState () {
  return {
    query: '*',
    from: 0,
    size: 25,
    globalSearch: false,
    facets: [
      new FacetText('content-type', 'contentType', true, item => get(types, [item.key, 'label'], item.key)),
      new FacetText('language', 'language', true, item => {
        if (!item.key) return ''
        item = item.key.toString()
        return item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()
      }),
      new FacetNamedEntity('named-entity-person', 'byMentions', true, 'PERSON'),
      new FacetNamedEntity('named-entity-organization', 'byMentions', true, 'ORGANIZATION'),
      new FacetNamedEntity('named-entity-location', 'byMentions', true, 'LOCATION'),
      new FacetPath('path', 'byDirname', false),
      new FacetDate('indexing-date', 'extractionDate', false, item => item.key_as_string),
      new FacetText('extraction-level', 'extractionLevel', false, item => get(levels, item.key, item.key))
    ],
    sort: 'relevance',
    response: Response.none(),
    isReady: true,
    index: process.env.VUE_APP_ES_INDEX
  }
}

export const state = initialState

export const getters = {
  getFacet (state) {
    return predicate => find(state.facets, predicate)
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
  activeFacets (state) {
    return filter(state.facets, f => f.hasValues())
  },
  findFacet (state) {
    return name => find(state.facets, { name })
  },
  toRouteQuery (state) {
    return {
      q: state.query,
      size: state.size,
      sort: state.sort,
      index: state.index,
      ...reduce(state.facets, (memo, facetValue) => {
        // We need to look for the facet's definition in order to us its `id`
        // as key for tge URL params. This was we track configured facet instead
        // of arbitrary values provided by the user. This allow to retreive special
        // behaviors depending on the facet definition.
        const facet = find(state.facets, { name: facetValue.name })
        // We don't add facetValue that match with any existing facets
        // defined in the `aggregation` store.
        if (facet && facetValue.values.length > 0) {
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
  setGlobalSearch (state, globalSearch) {
    state.globalSearch = globalSearch
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
  index (state, index) {
    state.index = index
    state.response = Response.none()
  },
  buildResponse (state, raw) {
    state.isReady = true
    state.response = new Response(raw)
  },
  setFacets (state, facets) {
    state.facets = facets
  },
  addFacet (state, facet) {
    if (find(state.facets, {name: facet.name})) {
      throw new Error('Facet already exists')
    }
    return state.facets.push(facet)
  },
  addFacetValue (state, facet) {
    // We cast the new facet values to allow several new values at the same time
    const values = castArray(facet.value)
    // Look for existing facet for this name
    const existingFacet = find(state.facets, { name: facet.name })
    if (existingFacet) {
      existingFacet.values = uniq(existingFacet.values.concat(values))
    } else {
      throw new Error(`cannot find facet named ${facet.name}`)
    }
  },
  clear (state) {
    return state.facets.splice(0, state.facets.length)
  },
  removeFacetValue (state, facet) {
    // Look for facet for this name
    const existingFacet = find(state.facets, { name: facet.name })
    if (existingFacet) {
      // Filter the values for this name to remove the given value
      existingFacet.values = filter(existingFacet.values, value => value !== facet.value)
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
  query ({ state, commit }, queryOrParams = { index: state.index, query: state.query, from: state.from, size: state.size, sort: state.sort }) {
    commit('index', (typeof queryOrParams === 'string' || queryOrParams instanceof String || typeof queryOrParams.index === 'undefined' ? state.index : queryOrParams.index))
    commit('query', typeof queryOrParams === 'string' || queryOrParams instanceof String || typeof queryOrParams.query === 'undefined' ? queryOrParams : queryOrParams.query)
    commit('from', typeof queryOrParams === 'string' || queryOrParams instanceof String || typeof queryOrParams.from === 'undefined' ? state.from : queryOrParams.from)
    commit('size', typeof queryOrParams === 'string' || queryOrParams instanceof String || typeof queryOrParams.size === 'undefined' ? state.size : queryOrParams.size)
    commit('sort', typeof queryOrParams === 'string' || queryOrParams instanceof String || typeof queryOrParams.sort === 'undefined' ? state.sort : queryOrParams.sort)
    commit('isReady', false)
    return esClient.searchDocs(state.index, state.query, state.facets, state.from, state.size, state.sort).then(raw => {
      commit('buildResponse', raw)
      return raw
    })
  },
  queryFacet ({ state, getters }, params) {
    return esClient.searchFacet(
      state.index,
      getters.getFacet({name: params.name}),
      state.query,
      state.facets,
      state.globalSearch,
      params.options
    ).then(raw => new Response(raw))
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
  updateFromRouteQuery ({ state, commit }, query) {
    // Reset all existing options
    commit('reset')
    // Add the query to the state with a mutation to not triggering a search
    if (query.index) commit('index', query.index)
    if (query.q) commit('query', query.q)
    if (query.size) commit('size', query.size)
    if (query.sort) commit('sort', query.sort)
    // Iterate over the list of facet
    each(state.facets, facet => {
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
