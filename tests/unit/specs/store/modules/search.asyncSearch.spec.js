import { flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

import { useAppStore, useSearchStore } from '@/store/modules'
import { apiInstance as api } from '@/api/apiInstance'

const runAsyncSearchMock = vi.fn()
vi.mock('@/api/asyncSearch', () => ({
  runAsyncSearch: (...args) => runAsyncSearchMock(...args)
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
  let searchStore, appStore, getVersionSpy, searchDocsSpy

  beforeEach(() => {
    setActivePinia(createPinia())
    appStore = useAppStore()
    searchStore = useSearchStore()
    searchStore.setIndex('local-index')
    appStore.setSettings('search', { perPage: 25, orderBy: ['_score', 'desc'] })
    runAsyncSearchMock.mockReset()
    getVersionSpy = vi.spyOn(api, 'getVersion').mockResolvedValue({ 'index.distribution': 'elasticsearch' })
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

    d.resolve({ hits: { hits: [], total: { value: 0 } } })
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

    second.resolve({ hits: { hits: [], total: { value: 0 } } })
    first.resolve({ hits: { hits: [], total: { value: 0 } } })
    await Promise.all([p1, p2])
  })

  it('does not clobber the current response with a superseded result', async () => {
    const first = deferred()
    const second = deferred()
    runAsyncSearchMock.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)

    searchStore.setQuery('alpha')
    const p1 = searchStore.refresh()
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
    runAsyncSearchMock.mockResolvedValue({ hits: { hits: [], total: { value: 0 } } })

    await Promise.all([searchStore.query('bar'), searchStore.query('bar')])

    expect(runAsyncSearchMock).toHaveBeenCalledTimes(1)
  })

  describe('index distribution gating', () => {
    it('searches synchronously when the backend reports an opensearch distribution', async () => {
      getVersionSpy.mockResolvedValue({ 'index.distribution': 'opensearch' })
      searchDocsSpy.mockResolvedValue({ hits: { hits: [], total: { value: 3 } } })

      await searchStore.query('alpha')

      expect(searchDocsSpy).toHaveBeenCalledTimes(1)
      expect(runAsyncSearchMock).not.toHaveBeenCalled()
      expect(searchStore.total).toBe(3)
    })

    it('keeps the async search on an elasticsearch distribution', async () => {
      runAsyncSearchMock.mockResolvedValue(emptyResponse())

      await searchStore.query('alpha')

      expect(runAsyncSearchMock).toHaveBeenCalledTimes(1)
      expect(searchDocsSpy).not.toHaveBeenCalled()
    })

    it('fetches the version only once across consecutive searches', async () => {
      runAsyncSearchMock.mockResolvedValue(emptyResponse())

      await searchStore.query('alpha')
      await searchStore.query('beta')

      expect(getVersionSpy).toHaveBeenCalledTimes(1)
    })

    it('falls back to the async search when the version request fails', async () => {
      getVersionSpy.mockRejectedValue(new Error('backend unreachable'))
      runAsyncSearchMock.mockResolvedValue(emptyResponse())

      await searchStore.query('alpha')

      expect(runAsyncSearchMock).toHaveBeenCalledTimes(1)
      expect(searchStore.error).toBeNull()
    })

    it('retries the version request on the next search after a failure', async () => {
      getVersionSpy.mockRejectedValueOnce(new Error('backend unreachable'))
      getVersionSpy.mockResolvedValue({ 'index.distribution': 'opensearch' })
      runAsyncSearchMock.mockResolvedValue(emptyResponse())

      await searchStore.query('alpha')
      await searchStore.query('beta')

      expect(getVersionSpy).toHaveBeenCalledTimes(2)
      expect(searchDocsSpy).toHaveBeenCalledTimes(1)
    })
  })
})
