import es from 'elasticsearch-browser'
import bodybuilder from 'bodybuilder'
import each from 'lodash/each'

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
  Client.prototype.searchDocs = function (query, facets = []) {
    // We're going to build the body step by step
    const body = bodybuilder()
    // Add facet one by one as "might"
    // TODO: ensure the filter is working!
    each(facets, facet => body.andFilter('term', facet.field, facet.values[0]))
    // Add the query string to the body
    body.orQuery('query_string', { query, default_field: 'content' })
    // Add match for namedentity containing the query string
    body.orQuery('has_child', 'type', 'NamedEntity', {
      'inner_hits': {
        'size': 30
      }
    }, sub => {
      return sub.query('match', 'mention', query)
    })
    // Add an option to exclude the content
    body.rawOption('_source', { includes: ['*'], excludes: ['content'] })
    // Add an option to highlight fragments in the results
    body.rawOption('highlight', {
      fields: {
        content: {
          fragment_size: 150,
          number_of_fragments: 10,
          pre_tags: ['<mark>'],
          post_tags: ['</mark>']
        }
      }
    })
    // Return a promise that build the body composed above
    return this.search({
      index: process.env.CONFIG.es_index,
      type: 'doc',
      size: 200,
      body: body.build()
    })
  }
}

const client = new es.Client({
  host: process.env.CONFIG.es_host || window.location.hostname + ':9200',
  plugins: [ docPlugin, searchPlugin ]
})

export default client
