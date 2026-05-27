import { setActivePinia, createPinia } from 'pinia'

import { useAppStore, useSearchStore } from '@/store/modules'

const runAsyncSearchMock = vi.fn()
vi.mock('@/api/asyncSearch', () => ({
  runAsyncSearch: (...args) => runAsyncSearchMock(...args)
}))

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
  let searchStore, appStore

  beforeEach(() => {
    setActivePinia(createPinia())
    appStore = useAppStore()
    searchStore = useSearchStore()
    searchStore.setIndex('local-index')
    appStore.setSettings('search', { perPage: 25, orderBy: ['_score', 'desc'] })
    runAsyncSearchMock.mockReset()
  })

  it('passes an abort signal to the runner', async () => {
    const d = deferred()
    runAsyncSearchMock.mockReturnValue(d.promise)

    searchStore.setQuery('alpha')
    const p = searchStore.refresh()

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
})
