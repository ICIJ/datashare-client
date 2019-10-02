import DatashareClient from '@/api/DatashareClient'
import { actions, getters, mutations, state, datashare } from '@/store/modules/batchSearch'
import { jsonOk } from 'tests/unit/tests_utils'
import Vuex from 'vuex'
import Vue from 'vue'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import Murmur from '@icij/murmur'

Vue.use(Vuex)

describe('BatchSearch store', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  let store

  beforeAll(() => {
    Murmur.config.merge({ userIndices: [process.env.VUE_APP_ES_INDEX] })
    store = new Vuex.Store({ modules: { batchSearch: { namespaced: true, actions, getters, mutations, state } } })
  })

  beforeEach(() => {
    store.commit('batchSearch/index', process.env.VUE_APP_ES_INDEX)
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonOk())
  })

  afterEach(() => datashare.fetch.mockClear())

  describe('mutations', () => {
    it('should reset the form', () => {
      store.state.batchSearch.name = 'name'
      store.state.batchSearch.published = false
      store.state.batchSearch.csvFile = 'csvFile'
      store.state.batchSearch.description = 'description'
      store.state.batchSearch.index = 'new_index'

      store.commit('batchSearch/resetForm')

      expect(store.state.batchSearch.name).toBe('')
      expect(store.state.batchSearch.published).toBeTruthy()
      expect(store.state.batchSearch.csvFile).toBeNull()
      expect(store.state.batchSearch.description).toBe('')
      expect(store.state.batchSearch.index).toBe('local-datashare')
    })
  })

  describe('actions', () => {
    it('should submit the new batch search form with complete information', async () => {
      store.state.batchSearch.name = 'name'
      store.state.batchSearch.published = false
      store.state.batchSearch.csvFile = 'csvFile'
      store.state.batchSearch.description = 'description'
      store.state.batchSearch.index = 'index'
      datashare.fetch.mockClear()

      await store.dispatch('batchSearch/onSubmit')

      const body = new FormData()
      body.append('name', 'name')
      body.append('description', 'description')
      body.append('csvFile', 'csvFile')
      body.append('published', false)
      expect(datashare.fetch).toBeCalledTimes(2)
      expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl('/api/batch/search/index'), { method: 'POST', body })
      expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl('/api/batch/search'), {})
    })

    it('should reset the form after submission success', async () => {
      store.state.batchSearch.name = 'name'
      store.state.batchSearch.published = false
      store.state.batchSearch.csvFile = 'csvFile'
      store.state.batchSearch.description = 'description'
      store.state.batchSearch.index = 'index'

      await store.dispatch('batchSearch/onSubmit')

      expect(store.state.batchSearch.name).toBe('')
      expect(store.state.batchSearch.published).toBeTruthy()
      expect(store.state.batchSearch.csvFile).toBeNull()
      expect(store.state.batchSearch.description).toBe('')
      expect(store.state.batchSearch.index).toBe('local-datashare')
    })

    it('should NOT reset the form after submission fail', async () => {
      datashare.fetch.mockReturnValue(jsonOk({}, 500))
      store.state.batchSearch.name = 'name'
      store.state.batchSearch.published = false
      store.state.batchSearch.csvFile = 'csvFile'
      store.state.batchSearch.description = 'description'
      store.state.batchSearch.index = 'index'

      try {
        await store.dispatch('batchSearch/onSubmit')
      } catch (_) {
        expect(store.state.batchSearch.name).toBe('name')
        expect(store.state.batchSearch.published).toBeFalsy()
        expect(store.state.batchSearch.csvFile).not.toBeNull()
        expect(store.state.batchSearch.description).toBe('description')
        expect(store.state.batchSearch.index).toBe('index')
      }
    })

    it('should retrieve a batch search according to its id', async () => {
      await letData(es).have(new IndexedDocument('12').withContentType('type_01')).commit()
      const batchSearch = [{ contentType: 'type_01', documentId: 12, rootId: 12 }]
      datashare.fetch.mockReturnValue(jsonOk(batchSearch))

      await store.dispatch('batchSearch/getBatchSearchResults', { batchId: 12 })

      expect(store.state.batchSearch.results).toHaveLength(1)
      expect(store.state.batchSearch.results[0].documentId).toBe(12)
      expect(store.state.batchSearch.results[0].rootId).toBe(12)
      expect(store.state.batchSearch.results[0].document).not.toBeNull()
    })

    it('should delete a specific batchSearch', async () => {
      store.state.batchSearch.batchSearches = ['batchSearch_01', 'batchSearch_02', 'batchSearch_03']

      await store.dispatch('batchSearch/deleteBatchSearch', { batchId: 'batchSearch_01' })

      expect(datashare.fetch).toHaveBeenCalledTimes(1)
      expect(datashare.fetch).toHaveBeenCalledWith(DatashareClient.getFullUrl('/api/batch/search/batchSearch_01'), { method: 'DELETE' })
      expect(store.state.batchSearch.batchSearches).toEqual(['batchSearch_02', 'batchSearch_03'])
    })

    it('should delete all batch searches', async () => {
      store.state.batchSearch.batchSearches = ['batchSearch_01', 'batchSearch_02', 'batchSearch_03']

      await store.dispatch('batchSearch/deleteBatchSearches')

      expect(datashare.fetch).toHaveBeenCalledTimes(1)
      expect(datashare.fetch).toHaveBeenCalledWith(DatashareClient.getFullUrl('/api/batch/search'), { method: 'DELETE' })
      expect(store.state.batchSearch.batchSearches).toEqual([])
    })
  })
})
