import Vue from 'vue'
import Vuex from 'vuex'
import { flushPromises } from 'tests/unit/tests_utils'

import { Api } from '@/api'
import { storeBuilder } from '@/store/storeBuilder'

Vue.use(Vuex)

describe('BatchSearchStore', () => {
  let api
  let store
  const mockAxiosApi = { request: jest.fn() }
  const mockEventbus = { $emit: jest.fn() }

  beforeAll(() => {
    api = new Api(mockAxiosApi, mockEventbus)
    api.getBatchSearchQueries = jest.fn()
    store = storeBuilder(api)
  })

  beforeEach(() => {
    api.getBatchSearchQueries.mockClear()
    mockAxiosApi.request.mockClear()
    mockAxiosApi.request.mockResolvedValue({ data: {} })
  })

  describe('actions', () => {
    it('should retrieve a batchSearch according to its id', async () => {
      mockAxiosApi.request.mockReturnValue({ data: { name: 'This is my batchSearch' } })

      await store.dispatch('batchSearch/getBatchSearch', 12)

      expect(mockAxiosApi.request).toBeCalledTimes(1)
      expect(mockAxiosApi.request).toBeCalledWith(
        expect.objectContaining({
          url: Api.getFullUrl('/api/batch/search/12')
        })
      )
      expect(store.state.batchSearch.batchSearch.name).toBe('This is my batchSearch')

      mockAxiosApi.request.mockReturnValue({ data: {} })
    })

    it('should retrieve the queries of a batch search given its ID', async () => {
      const queries = { query1: 0, query2: 2, query3: 1 }
      api.getBatchSearchQueries = jest.fn().mockImplementation((uuid) => {
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
      api.getBatchSearchQueries = jest.fn().mockResolvedValue(queries)
      await store.dispatch('batchSearch/getBatchSearchQueries', '1')
      expect(store.getters['batchSearch/queryKeys']).toHaveLength(3)
      expect(store.getters['batchSearch/queryKeys']).toEqual([
        { label: 'query1', count: 0 },
        { label: 'query2', count: 2 },
        { label: 'query3', count: 1 }
      ])
    })

    it('should retrieve all the batchSearches', async () => {
      mockAxiosApi.request.mockResolvedValue({
        data: { items: ['batchSearch_01', 'batchSearch_02', 'batchSearch_03'], total: 3 }
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

      expect(mockAxiosApi.request).toBeCalledTimes(1)
      expect(mockAxiosApi.request).toBeCalledWith(
        expect.objectContaining({
          data,
          method: 'POST',
          url: Api.getFullUrl('/api/batch/search')
        })
      )
      expect(store.state.batchSearch.batchSearches).toHaveLength(3)
    })

    it('should submit the new batchSearch form with complete information', async () => {
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
      expect(mockAxiosApi.request).toBeCalledTimes(2)
      expect(mockAxiosApi.request).toBeCalledWith(
        expect.objectContaining({
          data,
          method: 'POST',
          url: Api.getFullUrl('/api/batch/search/project1,project2')
        })
      )
      expect(mockAxiosApi.request).toBeCalledWith(
        expect.objectContaining({
          data: {
            from: 0,
            size: 100,
            sort: 'batch_date',
            order: 'asc',
            query: '*',
            field: 'all',
            batchDate: null,
            project: [],
            state: [],
            publishState: null
          },
          method: 'POST',
          url: Api.getFullUrl('/api/batch/search')
        })
      )
    })

    it('should retrieve a batchSearch results according to its id', async () => {
      mockAxiosApi.request.mockReturnValue({ data: [{ contentType: 'type_01', documentId: 12, rootId: 42 }] })

      await store.dispatch('batchSearch/getBatchSearchResults', { batchId: 12 })

      expect(mockAxiosApi.request).toBeCalledTimes(1)
      expect(mockAxiosApi.request).toBeCalledWith(
        expect.objectContaining({
          url: Api.getFullUrl('/api/batch/search/result/12'),
          method: 'POST'
        })
      )
      expect(store.state.batchSearch.results).toHaveLength(1)
      expect(store.state.batchSearch.results[0].documentId).toBe(12)
      expect(store.state.batchSearch.results[0].rootId).toBe(42)
      expect(store.state.batchSearch.results[0].document).not.toBeNull()

      mockAxiosApi.request.mockResolvedValue({ data: {} })
    })

    it('should delete a specific batchSearch', async () => {
      store.state.batchSearch.batchSearches = [
        { uuid: 'batchSearch_01' },
        { uuid: 'batchSearch_02' },
        { uuid: 'batchSearch_03' }
      ]

      await store.dispatch('batchSearch/deleteBatchSearch', { batchId: 'batchSearch_01' })

      expect(mockAxiosApi.request).toBeCalledTimes(1)
      expect(mockAxiosApi.request).toBeCalledWith(
        expect.objectContaining({
          url: Api.getFullUrl('/api/batch/search/batchSearch_01'),
          method: 'DELETE'
        })
      )
      expect(store.state.batchSearch.batchSearches).toEqual([{ uuid: 'batchSearch_02' }, { uuid: 'batchSearch_03' }])
    })

    it('should delete twice the same batchSearch', async () => {
      store.state.batchSearch.batchSearches = [{ uuid: 'batchSearch_01' }, { uuid: 'batchSearch_02' }]
      store.state.batchSearch.nbBatchSearches = 2
      store.state.batchSearch.total = 2

      await store.dispatch('batchSearch/deleteBatchSearch', { batchId: 'batchSearch_01' })
      await store.dispatch('batchSearch/deleteBatchSearch', { batchId: 'batchSearch_01' })

      expect(store.state.batchSearch.nbBatchSearches).toEqual(1)
      expect(mockAxiosApi.request).toBeCalledTimes(2)
    })

    it('should delete all the batchSearches', async () => {
      store.state.batchSearch.batchSearches = [
        { uuid: 'batchSearch_01' },
        { uuid: 'batchSearch_02' },
        { uuid: 'batchSearch_03' }
      ]

      await store.dispatch('batchSearch/deleteBatchSearches')

      expect(mockAxiosApi.request).toBeCalledTimes(1)
      expect(mockAxiosApi.request).toBeCalledWith(
        expect.objectContaining({
          url: Api.getFullUrl('/api/batch/search'),
          method: 'DELETE'
        })
      )
      expect(store.state.batchSearch.batchSearches).toEqual([])
    })
  })
})

describe('without using api', () => {
  let api
  let store

  beforeAll(() => {
    api = new Api({ request: jest.fn() }, { $emit: jest.fn() })
    jest.spyOn(api, 'getBatchSearches')
    store = storeBuilder(api)
  })
  beforeEach(() => {
    store.state.batchSearch.nbBatchSearches = 0
    store.state.batchSearch.total = 0
    store.state.batchSearch.batchSearches = []
    api.getBatchSearches.mockClear()
  })

  afterAll(() => {
    api.getBatchSearches.mockReset()
  })
  it('should set nbBatchSearches on initial retrieve of batch searches', async () => {
    // without init the nbBatchSearches is not updated
    api.getBatchSearches.mockResolvedValueOnce({
      items: [{ uuid: 'batchSearch_01' }, { uuid: 'batchSearch_02' }, { uuid: 'batchSearch_03' }],
      total: 3
    })
    await store.dispatch('batchSearch/getBatchSearches', { init: false })
    expect(store.state.batchSearch.nbBatchSearches).toEqual(0)
    expect(store.getters['batchSearch/hasBatchSearch']).toBe(false)

    // with init, it changes nbBatchSearches to 1
    api.getBatchSearches.mockResolvedValueOnce({
      items: [{ uuid: 'batchSearch_01' }],
      total: 1
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

  it('should update the nbBatchSearches when submitting the new batchSearch form ', async () => {
    api.getBatchSearches.mockResolvedValueOnce({
      items: [{ uuid: 'name' }],
      total: 1
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
