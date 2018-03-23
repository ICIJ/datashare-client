import client from '@/api/client'
import Response from '@/api/Response'
import FacetText from '@/components/FacetText'
import FacetNamedEntity from '@/components/FacetNamedEntity'

import bodybuilder from 'bodybuilder'
import every from 'lodash/every'
import find from 'lodash/find'

export const state = {
  global: true,
  facets: [
    {
      name: 'content-type',
      type: FacetText.name,
      key: 'contentType',
      body: bodybuilder().agg('terms', 'metadata.tika_metadata_content_type.keyword', 'contentType')
    },
    {
      name: 'named-entity',
      type: FacetNamedEntity.name,
      key: 'mentions',
      body: bodybuilder()
        .query('term', 'type', 'NamedEntity')
        .agg('terms', 'mentionNorm', 'mentions', {
          'size': 15,
          'order': [ {'docs': 'desc'}, {'_count': 'desc'} ]
        }, sub => sub.agg('cardinality', 'join#Document', 'docs'))
    }
  ]
}

const isAValidFacet = facet => {
  return every(['name', 'type', 'body'], p => facet.hasOwnProperty(p))
}

export const mutations = {
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
  }
}

export const actions = {
  query ({ commit, dispatch, getters }, facetPredicate) {
    return client.search({
      index: process.env.CONFIG.es_index,
      type: 'doc',
      size: 0,
      body: getters.getFacet(facetPredicate).body.build()
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
