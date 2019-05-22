import esClient from '@/api/esClient'
import Response from '@/api/Response'
import { getDocumentTypeLabel, getExtractionLevelTranslationKey } from '@/utils/utils'
import { FacetDate, FacetNamedEntity, FacetPath, FacetText, namedEntityCategoryTranslation } from '@/store/facetsStore'
import lucene from 'lucene'
import castArray from 'lodash/castArray'
import concat from 'lodash/concat'
import drop from 'lodash/drop'
import dropRight from 'lodash/dropRight'
import each from 'lodash/each'
import endsWith from 'lodash/endsWith'
import filter from 'lodash/filter'
import find from 'lodash/find'
import get from 'lodash/get'
import head from 'lodash/head'
import includes from 'lodash/includes'
import join from 'lodash/join'
import last from 'lodash/last'
import map from 'lodash/map'
import reduce from 'lodash/reduce'
import split from 'lodash/split'
import uniq from 'lodash/uniq'

export function initialState () {
  return {
    query: '',
    from: 0,
    size: 25,
    globalSearch: true,
    facets: [
      new FacetText('content-type', 'contentType', true, item => getDocumentTypeLabel(item.key)),
      new FacetText('language', 'language', false, item => `facet.lang.${item.key}`),
      new FacetNamedEntity('named-entity-person', 'byMentions', true, namedEntityCategoryTranslation['named-entity-person']),
      new FacetNamedEntity('named-entity-organization', 'byMentions', true, namedEntityCategoryTranslation['named-entity-organization']),
      new FacetNamedEntity('named-entity-location', 'byMentions', true, namedEntityCategoryTranslation['named-entity-location']),
      new FacetPath('path', 'byDirname', false),
      new FacetDate('indexing-date', 'extractionDate', false, item => item.key_as_string),
      new FacetText('extraction-level', 'extractionLevel', false, item => getExtractionLevelTranslationKey(item.key)),
      new FacetDate('creation-date', 'metadata.tika_metadata_creation_date', false, item => item.key_as_string)
    ],
    sort: 'relevance',
    response: Response.none(),
    isReady: true,
    index: '',
    showFilters: true
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
      from: state.from,
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
  },
  retrieveQueryTerms (state) {
    let terms = []
    function getTerm (object, path, start, operator) {
      const term = get(object, join([path, 'term'], '.'), '')
      const field = get(object, join([path, 'field'], '.'), '')
      const prefix = get(object, join([path, 'prefix'], '.'), '')
      const negation = ['-', '!'].includes(prefix) || start === 'NOT' || endsWith(operator, 'NOT')
      if (term !== '*' && term !== '' && !includes(map(terms, 'label'), term)) {
        terms = concat(terms, { field: field === '<implicit>' ? '' : field, label: term, negation })
      }
    }
    function retTerms (query, operator) {
      getTerm(query, 'left', get(query, 'start', null), operator)
      if (get(query, 'right.left', null) === null) {
        getTerm(query, 'right', null, get(query, 'operator', null))
      } else {
        retTerms(get(query, 'right'), get(query, 'operator', null))
      }
    }
    retTerms(lucene.parse(state.query), null)
    return terms
  }
}

export const mutations = {
  reset (state, excludedKeys = ['index']) {
    // acquire initial state
    const s = initialState()
    Object.keys(s).forEach(key => {
      if (excludedKeys.indexOf(key) === -1) {
        state[key] = s[key]
      }
    })
  },
  setGlobalSearch (state, globalSearch) {
    state.globalSearch = globalSearch
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
    if (find(state.facets, { name: facet.name })) {
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
  addFacetValues (state, { facet, values }) {
    // Look for existing facet for this name
    const existingFacet = find(state.facets, { name: facet.name })
    if (existingFacet) {
      existingFacet.values = values
    } else {
      throw new Error(`cannot find facet named ${facet.name}`)
    }
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
  },
  resetFacetValues (state, name) {
    const existingFacet = find(state.facets, { name })
    if (existingFacet) {
      existingFacet.values = []
    }
  },
  toggleFilters (state) {
    state.showFilters = !state.showFilters
  }
}

export const actions = {
  reset ({ commit, dispatch }, excludedKeys) {
    commit('reset', excludedKeys)
    return dispatch('query')
  },
  query ({ state, commit }, queryOrParams = { index: state.index, query: state.query, from: state.from, size: state.size, sort: state.sort }) {
    commit('index', typeof queryOrParams === 'string' || queryOrParams instanceof String || typeof queryOrParams.index === 'undefined' ? state.index : queryOrParams.index)
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
      getters.getFacet({ name: params.name }),
      state.query,
      state.facets,
      state.globalSearch,
      params.options
    ).then(raw => new Response(raw))
  },
  queryFacetGlobally ({ state, getters }, params) {
    return esClient.searchFacet(
      state.index,
      getters.getFacet({ name: params.name }),
      '*',
      state.facets,
      true,
      params.options
    ).then(raw => new Response(raw))
  },
  addFacetValue ({ commit, dispatch }, facet) {
    commit('addFacetValue', facet)
    return dispatch('query')
  },
  removeFacetValue ({ commit, dispatch }, facet) {
    commit('removeFacetValue', facet)
    return dispatch('query')
  },
  resetFacetValues ({ commit, dispatch }, name) {
    commit('resetFacetValues', name)
    return dispatch('query')
  },
  toggleFacet ({ commit, dispatch }, name) {
    commit('toggleFacet', name)
    return dispatch('query')
  },
  previousPage ({ state, commit, dispatch }, name) {
    commit('from', state.from - state.size)
    return dispatch('query')
  },
  nextPage ({ state, commit, dispatch }, name) {
    commit('from', state.from + state.size)
    return dispatch('query')
  },
  updateFromRouteQuery ({ state, commit }, query) {
    // Reset all existing options
    commit('reset', ['index', 'globalSearch'])
    // Add the query to the state with a mutation to not triggering a search
    if (query.index) commit('index', query.index)
    if (query.q) commit('query', query.q)
    if (query.from) commit('from', query.from)
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
  },
  deleteQueryTerm ({ state, commit, dispatch }, term) {
    const booleanOperators = ['AND', 'OR']
    let newQuery = filter(split(state.query, ' '), i => i !== term)
    if (includes(booleanOperators, last(newQuery))) {
      newQuery = dropRight(newQuery)
    }
    if (includes(booleanOperators, head(newQuery))) {
      newQuery = drop(newQuery)
    }
    commit('query', newQuery.length === 0 ? '*' : join(newQuery, ' '))
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
