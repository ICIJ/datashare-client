import DatashareClient from '@/api/DatashareClient'
import { actions, getters, mutations, state, datashare } from '@/store/modules/batchSearch'
import { jsonOk } from 'tests/unit/tests_utils'
import Vuex from 'vuex'
import Vue from 'vue'

Vue.use(Vuex)

describe('BatchSearch store', () => {
  let store

  beforeAll(() => {
    store = new Vuex.Store({ modules: { batchSearch: { namespaced: true, actions, getters, mutations, state } } })
  })

  beforeEach(() => {
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonOk())
  })

  afterEach(() => {
    datashare.fetch.mockClear()
  })

  describe('mutations', () => {
    it('should reset the form', () => {
      store.state.batchSearch.name = 'name'
      store.state.batchSearch.description = 'description'
      store.state.batchSearch.csvFile = 'csvFile'

      store.commit('batchSearch/resetForm')

      expect(store.state.batchSearch.name).toBe('')
      expect(store.state.batchSearch.description).toBe('')
      expect(store.state.batchSearch.csvFile).toBeNull()
    })
  })

  describe('actions', () => {
    it('should submit the new batch search form with complete information', async () => {
      store.state.batchSearch.name = 'name'
      store.state.batchSearch.description = 'description'
      store.state.batchSearch.index = 'index'
      store.state.batchSearch.csvFile = 'csvFile'
      datashare.fetch.mockClear()

      await store.dispatch('batchSearch/onSubmit')

      const body = new FormData()
      body.append('name', 'name')
      body.append('description', 'description')
      body.append('csvFile', 'csvFile')
      expect(datashare.fetch).toHaveBeenCalledTimes(2)
      expect(datashare.fetch).toHaveBeenCalledWith(DatashareClient.getFullUrl('/api/batch/search/index'), { method: 'POST', body })
      expect(datashare.fetch).toHaveBeenCalledWith(DatashareClient.getFullUrl('/api/batch/search'), {})
    })

    it('should reset the form after submission success', async () => {
      store.state.batchSearch.name = 'name'
      store.state.batchSearch.description = 'description'
      store.state.batchSearch.csvFile = 'csvFile'

      await store.dispatch('batchSearch/onSubmit')

      expect(store.state.batchSearch.name).toBe('')
      expect(store.state.batchSearch.description).toBe('')
      expect(store.state.batchSearch.csvFile).toBeNull()
    })

    it('should NOT reset the form after submission fail', async () => {
      datashare.fetch.mockReturnValue(jsonOk({}, 500))
      store.state.batchSearch.name = 'name'
      store.state.batchSearch.description = 'description'
      store.state.batchSearch.csvFile = 'csvFile'

      try {
        await store.dispatch('batchSearch/onSubmit')
      } catch (e) {
        expect(store.state.batchSearch.name).toBe('name')
        expect(store.state.batchSearch.description).toBe('description')
        expect(store.state.batchSearch.csvFile).not.toBeNull()
      }
    })

    it('should retrieve a batch search according to its id', async () => {
      const batchSearch = { uuid: '42' }
      datashare.fetch.mockReturnValue(jsonOk(batchSearch))

      await store.dispatch('batchSearch/getBatchSearchResults', 1)

      expect(store.state.batchSearch.batchSearch).toEqual(batchSearch)
    })
  })
})
