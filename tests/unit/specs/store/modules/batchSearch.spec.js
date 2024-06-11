import { flushPromises } from '~tests/unit/tests_utils'
import { storeBuilder } from '@/store/storeBuilder'

describe('BatchSearchStore', () => {
  let api
  let store

  beforeAll(() => {
    api = {
      getBatchSearchQueries: vi.fn(),
      getBatchSearch: vi.fn(),
      getBatchSearchResults: vi.fn(),
      getBatchSearches: vi.fn(),
      batchSearch: vi.fn(),
      deleteBatchSearch: vi.fn(),
      deleteBatchSearches: vi.fn()
    }
  })

  beforeEach(() => {
    vi.clearAllMocks()
    store = storeBuilder(api)
  })

  describe('actions', () => {
    it('should retrieve a batchSearch according to its id', async () => {
      api.getBatchSearch.mockReturnValue({ name: 'This is my batchSearch' })

      await store.dispatch('batchSearch/getBatchSearch', 12)

      expect(api.getBatchSearch).toBeCalledTimes(1)
      expect(api.getBatchSearch).toBeCalledWith(12)
      expect(store.state.batchSearch.batchSearch.name).toBe('This is my batchSearch')
    })

    it('should retrieve the queries of a batch search given its ID', async () => {
      const queries = { query1: 0, query2: 2, query3: 1 }
      api.getBatchSearchQueries = vi.fn().mockImplementation((uuid) => {
        if (uuid === '1') {
          return queries
        }
        return {}
      })
      await store.dispatch('batchSearch/getBatchSearchQueries', '1')
      expect(api.getBatchSearchQueries).toBeCalledWith('1')
      expect(Object.keys(store.state.batchSearch.queries)).toHaveLength(3)
      await store.dispatch('batchSearch/getBatchSearchQueries', '2')
      expect(api.getBatchSearchQueries).toBeCalledWith('2')
      expect(store.state.batchSearch.queries).toEqual({})
    })

    it('should retrieve the queries in the form of a label/count array of objects', async () => {
      const queries = { query1: 0, query2: 2, query3: 1 }
      api.getBatchSearchQueries = vi.fn().mockResolvedValue(queries)
      await store.dispatch('batchSearch/getBatchSearchQueries', '1')
      expect(store.getters['batchSearch/queryKeys']).toHaveLength(3)
      expect(store.getters['batchSearch/queryKeys']).toEqual([
        { label: 'query1', count: 0 },
        { label: 'query2', count: 2 },
        { label: 'query3', count: 1 }
      ])
    })

    it('should retrieve all the batchSearches', async () => {
      api.getBatchSearches.mockResolvedValue({
        items: ['batchSearch_01', 'batchSearch_02', 'batchSearch_03'],
        pagination: { total: 3 }
      })
      const data = {
        from: 0,
        size: 10,
        sort: 'batch_date',
        order: 'asc',
        query: '*',
        field: 'all',
        batchDate: [],
        project: [],
        state: [],
        publishState: null
      }

      await store.dispatch('batchSearch/getBatchSearches', data)

      expect(api.getBatchSearches).toBeCalledTimes(1)
      expect(store.state.batchSearch.batchSearches).toHaveLength(3)
    })

    it('should submit the new batchSearch form with complete information', async () => {
      api.getBatchSearches.mockResolvedValueOnce({ items: [{ uuid: '1' }, { uuid: '2' }], pagination: { total: 2 } })

      await store.dispatch('batchSearch/onSubmit', {
        name: 'name',
        csvFile: 'csvFile',
        description: 'description',
        projects: ['project1', 'project2'],
        phraseMatch: false,
        fuzziness: 2,
        fileTypes: [{ mime: 'pdf' }, { mime: 'csv' }],
        paths: ['/a/path/to/home', '/another/path'],
        published: false
      })

      const data = new FormData()
      data.append('name', 'name')
      data.append('projects', 'project1')
      data.append('projects', 'project2')
      data.append('csvFile', 'csvFile')
      data.append('description', 'description')
      data.append('phrase_matches', false)
      data.append('fuzziness', 2)
      data.append('fileTypes', 'pdf')
      data.append('fileTypes', 'csv')
      data.append('paths', '/a/path/to/home')
      data.append('paths', '/another/path')
      data.append('published', false)
      expect(api.batchSearch).toBeCalledTimes(1)
      expect(api.getBatchSearches).toBeCalledTimes(1)
      expect(store.state.batchSearch.total).toEqual(2)
      expect(store.state.batchSearch.batchSearches).toHaveLength(2)
      expect(store.state.batchSearch.nbBatchSearches).toEqual(2)
    })

    it('should retrieve a batchSearch results according to its id', async () => {
      api.getBatchSearchResults.mockResolvedValueOnce({
        items: [
          {
            contentType: 'type_01',
            documentId: 12,
            rootId: 42
          }
        ],
        pagination: { total: 1 }
      })

      await store.dispatch('batchSearch/getBatchSearchResults', { batchId: 12 })

      expect(api.getBatchSearchResults).toBeCalledTimes(1)

      expect(store.state.batchSearch.results).toHaveLength(1)
      expect(store.state.batchSearch.results[0].documentId).toBe(12)
      expect(store.state.batchSearch.results[0].rootId).toBe(42)
      expect(store.state.batchSearch.results[0].document).not.toBeNull()
    })

    it('should delete a specific batchSearch', async () => {
      store.state.batchSearch.batchSearches = [
        { uuid: 'batchSearch_01' },
        { uuid: 'batchSearch_02' },
        { uuid: 'batchSearch_03' }
      ]

      await store.dispatch('batchSearch/deleteBatchSearch', { batchId: 'batchSearch_01' })

      expect(api.deleteBatchSearch).toBeCalledTimes(1)
      expect(api.deleteBatchSearch).toBeCalledWith('batchSearch_01')

      expect(store.state.batchSearch.batchSearches).toEqual([{ uuid: 'batchSearch_02' }, { uuid: 'batchSearch_03' }])
    })

    it('should delete twice the same batchSearch', async () => {
      store.state.batchSearch.batchSearches = [{ uuid: 'batchSearch_01' }, { uuid: 'batchSearch_02' }]
      store.state.batchSearch.nbBatchSearches = 2
      store.state.batchSearch.total = 2

      await store.dispatch('batchSearch/deleteBatchSearch', { batchId: 'batchSearch_01' })
      await store.dispatch('batchSearch/deleteBatchSearch', { batchId: 'batchSearch_01' })

      expect(store.state.batchSearch.nbBatchSearches).toEqual(1)
      expect(api.deleteBatchSearch).toBeCalledTimes(2)
    })

    it('should delete all the batchSearches', async () => {
      store.state.batchSearch.batchSearches = [
        { uuid: 'batchSearch_01' },
        { uuid: 'batchSearch_02' },
        { uuid: 'batchSearch_03' }
      ]

      await store.dispatch('batchSearch/deleteBatchSearches')

      expect(api.deleteBatchSearches).toBeCalledTimes(1)
      expect(store.state.batchSearch.batchSearches).toEqual([])
    })
  })
})

