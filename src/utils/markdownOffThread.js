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

// One failure path for every way the worker can die: an error event, a
// structured-clone failure (messageerror carries no id), or a render that never
// answers (the browser can kill an OOM worker without any event). A wedged
// worker blocks its whole queue, so every pending render fails, not just the
// one that timed out.
function failWorker(message) {
  pendingRenders.forEach((pending, id) => {
    settle(id)?.reject(new Error(message))
  })
  worker?.terminate()
  worker = null
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
    const timer = setTimeout(() => failWorker('Markdown worker timed out'), RENDER_TIMEOUT)
    pendingRenders.set(id, { resolve, reject, timer })
    try {
      getWorker().postMessage({ id, source, base })
    }
    catch {
      settle(id)
      renderInline(source).then(resolve).catch(reject)
    }
  })
}
