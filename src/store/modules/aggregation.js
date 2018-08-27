import esClient from '@/api/esClient'
import Response from '@/api/Response'
import types from '@/utils/types.json'

import bodybuilder from 'bodybuilder'
import every from 'lodash/every'
import find from 'lodash/find'
import get from 'lodash/get'

const levels = {
  '0': 'File on disk',
  '1': '1st level',
  '2': '2nd level',
  '3': '3rd level',
  '4': '4th level',
  '5': '5th level',
  '6': '6th level',
  '7': '7th level',
  '8': '8th level',
  '9': '9th level',
  '10': '10th level'
}

function initialState () {
  return {
    globalSearch: true,
    facets: [
      {
        name: 'content-type',
        key: 'contentType',
        type: 'FacetText',
        isSearchable: true,
        itemParam: item => ({ name: 'content-type', value: item.key }),
        itemLabel: item => get(types, [item.key, 'label'], item.key),
        body: (body, options) => body.agg('terms', 'contentType', 'contentType', options)
      },
      {
        name: 'language',
        key: 'language',
        type: 'FacetText',
        isSearchable: true,
        itemParam: item => ({ name: 'language', value: item.key }),
        itemLabel: item => {
          if (!item.key) return ''
          item = item.key.toString()
          return item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()
        },
        body: (body, options) => body.agg('terms', 'language', 'language', options)
      },
      {
        name: 'named-entity',
        key: 'byMentions',
        type: 'FacetNamedEntity',
        isSearchable: true,
        itemParam: item => ({ name: 'named-entity', value: item.key }),
        addFilter: (body, param) => {
          return body.addQuery('bool', b => {
            b.orQuery('has_child', 'type', 'NamedEntity', { }, sub => {
              return sub.query('query_string', {
                default_field: 'mentionNorm',
                query: param.values.map(v => `(${v})`).join(' OR ')
              })
            })

            b.orQuery('query_string', {
              default_field: 'mentionNorm',
              query: param.values.map(v => `(${v})`).join(' OR ')
            })

            return b
          })
        },
        notFilter: (body, param) => {
          return body.notQuery('bool', b => {
            b.orQuery('has_child', 'type', 'NamedEntity', { }, sub => {
              return sub.query('query_string', {
                default_field: 'mentionNorm',
                query: param.values.map(v => `(${v})`).join(' OR ')
              })
            })

            b.orQuery('query_string', {
              default_field: 'mentionNorm',
              query: param.values.map(v => `(${v})`).join(' OR ')
            })

            return b
          })
        },
        body: (body, options = {}) => {
          return body
            .query('term', 'type', 'NamedEntity')
            .agg('terms', 'mentionNorm', 'byMentions', {
              size: 50,
              order: [ {'byDocs': 'desc'}, {'_count': 'desc'} ],
              ...options
            }, sub => {
              return sub
                .agg('cardinality', 'join#Document', 'byDocs')
                .agg('terms', 'category', 'byCategories', sub => {
                  return sub.agg('cardinality', 'join#Document', 'byDocs')
                })
            })
        }
      },
      {
        name: 'path',
        key: 'path',
        type: 'FacetPath',
        isSearchable: false,
        itemParam: item => ({ name: 'path', value: item.key }),
        addFilter: (body, param) => {
          body.query('bool', sub => {
            param.values.forEach(path => sub.orQuery('prefix', { path }))
            return sub
          })
        },
        notFilter: (body, param) => {
          body.query('bool', sub => {
            param.values.forEach(path => sub.notQuery('prefix', { path }))
            return sub
          })
        },
        body: (body, options) => body.agg('terms', 'path', 'path', options)
      },
      {
        name: 'indexing-date',
        key: 'extractionDate',
        type: 'FacetText',
        isSearchable: false,
        itemParam: item => ({ name: 'indexing-date', value: item.key }),
        itemLabel: item => item.key_as_string,
        body: body => body.agg('date_histogram', 'extractionDate', {
          interval: '1M',
          format: 'yyyy-MM'
        }, 'extractionDate')
      },
      {
        name: 'extraction-level',
        key: 'extractionLevel',
        type: 'FacetText',
        isSearchable: false,
        itemParam: item => ({ name: 'extraction-level', value: item.key }),
        itemLabel: item => get(levels, item.key),
        body: body => body.agg('terms', 'extractionLevel', 'extractionLevel')
      }
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
      // Find the Bodybuilder instance for this faet using a predicate
      const body = getters.getFacet(predicate).body(bodybuilder())
      // If the aggregation must not be global (relative to a search)
      // we add the query conditions to the body.
      if (!state.globalSearch) {
        esClient.addFacetsToBody(rootState.search.facets, body)
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
  }
}

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations
}
