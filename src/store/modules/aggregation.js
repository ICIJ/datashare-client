import client from '@/api/client'
import Response from '@/api/Response'
import FacetText from '@/components/FacetText'

import bodybuilder from 'bodybuilder'
import find from 'lodash/find'

export const state = {
  facets: [
    {
      name: 'content-type',
      type: FacetText.name,
      body: bodybuilder().agg('terms', 'contentType', 'contentType')
    }
  ]
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
  getters
}
