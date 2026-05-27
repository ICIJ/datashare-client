import settings from '@/utils/settings'

/**
 * Creates an Error tagged as an abort so callers can distinguish intentional
 * cancellation (supersede / unmount) from real failures.
 * @returns {Error}
 */
function createAbortError() {
  const error = new Error('Async search aborted')
  error.name = 'AbortError'
  return error
}

/**
 * Resolves after `ms`, or early if the signal aborts. Never rejects; the
 * caller re-checks `signal.aborted` after awaiting.
 * @param {number} ms
 * @param {AbortSignal} [signal]
 * @returns {Promise<void>}
 */
function abortableDelay(ms, signal) {
  return new Promise((resolve) => {
    if (signal?.aborted) {
      return resolve()
    }
    const onAbort = () => {
      clearTimeout(timer)
      resolve()
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener?.('abort', onAbort)
      resolve()
    }, ms)
    signal?.addEventListener?.('abort', onAbort, { once: true })
  })
}

/**
 * Fire-and-forget deletion of a stored async search. Swallows errors: a failed
 * cleanup must never surface to the user (the result expires via keep_alive).
 * @param {Object} client
 * @param {string} [id]
 */
function cleanup(client, id) {
  if (id) {
    client.deleteAsyncSearch(id).catch(() => {})
  }
}

/**
 * Runs a search via Elasticsearch's async search API: submit, then poll until
 * the result is ready, then delete the stored result. Resolves the inner
 * `response` object, which is byte-for-byte a normal `_search` response.
 *
 * Cancellation: pass an AbortSignal. When it aborts (a newer search supersedes
 * this one, or the search view unmounts) the runner stops polling, deletes the
 * stored result, and rejects with an AbortError the caller can ignore.
 *
 * @param {Object} client - The Elasticsearch client (with submit/get/deleteAsyncSearch)
 * @param {Object} request
 * @param {string} request.index - Comma-separated index list
 * @param {Object} request.body - The search body
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal]
 * @param {string} [options.waitForCompletionTimeout]
 * @param {string} [options.keepAlive]
 * @param {number} [options.pollInterval]
 * @param {number} [options.maxWait]
 * @returns {Promise<Object>} The inner search response
 */
export async function runAsyncSearch(client, { index, body }, options = {}) {
  const cfg = settings.elasticsearch.asyncSearch
  const {
    signal,
    waitForCompletionTimeout = cfg.waitForCompletionTimeout,
    keepAlive = cfg.keepAlive,
    pollInterval = cfg.pollInterval,
    maxWait = cfg.maxWait
  } = options

  const start = Date.now()
  let envelope = await client.submitAsyncSearch({ index, body, waitForCompletionTimeout, keepAlive })

  while (envelope.is_running) {
    if (signal?.aborted) {
      cleanup(client, envelope.id)
      throw createAbortError()
    }
    if (Date.now() - start >= maxWait) {
      cleanup(client, envelope.id)
      throw new Error('Async search exceeded the maximum wait time')
    }
    await abortableDelay(pollInterval, signal)
    if (signal?.aborted) {
      cleanup(client, envelope.id)
      throw createAbortError()
    }
    envelope = await client.getAsyncSearch(envelope.id, { waitForCompletionTimeout })
  }

  cleanup(client, envelope.id)
  return envelope.response
}
