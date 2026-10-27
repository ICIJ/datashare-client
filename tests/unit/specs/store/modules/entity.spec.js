import { setActivePinia, createPinia } from 'pinia'

import { useEntityStore } from '@/store/modules/entity'
import { elasticsearch } from '@/api/elasticsearch'

const hit = (id, index = 'banana-papers.entities') => ({
  _id: id,
  _index: index,
  _source: { entityId: id.replace('ftm_', ''), model: 'ftm', entityType: 'Person', properties: {} }
})

const response = (hits = [], total = hits.length) => ({ hits: { hits, total: { value: total } } })

describe('useEntityStore', () => {
  let spy

  beforeEach(() => {
    setActivePinia(createPinia())
    spy = vi.spyOn(elasticsearch, 'searchEntities')
  })

  afterEach(() => spy.mockRestore())

  it('searches every selected project at once', async () => {
    spy.mockResolvedValue(response())
    const store = useEntityStore()
    store.projects = ['banana-papers', 'flowera']
    await store.search()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0].indices).toEqual(['banana-papers', 'flowera'])
  })

  it('performs no request when the user has no project', async () => {
    spy.mockResolvedValue(response())
    const store = useEntityStore()
    store.projects = []
    await store.search()
    expect(spy).not.toHaveBeenCalled()
    expect(store.isReady).toBe(true)
    expect(store.hits).toEqual([])
  })

  it('exposes the hits with their index', async () => {
    spy.mockResolvedValue(response([hit('ftm_NK-1')]))
    const store = useEntityStore()
    store.projects = ['banana-papers']
    await store.search()
    expect(store.hits[0]._index).toBe('banana-papers.entities')
  })

  it('stores the error and still becomes ready when the search fails', async () => {
    spy.mockRejectedValue(new Error('index_not_found_exception'))
    const store = useEntityStore()
    store.projects = ['banana-papers']
    await store.search()
    expect(store.error).toBeTruthy()
    expect(store.isReady).toBe(true)
    expect(store.hits).toEqual([])
  })

  it('is empty rather than erroring when every index is missing', async () => {
    spy.mockResolvedValue(response([], 0))
    const store = useEntityStore()
    store.projects = ['never-ingested']
    await store.search()
    expect(store.isEmpty).toBe(true)
    expect(store.error).toBeNull()
  })

  it('reports no hits for a page past the end of the results', async () => {
    spy.mockResolvedValue(response([], 12))
    const store = useEntityStore()
    store.projects = ['banana-papers']
    store.from = 2450
    await store.search()
    expect(store.hits).toEqual([])
    expect(store.total).toBe(12)
    expect(store.error).toBeNull()
  })

  // Two searches overlap whenever a user paginates and then changes the sort. Without ordering,
  // the slower first response lands last and the list shows results for a query nobody asked for.
  it('discards a slow response that lands after a newer one', async () => {
    const store = useEntityStore()
    store.projects = ['banana-papers']
    let releaseStale
    spy.mockImplementationOnce(() => new Promise((resolve) => {
      releaseStale = () => resolve(response([hit('ftm_STALE')]))
    }))
    spy.mockImplementationOnce(() => Promise.resolve(response([hit('ftm_FRESH')])))
    const stale = store.search()
    const fresh = store.search()
    await fresh
    releaseStale()
    await stale
    expect(store.hits.map(({ _id }) => _id)).toEqual(['ftm_FRESH'])
  })

  it('clears the previous error when a later search succeeds', async () => {
    const store = useEntityStore()
    store.projects = ['banana-papers']
    spy.mockRejectedValueOnce(new Error('boom'))
    await store.search()
    expect(store.error).toBeTruthy()
    spy.mockResolvedValue(response([hit('ftm_NK-1')]))
    await store.search()
    expect(store.error).toBeNull()
    expect(store.hits).toHaveLength(1)
  })
})
