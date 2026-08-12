import axios from 'axios'

/**
 * Minimal stand-in for elasticsearch-browser's `Client`/`Transport` pair,
 * built on axios (already a dependency) instead of a bundled HTTP/transport
 * stack. Datashare only ever talks to one known ES endpoint over plain HTTP —
 * none of elasticsearch-browser's connection pooling, node sniffing, or
 * multi-transport support is used, so none of it needs to ship to the browser.
 *
 * Implements just enough of the classic client's shape (`Client.prototype`,
 * `components.Transport.prototype`) that `datasharePlugin`/`csrfPlugin` in
 * elasticsearch.js keep working unchanged, applied once at module scope
 * there rather than per-instance (nothing here clones the prototype).
 */

/**
 * Joins array values into comma-separated lists (`_source=a,b`): ES keeps
 * only the last value of a repeated query param. Axios already drops
 * undefined/null values from the query string.
 */
function compactQuery(params = {}) {
  const joinArrays = ([key, value]) => [key, Array.isArray(value) ? value.join(',') : value]
  return Object.fromEntries(Object.entries(params).map(joinArrays))
}

/**
 * elasticsearch-browser silently retried every request up to 3 times by
 * default on connection-level failures (never on an actual HTTP error
 * response), all transport-side with no app-code opt-in. Number of retries
 * beyond the initial attempt, matching that default.
 */
const DEFAULT_MAX_RETRIES = 3

/**
 * Whether a failed request is worth retrying: connection-level failures only
 * (DNS, dropped connection), never a timeout or an actual HTTP error
 * response - none of those get a different answer on replay.
 */
function isRetryable(error) {
  const timedOut = error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT'
  return !error?.response && !timedOut
}

/**
 * Decorates a failed request with elasticsearch-browser's error shape
 * (`.status`, `.displayName`, and a `.message` built from ES's own error
 * body) so code written against that shape keeps working unchanged.
 */
function decorateError(error) {
  const { response } = error
  if (response) {
    error.status = response.status
    error.displayName = response.statusText ? response.statusText.replace(/\s+/g, '') : undefined
    const rootCause = response.data?.error?.root_cause
    if (Array.isArray(rootCause) && rootCause.length) {
      error.message = rootCause.map(({ type, reason }) => `[${type}] ${reason}`).join(' (and) ')
    }
  }
  else {
    const timedOut = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
    error.displayName = timedOut ? 'RequestTimeout' : 'ConnectionFault'
  }
  return error
}

/**
 * Issues one attempt, retrying on connection-level failure until `attemptsLeft`
 * is exhausted or the shared signal has been aborted.
 */
async function requestWithRetries(config, attemptsLeft) {
  try {
    const response = await axios(config)
    return response.data
  }
  catch (error) {
    if (config.signal.aborted) {
      throw error
    }
    if (attemptsLeft <= 0 || !isRetryable(error)) {
      throw decorateError(error)
    }
    return requestWithRetries(config, attemptsLeft - 1)
  }
}

/**
 * Issues raw HTTP requests to the ES endpoint. The one seam `csrfPlugin`
 * patches (`Transport.prototype.request`) to inject a header on every call.
 */
export class Transport {
  constructor({ host, requestTimeout = 30000, maxRetries = DEFAULT_MAX_RETRIES } = {}) {
    this.baseURL = /^https?:\/\//.test(host) ? host : `${window.location.protocol}//${host}`
    this.requestTimeout = requestTimeout
    this.maxRetries = maxRetries
  }

  /**
   * @param {Object} params
   * @param {string} [params.method='GET']
   * @param {string} params.path - ES REST path, e.g. '/my-index/_search'
   * @param {Object} [params.query] - Query-string parameters
   * @param {Object} [params.body] - JSON request body
   * @param {Object} [params.headers]
   * @returns {Promise & { abort: Function }} Resolves with the response body;
   *   `.abort()` cancels the in-flight request, including any retry still to
   *   come (mirrors the old client's abortable-promise return value, which
   *   callers already rely on).
   */
  request({ method = 'GET', path, query, body, headers } = {}) {
    const controller = new AbortController()
    const config = {
      method,
      baseURL: this.baseURL,
      url: path,
      params: compactQuery(query),
      data: body,
      headers,
      timeout: this.requestTimeout,
      signal: controller.signal
    }
    const promise = requestWithRetries(config, this.maxRetries)
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
  constructor({ host, requestTimeout, maxRetries } = {}) {
    this.transport = new Transport({ host, requestTimeout, maxRetries })
  }

  get({ index, id, ...params }) {
    return this.transport.request({
      method: 'GET',
      path: `/${index}/_doc/${encodeURIComponent(id)}`,
      query: params
    })
  }

  getSource({ index, id, ...params }) {
    return this.transport.request({
      method: 'GET',
      path: `/${index}/_source/${encodeURIComponent(id)}`,
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
