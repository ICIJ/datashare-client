import es from 'elasticsearch-browser'

// Custom API for datashare
// @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/extending_core_components.html
export function docPlugin (Client, config, components) {
  // This plugin defines method to handle common EsDoc request.
  // Currently we supporte only to type of data: Document & NamedEntity.
  // Both have a dedicated class, children of EsDoc

  Client.prototype.getEsDoc = function (id, routing = null) {
    return this.get({index: process.env.CONFIG.es_index, type: 'doc', id: id, routing: routing})
  }
}

const client = new es.Client({
  host: process.env.CONFIG.es_host || window.location.hostname + ':9200',
  // Use the custom api
  plugins: [ docPlugin ]
})

export default client
