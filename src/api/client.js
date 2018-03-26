import es from 'elasticsearch-browser'
import bodybuilder from 'bodybuilder'

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
  Client.prototype.searchDocs = function (query) {
    return this.search({
      index: process.env.CONFIG.es_index,
      type: 'doc',
      size: 200,
      body: bodybuilder()
        .orQuery('query_string', {
          query,
          default_field: 'content'
        })
        .orQuery('has_child', 'type', 'NamedEntity', {
          'inner_hits': {
            'size': 30
          }
        }, sub => {
          return sub.query('match', 'mention', query)
        })
        .rawOption('_source', {
          includes: ['*'],
          excludes: ['content']
        })
        .rawOption('highlight', {
          fields: {
            content: {
              fragment_size: 150,
              number_of_fragments: 10,
              pre_tags: ['<mark>'],
              post_tags: ['</mark>']
            }
          }
        })
        .build()
    })
  }
}

const client = new es.Client({
  host: process.env.CONFIG.es_host || window.location.hostname + ':9200',
  plugins: [ docPlugin, searchPlugin ]
})

export default client
