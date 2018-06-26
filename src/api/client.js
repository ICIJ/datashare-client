import es from 'elasticsearch-browser'
import bodybuilder from 'bodybuilder'
import each from 'lodash/each'

import store from '@/store'

// Custom API for datashare
// @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/extending_core_components.html
export function docPlugin (Client, config, components) {
  // This plugin defines method to handle common EsDoc request.
  // Currently we supporte only to type of data: Document & NamedEntity.
  // Both have a dedicated class, children of EsDoc

  Client.prototype.getEsDoc = function (id, routing = null) {
    return this.get({index: process.env.CONFIG.es_index, type: 'doc', id: id, routing: routing})
  }
  Client.prototype.getNamedEntities = function (docId, routing = null) {
    var body = bodybuilder().query('parent_id', {type: 'NamedEntity', id: docId}).build()
    return this.search({
      index: process.env.CONFIG.es_index,
      type: 'doc',
      size: 200,
      routing: routing,
      body: body
    })
  }
}

export function searchPlugin (Client, config, components) {
  Client.prototype.addFacetsToBody = function (facets, body) {
    // Add facet one by one as a MUST filter
    each(facets, facetValue => {
      // Find the facet's definition for the given value
      const facet = store.getters['aggregation/getFacet']({ name: facetValue.name })
      // A reversed facetValue means we want to exclude the value
      if (facetValue.reverse) {
        return body.notFilter('terms', facet.key, facetValue.values)
      } else {
        return body.addFilter('terms', facet.key, facetValue.values)
      }
    })
  }

  Client.prototype.addQueryToBody = function (query, body) {
    // Create a top-level "MUST query" which contain a "SHOULD query" including
    // a query_string and NamedEntity. If we don't add a `match_all` query,
    // Bodybuilder ignores the query context, a MUST, and replace it by the none
    // mentioned in the nested query.
    //
    // @TODO: Test this!!
    body.query('match_all').addQuery('bool', b => b
      // Add the query string to the body
      .orQuery('query_string', { query, default_field: 'content' })
      // Add match for namedentity containing the query string
      .orQuery('has_child', 'type', 'NamedEntity', {
        'inner_hits': {
          'size': 30
        }
      }, sub => sub.query('match', 'mention', query)))
  }

  Client.prototype.searchDocs = function (query, facets = [], from = 0, size = 25) {
    // We're going to build the body step by step
    const body = bodybuilder().from(from).size(size)
    this.addFacetsToBody(facets, body)
    this.addQueryToBody(query, body)
    // Add an option to exclude the content
    body.rawOption('_source', { includes: ['*'], excludes: ['content'] })
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
    // Return a promise that build the body composed above
    return this.search({
      index: process.env.CONFIG.es_index,
      type: 'doc',
      body: body.build()
    })
  }
}

const client = new es.Client({
  host: process.env.CONFIG.es_host || window.location.hostname + ':' + window.location.port + '/api/search',
  plugins: [ docPlugin, searchPlugin ]
})

export default client
