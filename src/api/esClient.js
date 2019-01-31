import bodybuilder from 'bodybuilder'

import each from 'lodash/each'
import es from 'elasticsearch-browser'
import { EventBus } from '@/utils/event-bus'
import replace from 'lodash/replace'

// Custom API for datashare
// @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/extending_core_components.html
export function datasharePlugin (Client, config, components) {
  Client.prototype.getEsDoc = function (index, id, routing = null) {
    return this.get({
      index: index,
      type: 'doc',
      id: id,
      routing: routing
    }).then(function (data) {
      return data
    }, error => {
      EventBus.$emit('http::error', error)
      return null
    })
  }

  Client.prototype.getNamedEntities = function (index, docId, routing = null) {
    return this.search({
      index: index,
      type: 'doc',
      size: 200,
      routing: routing,
      body: bodybuilder().query('parent_id', {type: 'NamedEntity', id: docId}).filter('term', 'isHidden', 'false').build()
    }).then(function (data) {
      return data
    }, error => {
      EventBus.$emit('http::error', error)
      return null
    })
  }

  Client.prototype.addQueryToBody = function (query, body) {
    // Create a top-level "MUST query" which contain a "SHOULD query" including
    // a query_string and NamedEntity. If we don't add a `match_all` query,
    // Bodybuilder ignores the query context, a MUST, and replace it by the none
    // mentioned in the nested query.
    // Escape slash by adding a backslash before it
    query = replace(query, /\//g, '\\/')
    body.query('match_all')
      .addQuery('bool', b => b
        // Add the query string to the body
        .orQuery('query_string', { query, default_field: '*' })
        // Add match for namedentity containing the query string
        .orQuery('has_parent', 'parent_type', 'Document', {
          'inner_hits': {
            'size': 30
          }
        }, sub => sub.query('match', 'content', query))
      )
  }

  Client.prototype.addSortToBody = function (sort, body) {
    let sortField
    let sortOrder
    switch (sort) {
      case 'relevance' :
        sortField = '_score'
        sortOrder = 'desc'
        break
      case 'dateNewest' :
        sortField = 'extractionDate'
        sortOrder = 'desc'
        break
      case 'dateOldest' :
        sortField = 'extractionDate'
        sortOrder = 'asc'
        break
      case 'sizeLargest' :
        sortField = 'contentLength'
        sortOrder = 'desc'
        break
      case 'sizeSmallest' :
        sortField = 'contentLength'
        sortOrder = 'asc'
        break
    }
    body.sort(sortField, sortOrder)
  }

  Client.prototype.searchDocs = function (index, query, facets = [], from = 0, size = 25, sort = 'relevance') {
    // Return a promise that build the body composed above
    return this.search({
      index: index,
      type: 'doc',
      body: this._buildBody(from, size, facets, query, sort).build()
    }).then(function (data) {
      return data
    }, error => {
      EventBus.$emit('http::error', error)
      throw error
    })
  }

  Client.prototype.searchFacet = function (index, facet, query, facets = [], isGlobalSearch = false, options = {}) {
    const body = facet.body(bodybuilder(), options)
    if (!isGlobalSearch) {
      each(facets, facet => facet.addFilter(body))
      this.addQueryToBody(query, body)
    }
    return esClient.search({
      index: index,
      type: 'doc',
      body: body.size(0).build()
    }).then(function (data) {
      return data
    }, error => {
      EventBus.$emit('http::error', error)
      throw error
    })
  }

  Client.prototype._buildBody = function (from, size, facets, query, sort) {
    const body = bodybuilder().from(from).size(size)
    this._addFacetsToBody(facets, body)
    this.addQueryToBody(query, body)
    this.addSortToBody(sort, body)
    // Select only the Documents and not the NamedEntities
    body.query('match', 'type', 'Document')
    // Add an option to exclude the content
    body.rawOption('_source', {includes: ['*'], excludes: ['content']})
    // Add an option to highlight fragments in the results
    body.rawOption('highlight', {
      fields: {
        content: {
          fragment_size: 150,
          number_of_fragments: 3,
          pre_tags: ['<mark>'],
          post_tags: ['</mark>']
        }
      }
    })
    return body
  }

  Client.prototype._addFacetsToBody = function (facets, body) {
    each(facets, facet => {
      facet.applyTo(body)
    })
  }
}

const esClient = new es.Client({
  host: process.env.VUE_APP_ES_HOST || window.location.hostname + ':' + window.location.port + '/api/index/search',
  plugins: [ datasharePlugin ]
})

export default esClient
