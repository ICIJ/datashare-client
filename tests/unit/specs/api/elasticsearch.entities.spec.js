import { setActivePinia, createPinia } from 'pinia'

import { elasticsearch, entitiesIndex } from '@/api/elasticsearch'

describe('entitiesIndex', () => {
  it('names the entities index of a project', () => {
    expect(entitiesIndex('banana-papers')).toBe('banana-papers.entities')
  })
})

describe('searchEntities', () => {
  let spy

  beforeEach(() => {
    setActivePinia(createPinia())
    spy = vi.spyOn(elasticsearch, 'search').mockResolvedValue({ hits: { hits: [], total: { value: 0 } } })
  })

  afterEach(() => spy.mockRestore())

  const lastCall = () => spy.mock.calls.at(-1)[0]

  it('suffixes every project with .entities', async () => {
    await elasticsearch.searchEntities({ indices: ['banana-papers', 'flowera'] })
    expect(lastCall().index).toBe('banana-papers.entities,flowera.entities')
  })

  it('tolerates a project whose entities index does not exist', async () => {
    await elasticsearch.searchEntities({ indices: ['banana-papers'] })
    expect(lastCall().ignore_unavailable).toBe(true)
  })

  it('matches everything when the query is blank', async () => {
    await elasticsearch.searchEntities({ indices: ['banana-papers'], query: '' })
    expect(lastCall().body.query).toEqual({ match_all: {} })
  })

  it('queries propertiesAll when there is a query string', async () => {
    await elasticsearch.searchEntities({ indices: ['banana-papers'], query: 'seryaev' })
    expect(lastCall().body.query.query_string.default_field).toBe('propertiesAll')
    expect(lastCall().body.query.query_string.query).toBe('seryaev')
  })

  it('paginates with from and size', async () => {
    await elasticsearch.searchEntities({ indices: ['banana-papers'], from: 25, perPage: 25 })
    expect(lastCall().body.from).toBe(25)
    expect(lastCall().body.size).toBe(25)
  })

  it('sorts by relevance by default', async () => {
    await elasticsearch.searchEntities({ indices: ['banana-papers'] })
    expect(lastCall().body.sort).toEqual([{ _score: { order: 'desc' } }])
  })

  // Without a preference, successive pages can be served by different shard replicas, so a
  // tie-broken ordering shifts between pages and a user paging through sees a duplicate or
  // misses an entity entirely.
  it('pins the shard preference so paging stays consistent', async () => {
    await elasticsearch.searchEntities({ indices: ['banana-papers'] })
    expect(lastCall().preference).toBeTruthy()
  })

  it('sorts a named property without an explicit mode', async () => {
    await elasticsearch.searchEntities({ indices: ['banana-papers'], sort: { entityId: 'asc' } })
    const [clause] = lastCall().body.sort
    expect(clause).toEqual({ entityId: { order: 'asc' } })
    expect(clause.entityId.mode).toBeUndefined()
  })
})
