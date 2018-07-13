import esClient from '@/api/esClient'
import Response from '@/api/Response'
import FacetText from '@/components/FacetText'
import FacetNamedEntity from '@/components/FacetNamedEntity'
import FacetPath from '@/components/FacetPath'
import types from '@/utils/types.json'

import bodybuilder from 'bodybuilder'
import every from 'lodash/every'
import find from 'lodash/find'
import get from 'lodash/get'

function initialState () {
  return {
    facets: [
      {
        name: 'content-type',
        key: 'contentType',
        type: FacetText.name,
        itemParam: (item) => ({ name: 'content-type', value: item.key }),
        itemLabel: (item) => get(types, [item.key, 'label'], item.key),
        body: (body) => body.agg('terms', 'contentType', 'contentType')
      },
      {
        name: 'language',
        key: 'language',
        type: FacetText.name,
        itemParam: (item) => ({ name: 'language', value: item.key }),
        body: (body) => body.agg('terms', 'language', 'language')
      },
      {
        name: 'named-entity',
        key: 'mentions',
        type: FacetNamedEntity.name,
        itemParam: (item) => item.key,
        body: (body) => body
          .query('term', 'type', 'NamedEntity')
          .agg('terms', 'mentionNorm', 'mentions', {
            'size': 50,
            'order': [ {'docs': 'desc'}, {'_count': 'desc'} ]
          }, sub => sub.agg('cardinality', 'join#Document', 'docs'))
      },
      {
        name: 'path',
        key: 'path',
        type: FacetPath.name,
        itemParam: (item) => item.key,
        body: (body) => body.agg('terms', 'path', 'path')
      }
    ]
  }
}

const isAValidFacet = facet => {
  return every(['name', 'type', 'body'], p => facet.hasOwnProperty(p))
}

export const state = initialState

export const mutations = {
  reset (state) {
    // acquire initial state
    const s = initialState()
    Object.keys(s).forEach(key => { state[key] = s[key] })
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
      // Find the Bodybuilder instance for this faet using a predicate
      const body = getters.getFacet(predicate).body(bodybuilder())
      // The aggregation must not be global (but relative to a search)
      // we add the query conditions to the body.
      esClient.addFacetsToBody(rootState.search.facets, body)
      esClient.addQueryToBody(rootState.search.query, body)
      // We finally build the body with no docs (size 0) to avoid loading
      // content twice.
      return body.size(0).build()
    }
  }
}

export const actions = {
  query ({ commit, dispatch, getters }, facetPredicate) {
    return esClient.search({
      index: process.env.CONFIG.es_index,
      type: 'doc',
      size: 0,
      body: getters.buildFacetBody(facetPredicate)
    }).then(raw => new Response(raw))
  }
}

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations
}
