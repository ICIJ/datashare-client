import esClient from '@/api/esClient'
import Response from '@/api/Response'
import types from '@/utils/types.json'
import Vue from 'vue'

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

class FacetText {
  constructor (name, key, isSearchable, labelFun) {
    this.name = name
    this.key = key
    this.isSearchable = isSearchable
    this.itemLabel = labelFun
  }

  itemParam (item) {
    return { name: this.name, value: item.key }
  }

  body (body, options) {
    return body.agg('terms', this.key, this.key, options)
  }
}

class FacetDate extends FacetText {
  addFilter (body, param) {
    let gte, lte, tmp
    body.query('bool', sub => {
      param.values.forEach(date => {
        gte = new Date(parseInt(date))
        tmp = new Date(parseInt(date))
        lte = new Date(tmp.setMonth(tmp.getMonth() + 1) - 1)
        sub.orQuery('range', 'extractionDate', { gte, lte })
      })
      return sub
    })
  }

  addParentFilter (body, param) {
    return body.query('has_parent', { 'parent_type': 'Document' }, q => q.query('bool', sub => {
      let gte, lte, tmp
      param.values.forEach(date => {
        gte = new Date(parseInt(date))
        tmp = new Date(parseInt(date))
        lte = new Date(tmp.setMonth(tmp.getMonth() + 1) - 1)
        sub.orQuery('range', 'extractionDate', { gte, lte })
      })
      return sub
    }))
  }

  notFilter (body, param) {
    let gte, lte, tmp
    body.query('bool', sub => {
      param.values.forEach(date => {
        gte = new Date(parseInt(date))
        tmp = new Date(parseInt(date))
        lte = new Date(tmp.setMonth(tmp.getMonth() + 1) - 1)
        sub.notQuery('range', 'extractionDate', { gte, lte })
      })
      return sub
    })
  }

  body (body) {
    return body.agg('date_histogram', 'extractionDate', {
      interval: '1M',
      format: 'yyyy-MM'
    }, 'extractionDate')
  }
}

class FacetPath extends FacetText {
  constructor (name, key, isSearchable) {
    super(name, key, isSearchable, null)
    this.prefix = true
  }

  addFilter (body, param) {
    return body.query('bool', sub => {
      param.values.forEach(dirname => sub.orQuery('prefix', { dirname }))
      return sub
    })
  }

  addParentFilter (body, param) {
    return body.query('has_parent', { 'parent_type': 'Document' }, q => q.query('bool', sub => {
      param.values.forEach(dirname => sub.orQuery('prefix', { dirname }))
      return sub
    }))
  }

  notFilter (body, param) {
    return body.query('bool', sub => {
      param.values.forEach(dirname => sub.notQuery('prefix', { dirname }))
      return sub
    })
  }

  body (body, options) {
    return body.agg('terms', 'dirname.tree', 'byDirname', {
      size: 500,
      order: { '_key': 'asc' },
      exclude: Vue.prototype.config.dataDir + '/.*/.*',
      include: Vue.prototype.config.dataDir + '/.*',
      ...options
    })
  }
}

class FacetNamedEntity extends FacetText {
  constructor (name, key, isSearchable) {
    super(name, key, isSearchable, null)
  }

  addFilter (body, param) {
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
  }

  notFilter (body, param) {
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
  }

  body (body, options) {
    return body
      .query('term', 'type', 'NamedEntity')
      .filter('term', 'isHidden', 'false')
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
}

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
      new FacetNamedEntity('named-entity', 'byMentions', true),
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
