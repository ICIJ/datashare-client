import toLower from 'lodash/toLower'
import Vue from 'vue'
import Vuex from 'vuex'

import Api from '@/api'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { actions, getters, mutations, state, datashare } from '@/store/modules/batchSearch'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import { jsonResp } from 'tests/unit/tests_utils'

Vue.use(Vuex)

describe('BatchSearchStore', () => {
  const index = toLower('BatchSearchStore')
  esConnectionHelper(index)
  const es = esConnectionHelper.es
  let store

  beforeAll(() => {
    store = new Vuex.Store({ modules: { batchSearch: { namespaced: true, actions, getters, mutations, state } } })
  })

  beforeEach(() => {
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonResp())
  })

  afterEach(() => datashare.fetch.mockClear())

  describe('actions', () => {
    it('should submit the new batchSearch form with complete information', async () => {
      await store.dispatch('batchSearch/onSubmit', { name: 'name', csvFile: 'csvFile', description: 'description', project: 'project', phraseMatch: false, fuzziness: 2, fileTypes: [{ mime: 'pdf' }, { mime: 'csv' }], paths: ['/a/path/to/home', '/another/path'], published: false })
      const body = new FormData()
      body.append('name', 'name')
      body.append('csvFile', 'csvFile')
      body.append('description', 'description')
      body.append('phrase_matches', false)
      body.append('fuzziness', 2)
      body.append('fileTypes', 'pdf')
      body.append('fileTypes', 'csv')
      body.append('paths', '/a/path/to/home')
      body.append('paths', '/another/path')
      body.append('published', false)
      expect(datashare.fetch).toBeCalledTimes(2)
      expect(datashare.fetch).toBeCalledWith(Api.getFullUrl('/api/batch/search/project'), { method: 'POST', body })
      expect(datashare.fetch).toBeCalledWith(Api.getFullUrl('/api/batch/search'), {})
    })

    it('should retrieve a batchSearch according to its id', async () => {
      await letData(es).have(new IndexedDocument('document', index).withContentType('type_01')).commit()
      const batchSearch = [{ contentType: 'type_01', documentId: 12, rootId: 42 }]
      datashare.fetch.mockReturnValue(jsonResp(batchSearch))

      await store.dispatch('batchSearch/getBatchSearchResults', { batchId: 12 })

      expect(store.state.batchSearch.results).toHaveLength(1)
      expect(store.state.batchSearch.results[0].documentId).toBe(12)
      expect(store.state.batchSearch.results[0].rootId).toBe(42)
      expect(store.state.batchSearch.results[0].document).not.toBeNull()
    })

    it('should delete a specific batchSearch', async () => {
      store.state.batchSearch.batchSearches = ['batchSearch_01', 'batchSearch_02', 'batchSearch_03']

      await store.dispatch('batchSearch/deleteBatchSearch', { batchId: 'batchSearch_01' })

      expect(datashare.fetch).toBeCalledTimes(1)
      expect(datashare.fetch).toBeCalledWith(Api.getFullUrl('/api/batch/search/batchSearch_01'), { method: 'DELETE' })
      expect(store.state.batchSearch.batchSearches).toEqual(['batchSearch_02', 'batchSearch_03'])
    })

    it('should delete all the batchSearches', async () => {
      store.state.batchSearch.batchSearches = ['batchSearch_01', 'batchSearch_02', 'batchSearch_03']

      await store.dispatch('batchSearch/deleteBatchSearches')

      expect(datashare.fetch).toBeCalledTimes(1)
      expect(datashare.fetch).toBeCalledWith(Api.getFullUrl('/api/batch/search'), { method: 'DELETE' })
      expect(store.state.batchSearch.batchSearches).toEqual([])
    })
  })
})
