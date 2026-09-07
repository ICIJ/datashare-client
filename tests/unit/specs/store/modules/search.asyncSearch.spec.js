import { flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

import { useAppStore, useSearchStore } from '@/store/modules'
import { apiInstance as api } from '@/api/apiInstance'

const runAsyncSearchMock = vi.fn()
vi.mock('@/api/asyncSearch', () => ({
  runAsyncSearch: (...args) => runAsyncSearchMock(...args)
}))

const isOpenSearchMock = vi.fn()
vi.mock('@/api/indexDistribution', () => ({
  isOpenSearchDistribution: (...args) => isOpenSearchMock(...args)
}))

function emptyResponse() {
  return { hits: { hits: [], total: { value: 0 } } }
}

function deferred() {
  let resolveFn
  let rejectFn
  const promise = new Promise((resolve, reject) => {
    resolveFn = resolve
    rejectFn = reject
  })
  return { promise, resolve: resolveFn, reject: rejectFn }
}

describe('SearchStore async search wiring', () => {
  let searchStore, appStore, searchDocsSpy

  beforeEach(() => {
    setActivePinia(createPinia())
    appStore = useAppStore()
    searchStore = useSearchStore()
    searchStore.setIndex('local-index')
    appStore.setSettings('search', { perPage: 25, orderBy: ['_score', 'desc'] })
    runAsyncSearchMock.mockReset()
    isOpenSearchMock.mockReset()
    isOpenSearchMock.mockResolvedValue(false)
    searchDocsSpy = vi.spyOn(api.elasticsearch, 'searchDocs').mockResolvedValue(emptyResponse())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('passes an abort signal to the runner', async () => {
    const d = deferred()
    runAsyncSearchMock.mockReturnValue(d.promise)

    searchStore.setQuery('alpha')
    const p = searchStore.refresh()
    await flushPromises()

    const [, , options] = runAsyncSearchMock.mock.calls[0]
    expect(options.signal).toBeInstanceOf(AbortSignal)
    expect(options.signal.aborted).toBe(false)

    d.resolve(emptyResponse())
    await p
  })

  it('aborts the previous search when a new one supersedes it', async () => {
    const first = deferred()
    const second = deferred()
    runAsyncSearchMock.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)

    searchStore.setQuery('alpha')
    const p1 = searchStore.refresh()
    await flushPromises()
    const firstSignal = runAsyncSearchMock.mock.calls[0][2].signal

    searchStore.setQuery('beta')
    const p2 = searchStore.refresh()

    expect(firstSignal.aborted).toBe(true)

    second.resolve(emptyResponse())
    first.resolve(emptyResponse())
    await Promise.all([p1, p2])
  })

  it('does not clobber the current response with a superseded result', async () => {
    const first = deferred()
    const second = deferred()
    runAsyncSearchMock.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)

    searchStore.setQuery('alpha')
    const p1 = searchStore.refresh()
    await flushPromises()
    searchStore.setQuery('beta')
    const p2 = searchStore.refresh()

    // beta (the current search) resolves first, then the superseded alpha.
    second.resolve({ hits: { hits: [], total: { value: 2 } } })
    await p2
    first.resolve({ hits: { hits: [], total: { value: 9 } } })
    await p1

    expect(searchStore.total).toBe(2)
  })

  it('does not clobber or error the current response when a superseded run fails', async () => {
    const first = deferred()
    const second = deferred()
    runAsyncSearchMock.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)

    searchStore.setQuery('alpha')
    const p1 = searchStore.refresh()
    await flushPromises()
    searchStore.setQuery('beta')
    const p2 = searchStore.refresh()

    // beta (current) succeeds; the superseded alpha then fails with a real error.
    second.resolve({ hits: { hits: [], total: { value: 2 } } })
    await p2
    first.reject(new Error('boom'))
    await p1

    expect(searchStore.total).toBe(2)
    expect(searchStore.error).toBeNull()
  })

  it('ignores an AbortError without setting the error state', async () => {
    const d = deferred()
    runAsyncSearchMock.mockReturnValue(d.promise)

    searchStore.setQuery('alpha')
    const p = searchStore.refresh()
    await flushPromises()
    searchStore.cancelActiveSearch()

    const abortError = new Error('Async search aborted')
    abortError.name = 'AbortError'
    d.reject(abortError)
    await p

    expect(searchStore.error).toBeNull()
    expect(searchStore.isReady).toBe(true)
  })

  it('sets the error state on a real failure', async () => {
    const d = deferred()
    runAsyncSearchMock.mockReturnValue(d.promise)

    searchStore.setQuery('alpha')
    const p = searchStore.refresh()
    d.reject(new Error('boom'))
    await p

    expect(searchStore.error).toBeInstanceOf(Error)
    expect(searchStore.error.message).toBe('boom')
  })

  it('runs the search only once for concurrent identical queries', async () => {
    runAsyncSearchMock.mockResolvedValue(emptyResponse())

    await Promise.all([searchStore.query('bar'), searchStore.query('bar')])

    expect(runAsyncSearchMock).toHaveBeenCalledTimes(1)
  })

  describe('index distribution gating', () => {
    it('searches synchronously when the backend runs OpenSearch', async () => {
      isOpenSearchMock.mockResolvedValue(true)
      searchDocsSpy.mockResolvedValue({ hits: { hits: [], total: { value: 3 } } })

      await searchStore.query('alpha')

      expect(searchDocsSpy).toHaveBeenCalledTimes(1)
      expect(runAsyncSearchMock).not.toHaveBeenCalled()
      expect(searchStore.total).toBe(3)
    })

    it('passes the abort signal to the synchronous search', async () => {
      isOpenSearchMock.mockResolvedValue(true)

      await searchStore.query('alpha')

      const [, options] = searchDocsSpy.mock.calls[0]
      expect(options.signal).toBeInstanceOf(AbortSignal)
    })

    it('keeps the async search when the backend does not run OpenSearch', async () => {
      runAsyncSearchMock.mockResolvedValue(emptyResponse())

      await searchStore.query('alpha')

      expect(runAsyncSearchMock).toHaveBeenCalledTimes(1)
      expect(searchDocsSpy).not.toHaveBeenCalled()
    })

    it('tells the synchronous search it runs against OpenSearch', async () => {
      isOpenSearchMock.mockResolvedValue(true)

      await searchStore.query('alpha')

      const [searchParams] = searchDocsSpy.mock.calls[0]
      expect(searchParams.isOpenSearch).toBe(true)
    })

    it('builds the async search body with the Elasticsearch offset field', async () => {
      runAsyncSearchMock.mockResolvedValue(emptyResponse())
      const buildSpy = vi.spyOn(api.elasticsearch, 'buildSearchDocsBody')

      await searchStore.query('alpha')

      const [searchParams] = buildSpy.mock.calls[0]
      expect(searchParams.isOpenSearch).toBe(false)
    })

    it('treats a cancelled synchronous search as an abort, not an error', async () => {
      isOpenSearchMock.mockResolvedValue(true)
      // The transport rejects with its own error on abort, never an AbortError.
      searchDocsSpy.mockImplementation((searchParams, { signal }) => {
        return new Promise((resolve, reject) => {
          signal.addEventListener('abort', () => reject(new Error('Request aborted by the transport')))
        })
      })

      searchStore.setQuery('alpha')
      const p = searchStore.refresh()
      await flushPromises()
      searchStore.cancelActiveSearch()
      await p

      expect(searchStore.error).toBeNull()
      expect(searchStore.isReady).toBe(true)
    })

    it('does not submit a search when the run is aborted during the probe', async () => {
      const probe = deferred()
      isOpenSearchMock.mockReturnValue(probe.promise)

      searchStore.setQuery('alpha')
      const p = searchStore.refresh()
      searchStore.cancelActiveSearch()
      probe.resolve(false)
      await p

      expect(runAsyncSearchMock).not.toHaveBeenCalled()
      expect(searchDocsSpy).not.toHaveBeenCalled()
      expect(searchStore.error).toBeNull()
    })
  })
})
