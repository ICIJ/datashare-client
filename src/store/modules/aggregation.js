import esClient from '@/api/esClient'
import Response from '@/api/Response'
import types from '@/utils/types.json'

import bodybuilder from 'bodybuilder'
import every from 'lodash/every'
import find from 'lodash/find'
import get from 'lodash/get'

import {FacetText, FacetDate, FacetPath, FacetNamedEntity, levels} from './facets'
import each from 'lodash/each'
import castArray from 'lodash/castArray'

function initialState () {
  return {
    globalSearch: false,
    facets: [
      new FacetText('content-type', 'contentType', true, item => get(types, [item.key, 'label'], item.key)),
      new FacetText('language', 'language', true, item => {
        if (!item.key) return ''
        item = item.key.toString()
        return item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()
      }),
      new FacetNamedEntity('named-entity-person', 'byMentions', true, 'PERSON'),
      new FacetNamedEntity('named-entity-location', 'byMentions', true, 'LOCATION'),
      new FacetNamedEntity('named-entity-organization', 'byMentions', true, 'ORGANIZATION'),
      new FacetPath('path', 'byDirname', false),
      new FacetDate('indexing-date', 'extractionDate', false, item => item.key_as_string),
      new FacetText('extraction-level', 'extractionLevel', false, item => get(levels, item.key, item.key))
    ]
  }
}

const isAValidFacet = facet => {
  return every(['name', 'type', 'isSearchable', 'body'], p => facet.hasOwnProperty(p))
}

export const state = initialState

export const mutations = {
  reset (state) {
    // acquire initial state
    const s = initialState()
    Object.keys(s).forEach(key => { state[key] = s[key] })
  },
  clear (state) {
    return state.facets.splice(0, state.facets.length)
  },
  setGlobalSearch (state, globalSearch) {
    state.globalSearch = globalSearch
  },
  setFacets (state, facets) {
    state.facets = facets
  },
  addFacet (state, facet) {
    if (!isAValidFacet(facet)) {
      throw new Error('Facet is malformed')
    }
    if (find(state.facets, {name: facet.name})) {
      throw new Error('Facet already exists')
    }
    return state.facets.push(facet)
  }
}

export const getters = {
  getFacet (state) {
    return predicate => find(state.facets, predicate)
  },
  buildFacetBody (state, getters, rootState) {
    return predicate => {
      // Find the Bodybuilder instance for this facet using a predicate
      const facet = getters.getFacet(predicate)
      const body = facet.body(bodybuilder())
      // If the aggregation must not be global (relative to a search)
      // we add the query conditions to the body.
      if (!state.globalSearch) {
        addFacetsToBody(rootState.search.facets, getters, body)
        esClient.addQueryToBody(rootState.search.query, body)
      }
      // We finally build the body with no docs (size 0) to avoid loading
      // content twice.
      return body.size(0).build()
    }
  }
}

export const actions = {
  query ({ commit, dispatch, getters }, facetPredicate) {
    return esClient.search({
      index: process.env.VUE_APP_ES_INDEX,
      type: 'doc',
      size: 0,
      body: getters.buildFacetBody(facetPredicate)
    }).then(raw => new Response(raw))
  },
  searchFacet ({ commit, dispatch, getters, rootState }, params) {
    let facet = getters.getFacet({name: params.name})
    let body = facet.body(bodybuilder(), params.options)
    if (!rootState.aggregation.globalSearch) {
      addFacetsToBody(rootState.search.facets, getters, body)
      esClient.addQueryToBody(rootState.search.query, body)
    }
    return esClient.search({index: process.env.VUE_APP_ES_INDEX, body: body.build()})
  }
}

function addFacetsToBody (facetOrFacets, getters, body) {
  each(castArray(facetOrFacets), facetValue => {
    const facet = getters.getFacet({ name: facetValue.name })
    return facet.addFilter(body, facetValue)
  })
}

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations
}
