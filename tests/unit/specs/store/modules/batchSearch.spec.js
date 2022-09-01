import axios from 'axios'
import Vue from 'vue'
import Vuex from 'vuex'

import Api from '@/api'
import { actions, getters, mutations, state } from '@/store/modules/batchSearch'

Vue.use(Vuex)

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({ data: {} })
  }
})

describe('BatchSearchStore', () => {
  let store = null

  beforeAll(() => {
    store = new Vuex.Store({ modules: { batchSearch: { namespaced: true, actions, getters, mutations, state } } })
  })

  afterEach(() => axios.request.mockClear())

  afterAll(() => jest.unmock('axios'))

  describe('actions', () => {
    it('should retrieve a batchSearch according to its id', async () => {
      axios.request.mockReturnValue({ data: { name: 'This is my batchSearch' } })

      await store.dispatch('batchSearch/getBatchSearch', 12)

      expect(axios.request).toBeCalledTimes(1)
      expect(axios.request).toBeCalledWith(expect.objectContaining({
        url: Api.getFullUrl('/api/batch/search/12')
      }))
      expect(store.state.batchSearch.batchSearch.name).toBe('This is my batchSearch')

      axios.request.mockReturnValue({ data: {} })
    })

    it('should retrieve all the batchSearches', async () => {
      axios.request.mockResolvedValue({ data: { items: ['batchSearch_01', 'batchSearch_02', 'batchSearch_03'], total: 3 } })
      const data = { from: 0, size: 10, sort: 'batch_date', order: 'asc', query: '*', field: 'all', batchDate: [], project: [], state: [], publishState: null }

      await store.dispatch('batchSearch/getBatchSearches', data)

      expect(axios.request).toBeCalledTimes(1)
      expect(axios.request).toBeCalledWith(expect.objectContaining({
        data,
        method: 'POST',
        url: Api.getFullUrl('/api/batch/search')
      }))
      expect(store.state.batchSearch.batchSearches).toHaveLength(3)

      axios.request.mockResolvedValue({ data: {} })
    })

    it('should submit the new batchSearch form with complete information', async () => {
      await store.dispatch('batchSearch/onSubmit', { name: 'name', csvFile: 'csvFile', description: 'description', projects: ['project1', 'project2'], phraseMatch: false, fuzziness: 2, fileTypes: [{ mime: 'pdf' }, { mime: 'csv' }], paths: ['/a/path/to/home', '/another/path'], published: false })

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
      expect(axios.request).toBeCalledTimes(2)
      expect(axios.request).toBeCalledWith(expect.objectContaining({
        data,
        method: 'POST',
        url: Api.getFullUrl('/api/batch/search/project1,project2')
      }))
      expect(axios.request).toBeCalledWith(expect.objectContaining({
        data: { from: 0, size: 100, sort: 'batch_date', order: 'asc', query: '*', field: 'all', batchDate: null, project: [], state: [], publishState: null },
        method: 'POST',
        url: Api.getFullUrl('/api/batch/search')
      }))
    })

    it('should retrieve a batchSearch results according to its id', async () => {
      axios.request.mockReturnValue({ data: [{ contentType: 'type_01', documentId: 12, rootId: 42 }] })

      await store.dispatch('batchSearch/getBatchSearchResults', { batchId: 12 })

      expect(axios.request).toBeCalledTimes(1)
      expect(axios.request).toBeCalledWith(expect.objectContaining({
        url: Api.getFullUrl('/api/batch/search/result/12'),
        method: 'POST'
      }))
      expect(store.state.batchSearch.results).toHaveLength(1)
      expect(store.state.batchSearch.results[0].documentId).toBe(12)
      expect(store.state.batchSearch.results[0].rootId).toBe(42)
      expect(store.state.batchSearch.results[0].document).not.toBeNull()

      axios.request.mockResolvedValue({ data: {} })
    })

    it('should delete a specific batchSearch', async () => {
      store.state.batchSearch.batchSearches = [{ uuid: 'batchSearch_01' }, { uuid: 'batchSearch_02' }, { uuid: 'batchSearch_03' }]

      await store.dispatch('batchSearch/deleteBatchSearch', { batchId: 'batchSearch_01' })

      expect(axios.request).toBeCalledTimes(1)
      expect(axios.request).toBeCalledWith(expect.objectContaining({
        url: Api.getFullUrl('/api/batch/search/batchSearch_01'),
        method: 'DELETE'
      }))
      expect(store.state.batchSearch.batchSearches).toEqual([{ uuid: 'batchSearch_02' }, { uuid: 'batchSearch_03' }])
    })

    it('should delete all the batchSearches', async () => {
      store.state.batchSearch.batchSearches = ['batchSearch_01', 'batchSearch_02', 'batchSearch_03']

      await store.dispatch('batchSearch/deleteBatchSearches')

      expect(axios.request).toBeCalledTimes(1)
      expect(axios.request).toBeCalledWith(expect.objectContaining({
        url: Api.getFullUrl('/api/batch/search'),
        method: 'DELETE'
      }))
      expect(store.state.batchSearch.batchSearches).toEqual([])
    })
  })
})
