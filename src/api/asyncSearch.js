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
 * Fills in the configured async-search defaults for any option the caller omits.
 * Uses nullish coalescing so an explicit `0` (e.g. `maxWait: 0`) is honored.
 * @param {Object} options
 * @returns {Object} The resolved options.
 */
function resolveAsyncSearchOptions(options) {
  const asyncSearchSettings = settings.elasticsearch.asyncSearch
  return {
    signal: options.signal,
    waitForCompletionTimeout: options.waitForCompletionTimeout ?? asyncSearchSettings.waitForCompletionTimeout,
    keepAlive: options.keepAlive ?? asyncSearchSettings.keepAlive,
    pollInterval: options.pollInterval ?? asyncSearchSettings.pollInterval,
    maxWait: options.maxWait ?? asyncSearchSettings.maxWait
  }
}

/**
 * Resolves after `ms`, or early if the signal aborts. Never rejects; the caller
 * re-checks `signal.aborted` after awaiting.
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
 * @param {string} [storedSearchId]
 */
function deleteStoredSearch(client, storedSearchId) {
  if (storedSearchId) {
    client.deleteAsyncSearch(storedSearchId).catch(() => {})
  }
}

/**
 * Stops the search when it has been superseded or cancelled: frees the stored
 * result, then throws an AbortError the caller can ignore.
 * @param {Object} client
 * @param {AbortSignal} [signal]
 * @param {string} [storedSearchId]
 */
function throwIfAborted(client, signal, storedSearchId) {
  if (signal?.aborted) {
    deleteStoredSearch(client, storedSearchId)
    throw createAbortError()
  }
}

/**
 * Stops the search once the client-side ceiling has elapsed, freeing the stored
 * result so it does not linger on the server beyond keep_alive.
 * @param {Object} client
 * @param {number} deadline - Epoch ms after which the search is abandoned.
 * @param {string} [storedSearchId]
 */
function throwIfDeadlineExceeded(client, deadline, storedSearchId) {
  if (Date.now() >= deadline) {
    deleteStoredSearch(client, storedSearchId)
    throw new Error('Async search exceeded the maximum wait time')
  }
}

/**
 * Awaits an async-search request, converting an abort-triggered rejection (the
 * forwarded signal cancelled the in-flight request) into a clean AbortError and
 * freeing any stored result. Genuine failures propagate unchanged.
 * @param {Object} client
 * @param {AbortSignal} [signal]
 * @param {Function} performRequest - Issues the request and returns its promise.
 * @param {string} [storedSearchId]
 * @returns {Promise<Object>} The async search envelope.
 */
async function requestOrAbort(client, signal, performRequest, storedSearchId) {
  try {
    return await performRequest()
  }
  catch (error) {
    throwIfAborted(client, signal, storedSearchId)
    throw error
  }
}

/**
 * Submits the search and returns its first envelope: a completed result or a
 * running handle to poll.
 * @returns {Promise<Object>} The async search envelope.
 */
function submitSearch(client, { index, body }, { signal, waitForCompletionTimeout, keepAlive }) {
  return requestOrAbort(client, signal, () =>
    client.submitAsyncSearch({ index, body, waitForCompletionTimeout, keepAlive, signal }))
}

/**
 * Polls a running search once for its latest envelope.
 * @returns {Promise<Object>} The async search envelope.
 */
function pollSearch(client, storedSearchId, { signal, waitForCompletionTimeout }) {
  return requestOrAbort(client, signal, () =>
    client.getAsyncSearch(storedSearchId, { waitForCompletionTimeout, signal }), storedSearchId)
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
  const resolvedOptions = resolveAsyncSearchOptions(options)
  const { signal, pollInterval, maxWait } = resolvedOptions
  const deadline = Date.now() + maxWait

  // Kick off the search; a fast query already comes back complete on this call.
  let envelope = await submitSearch(client, { index, body }, resolvedOptions)

  // Otherwise poll until the result is ready, bailing out on cancel or ceiling.
  while (envelope.is_running) {
    throwIfAborted(client, signal, envelope.id)
    throwIfDeadlineExceeded(client, deadline, envelope.id)
    await abortableDelay(pollInterval, signal)
    throwIfAborted(client, signal, envelope.id)
    envelope = await pollSearch(client, envelope.id, resolvedOptions)
  }

  deleteStoredSearch(client, envelope.id)
  return envelope.response
}
