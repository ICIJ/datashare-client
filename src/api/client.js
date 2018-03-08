import noop from 'lodash/noop'
import elasticsearch from 'elasticsearch-browser'
import Document from './Document'

// Custom API for datashare
// @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/extending_core_components.html
export function docPlugin (Client, config, components) {
  Client.prototype.getDocument = function (id, cb = noop) {
    return this.transport.request({
      method: 'GET',
      path: `${process.env.CONFIG.es_index}/doc/${id}`
    }, (err, raw) => cb(err, new Document(raw)))
  }
}

const client = new elasticsearch.Client({
  host: process.env.CONFIG.es_host || window.location.hostname + ':9200',
  // Use the custom api
  plugins: [ docPlugin ]
})

export default client
