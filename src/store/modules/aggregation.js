import client from '@/api/client'
import Response from '@/api/Response'
import FacetText from '@/components/FacetText'
import FacetNamedEntity from '@/components/FacetNamedEntity'
import types from '@/utils/types.json'

import bodybuilder from 'bodybuilder'
import every from 'lodash/every'
import find from 'lodash/find'
import get from 'lodash/get'

export const state = {
  global: true,
  facets: [
    {
      name: 'content-type',
      label: 'File Types',
      key: 'contentType',
      type: FacetText.name,
      itemParam: (item) => ({ name: 'content-type', value: item.key }),
      itemLabel: (item) => get(types, [item.key, 'label'], item.key),
      body: bodybuilder().agg('terms', 'contentType', 'contentType')
    },
    {
      name: 'language',
      key: 'language',
      type: FacetText.name,
      itemParam: (item) => ({ name: 'language', value: item.key }),
      body: bodybuilder().agg('terms', 'language', 'language')
    },
    {
      name: 'named-entity',
      label: 'Named Entites',
      key: 'mentions',
      type: FacetNamedEntity.name,
      itemParam: (item) => item.key,
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
      body: getters.getFacet(facetPredicate).body.size(2).build()
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
