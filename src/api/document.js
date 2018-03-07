// Custom API for datashare
// @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/extending_core_components.html
export default function docPlugin (Client, config, components) {
  // Get a doc
  Client.prototype.getDoc = function (_id, cb) {
    return this.transport.request({
      method: 'GET',
      path: `${process.env.CONFIG.es_index}/doc/${_id}`
    }, cb)
  }
}
