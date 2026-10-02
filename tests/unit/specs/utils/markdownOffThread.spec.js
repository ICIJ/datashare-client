import { renderMarkdownOffThread } from '@/utils/markdownOffThread'

describe('renderMarkdownOffThread', () => {
  it('resolves an empty string without touching Worker', async () => {
    const constructor = vi.fn()
    vi.stubGlobal('Worker', constructor)
    try {
      await expect(renderMarkdownOffThread('')).resolves.toBe('')
      expect(constructor).not.toHaveBeenCalled()
    }
    finally {
      vi.unstubAllGlobals()
    }
  })

  it('renders inline when the environment has no Worker (jsdom)', async () => {
    expect(typeof Worker).toBe('undefined')
    const html = await renderMarkdownOffThread('# Hello')
    expect(html).toContain('<h1 id="hello">Hello</h1>')
  })

  // Stubbing Worker caches the fake in the module's singleton, so this test
  // must stay after every test that relies on the inline fallback above.
  it('resolves and rejects through the worker protocol', async () => {
    class FakeWorker {
      onmessage = null

      postMessage({ id, source }) {
        const reply = source === 'bad' ? { id, error: 'boom' } : { id, html: `<p>${source}</p>` }
        queueMicrotask(() => this.onmessage({ data: reply }))
      }
    }
    vi.stubGlobal('Worker', FakeWorker)
    try {
      await expect(renderMarkdownOffThread('good')).resolves.toBe('<p>good</p>')
      await expect(renderMarkdownOffThread('bad')).rejects.toThrow('boom')
    }
    finally {
      vi.unstubAllGlobals()
    }
  })

  it('rejects pending renders when the worker fails to initialize', async () => {
    // Reload the module to clear the cached worker singleton from previous tests
    vi.resetModules()
    const { renderMarkdownOffThread: freshRenderMarkdownOffThread } = await import('@/utils/markdownOffThread')

    let workerCount = 0
    class FailingWorker {
      onerror = null

      constructor() {
        workerCount++
      }

      postMessage() {
        queueMicrotask(() => this.onerror(new Error('worker died')))
      }

      terminate() {}
    }
    vi.stubGlobal('Worker', FailingWorker)
    try {
      await expect(freshRenderMarkdownOffThread('test')).rejects.toThrow('worker died')
      expect(workerCount).toBe(1)
      // Next call constructs a fresh worker since the previous one was reset to null
      await expect(freshRenderMarkdownOffThread('retry')).rejects.toThrow('worker died')
      expect(workerCount).toBe(2)
    }
    finally {
      vi.unstubAllGlobals()
    }
  })

  it('falls back to an inline render when the worker cannot be posted to', async () => {
    vi.resetModules()
    const { renderMarkdownOffThread: freshRenderMarkdownOffThread } = await import('@/utils/markdownOffThread')

    class UnusableWorker {
      postMessage() {
        throw new Error('worker-src blocked')
      }

      terminate() {}
    }
    vi.stubGlobal('Worker', UnusableWorker)
    try {
      const html = await freshRenderMarkdownOffThread('# Hello')
      expect(html).toContain('<h1 id="hello">Hello</h1>')
    }
    finally {
      vi.unstubAllGlobals()
    }
  })

  it('rejects pending renders when a worker reply cannot be deserialized', async () => {
    vi.resetModules()
    const { renderMarkdownOffThread: freshRenderMarkdownOffThread } = await import('@/utils/markdownOffThread')

    class UndeserializableWorker {
      onmessageerror = null

      postMessage() {
        queueMicrotask(() => this.onmessageerror(new MessageEvent('messageerror')))
      }

      terminate() {}
    }
    vi.stubGlobal('Worker', UndeserializableWorker)
    try {
      await expect(freshRenderMarkdownOffThread('test')).rejects.toThrow('Worker reply could not be deserialized')
    }
    finally {
      vi.unstubAllGlobals()
    }
  })

  it('fails only the stuck render on timeout and moves the queued ones to a fresh worker', async () => {
    vi.resetModules()
    const { renderMarkdownOffThread: freshRenderMarkdownOffThread } = await import('@/utils/markdownOffThread')

    vi.useFakeTimers()
    const spawned = []
    class StuckWorker {
      onmessage = null

      constructor() {
        spawned.push(this)
        this.posted = []
      }

      postMessage(message) {
        this.posted.push(message)
      }

      terminate() {}
    }
    vi.stubGlobal('Worker', StuckWorker)
    try {
      const stuck = freshRenderMarkdownOffThread('stuck')
      // The timer below rejects this promise before the assertion attaches its
      // own handler, so a no-op one keeps the rejection from going unhandled.
      stuck.catch(() => {})
      // The queued render is requested a moment later, so only the stuck one
      // reaches its deadline when the clock advances by the render timeout.
      vi.advanceTimersByTime(10)
      const queued = freshRenderMarkdownOffThread('queued')
      vi.advanceTimersByTime(119990)
      await expect(stuck).rejects.toThrow('Markdown worker timed out')
      expect(spawned).toHaveLength(2)
      const [, freshWorker] = spawned
      const { id } = freshWorker.posted.find(({ source }) => source === 'queued')
      freshWorker.onmessage({ data: { id, html: '<p>queued</p>' } })
      await expect(queued).resolves.toBe('<p>queued</p>')
    }
    finally {
      vi.useRealTimers()
      vi.unstubAllGlobals()
    }
  })

  it('ignores a late error from a worker that was already replaced', async () => {
    vi.resetModules()
    const { renderMarkdownOffThread: freshRenderMarkdownOffThread } = await import('@/utils/markdownOffThread')

    const spawned = []
    class LateErrorWorker {
      onmessage = null
      onerror = null

      constructor() {
        spawned.push(this)
      }

      postMessage({ id, source }) {
        if (source === 'first') {
          queueMicrotask(() => this.onerror(new Error('worker died')))
          return
        }
        queueMicrotask(() => this.onmessage({ data: { id, html: `<p>${source}</p>` } }))
      }

      terminate() {}
    }
    vi.stubGlobal('Worker', LateErrorWorker)
    try {
      await expect(freshRenderMarkdownOffThread('first')).rejects.toThrow('worker died')
      const [firstWorker] = spawned
      const second = freshRenderMarkdownOffThread('second')
      firstWorker.onerror(new Error('late echo'))
      await expect(second).resolves.toBe('<p>second</p>')
      expect(spawned).toHaveLength(2)
    }
    finally {
      vi.unstubAllGlobals()
    }
  })
})
