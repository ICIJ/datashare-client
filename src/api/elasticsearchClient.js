import axios from 'axios'

/**
 * Minimal stand-in for elasticsearch-browser's `Client`/`Transport` pair,
 * built on axios (already a dependency) instead of a bundled HTTP/transport
 * stack. Datashare only ever talks to one known ES endpoint over plain HTTP —
 * none of elasticsearch-browser's connection pooling, node sniffing, or
 * multi-transport support is used, so none of it needs to ship to the browser.
 *
 * Implements just enough of the classic client's shape (`Client.prototype`,
 * `components.Transport.prototype`, a `plugins` constructor option) that
 * `datasharePlugin`/`csrfPlugin` in elasticsearch.js keep working completely
 * unchanged — only this file and elasticsearch.js's final `new es.Client(...)`
 * call differ from the elasticsearch-browser-based version.
 */

/**
 * Drops undefined values so axios' query-string serializer omits the key
 * entirely rather than serializing it as an empty string.
 */
function compactQuery(params = {}) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined))
}

/**
 * Issues raw HTTP requests to the ES endpoint. The one seam `csrfPlugin`
 * patches (`Transport.prototype.request`) to inject a header on every call.
 */
export class Transport {
  constructor({ host, requestTimeout } = {}) {
    this.baseURL = /^https?:\/\//.test(host) ? host : `${window.location.protocol}//${host}`
    this.requestTimeout = requestTimeout
  }

  /**
   * @param {Object} params
   * @param {string} [params.method='GET']
   * @param {string} params.path - ES REST path, e.g. '/my-index/_search'
   * @param {Object} [params.query] - Query-string parameters
   * @param {Object} [params.body] - JSON request body
   * @param {Object} [params.headers]
   * @returns {Promise & { abort: Function }} Resolves with the response body;
   *   `.abort()` cancels the in-flight request (mirrors the old client's
   *   abortable-promise return value, which callers already rely on).
   */
  request({ method = 'GET', path, query, body, headers } = {}) {
    const controller = new AbortController()
    const promise = axios({
      method,
      baseURL: this.baseURL,
      url: path,
      params: compactQuery(query),
      data: body,
      headers,
      timeout: this.requestTimeout,
      signal: controller.signal
    }).then(response => response.data)
    promise.abort = () => controller.abort()
    return promise
  }
}

/**
 * The only 4 primitives Datashare's own `datasharePlugin` actually builds on:
 * a constructor, `get`, `search`, `count`, and `this.transport.request` for
 * the async_search endpoints the plain client doesn't wrap.
 */
export class Client {
  constructor({ host, requestTimeout, plugins = [] } = {}) {
    this.transport = new Transport({ host, requestTimeout })
    plugins.forEach(plugin => plugin(Client, {}, { Transport }))
  }

  get({ index, id, ...params }) {
    return this.transport.request({
      method: 'GET',
      path: `/${index}/_doc/${encodeURIComponent(id)}`,
      query: params
    })
  }

  search({ index, body, ...params }) {
    return this.transport.request({
      method: 'POST',
      path: `/${index}/_search`,
      query: params,
      body
    })
  }

  count({ index, body, ...params }) {
    return this.transport.request({
      method: 'POST',
      path: `/${index}/_count`,
      query: params,
      body
    })
  }
}
