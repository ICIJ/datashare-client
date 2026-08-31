const RENDER_TIMEOUT = 120000

let worker = null
let lastRenderId = 0
const pendingRenders = new Map()

// Imported dynamically so the unified stack stays out of the main bundle: the
// worker chunk is the only place it is statically reachable from.
async function renderInline(source) {
  const { renderMarkdown } = await import('@/utils/markdown')
  return renderMarkdown(source)
}

function settle(id) {
  const pending = pendingRenders.get(id)
  if (!pending) {
    return null
  }
  pendingRenders.delete(id)
  clearTimeout(pending.timer)
  return pending
}

function onWorkerMessage({ data: { id, html, error } }) {
  const pending = settle(id)
  if (!pending) {
    return
  }
  if (error === undefined) {
    pending.resolve(html)
  }
  else {
    pending.reject(new Error(error))
  }
}

// One failure path for the ways the worker can die without naming a render: an
// error event, or a structured-clone failure (messageerror carries no id).
// Nothing says which render broke it, so every pending render fails.
function failWorker(message) {
  pendingRenders.forEach((pending, id) => {
    settle(id)?.reject(new Error(message))
  })
  worker?.terminate()
  worker = null
}

// The worker answers in posting order, so the first timer to fire belongs to
// the render the worker is stuck on (or the browser killed it OOM, without any
// event). Only that render fails: the queued ones behind it never started, so
// they are reposted to a fresh worker instead of failing along with it.
function timeoutRender(id) {
  settle(id)?.reject(new Error('Markdown worker timed out'))
  worker?.terminate()
  worker = null
  repostPendingRenders()
}

function repostPendingRenders() {
  try {
    pendingRenders.forEach(({ source, base }, id) => {
      getWorker().postMessage({ id, source, base })
    })
  }
  catch {
    failWorker('Markdown worker could not be restarted')
  }
}

function getWorker() {
  if (!worker) {
    const spawned = new Worker(new URL('./markdown.worker.js', import.meta.url), { type: 'module' })
    spawned.onmessage = onWorkerMessage
    // A late event from a worker already replaced by failWorker must not
    // terminate its healthy successor.
    spawned.onerror = (error) => {
      if (worker === spawned) {
        failWorker(error?.message || 'Worker initialization failed')
      }
    }
    spawned.onmessageerror = () => {
      if (worker === spawned) {
        failWorker('Worker reply could not be deserialized')
      }
    }
    worker = spawned
  }
  return worker
}

/**
 * Render markdown in a shared Web Worker so a large document cannot freeze
 * the page. Falls back to an inline render where workers do not exist (jsdom)
 * or cannot be constructed (a worker-src CSP).
 *
 * @param {string} source - Raw markdown text.
 * @returns {Promise<string>} Sanitized HTML (empty string for empty input).
 */
export function renderMarkdownOffThread(source) {
  if (!source) {
    return Promise.resolve('')
  }
  if (typeof Worker === 'undefined') {
    return renderInline(source)
  }
  const id = ++lastRenderId
  const base = window.location.href
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => timeoutRender(id), RENDER_TIMEOUT)
    pendingRenders.set(id, { resolve, reject, timer, source, base })
    try {
      getWorker().postMessage({ id, source, base })
    }
    catch {
      settle(id)
      renderInline(source).then(resolve).catch(reject)
    }
  })
}