describe('without using api', () => {
  let store, api

  beforeAll(() => {
    api = {
      getBatchSearches: vi.fn(),
      deleteBatchSearch: vi.fn(),
      batchSearch: vi.fn()
    }

    store = storeBuilder(api)
  })
  beforeEach(() => {
    store.state.batchSearch.nbBatchSearches = 0
    store.state.batchSearch.total = 0
    store.state.batchSearch.batchSearches = {}
  })

  it('should set nbBatchSearches on initial retrieve of batch searches', async () => {
    // without init the nbBatchSearches is not updated
    api.getBatchSearches.mockResolvedValueOnce({
      items: [{ uuid: 'batchSearch_01' }, { uuid: 'batchSearch_02' }, { uuid: 'batchSearch_03' }],
      pagination: {
        total: 3
      }
    })
    await store.dispatch('batchSearch/getBatchSearches', { init: false })
    expect(store.state.batchSearch.nbBatchSearches).toEqual(0)
    expect(store.getters['batchSearch/hasBatchSearch']).toBe(false)

    // with init, it changes nbBatchSearches to 1
    api.getBatchSearches.mockResolvedValueOnce({
      items: [{ uuid: 'batchSearch_01' }],
      pagination: { total: 1 }
    })
    await store.dispatch('batchSearch/getBatchSearches', { init: true })

    expect(store.state.batchSearch.nbBatchSearches).toEqual(1)
    expect(store.getters['batchSearch/hasBatchSearch']).toBe(true)

    // we deleted it, and reset changes nbBatchSearches to 0
    await store.dispatch('batchSearch/deleteBatchSearch', { batchId: 'batchSearch_01' })
    await flushPromises()
    expect(store.state.batchSearch.nbBatchSearches).toEqual(0)
    expect(store.getters['batchSearch/hasBatchSearch']).toBe(false)
  })

  it('should update the nbBatchSearches when submitting the new batchSearch form', async () => {
    api.getBatchSearches.mockResolvedValueOnce({
      items: [{ uuid: 'name' }],
      pagination: { total: 1 }
    })

    expect(store.state.batchSearch.nbBatchSearches).toEqual(0)
    await store.dispatch('batchSearch/onSubmit', {
      name: 'name',
      csvFile: 'csvFile',
      description: 'description',
      projects: ['project1', 'project2'],
      phraseMatch: false,
      fuzziness: 2,
      fileTypes: [{ mime: 'pdf' }, { mime: 'csv' }],
      paths: ['/a/path/to/home', '/another/path'],
      published: false
    })

    expect(store.state.batchSearch.nbBatchSearches).toEqual(1)
  })
})
