import Vue from 'vue'
import Vuex from 'vuex'
import DatashareClient from '@/api/DatashareClient'
import { datashare } from '@/store/modules/indexing'
import { jsonOk } from 'tests/unit/tests_utils'
import cloneDeep from 'lodash/cloneDeep'
import store from '@/store'

Vue.use(Vuex)

describe('Indexing store', () => {
  beforeAll(() => store.commit('search/index', process.env.VUE_APP_ES_INDEX))

  beforeEach(() => {
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonOk())
  })

  afterEach(() => {
    datashare.fetch.mockClear()
    store.commit('indexing/reset')
  })

  it('should define a store module', () => {
    expect(store.state.indexing).not.toBeUndefined()
  })

  it('should reset the store state', async () => {
    const initialState = cloneDeep(store.state.indexing)
    await store.commit('indexing/reset')

    expect(store.state.indexing).toEqual(initialState)
  })

  it('should execute a default extract action', async () => {
    await store.dispatch('indexing/submitExtract')

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toHaveBeenCalledWith(DatashareClient.getFullUrl('/api/task/batchUpdate/index/file'),
      { method: 'POST', body: JSON.stringify({ options: { ocr: false } }) })
  })

  it('should execute a default find named entities action', async () => {
    await store.dispatch('indexing/submitFindNamedEntities')

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toHaveBeenCalledWith(DatashareClient.getFullUrl('/api/task/findNames/CORENLP'),
      { method: 'POST', body: JSON.stringify({ options: { syncModels: true } }) })
  })

  it('should stop pending tasks', async () => {
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' }])
    expect(store.state.indexing.tasks.length).toEqual(1)

    await store.dispatch('indexing/stopPendingTasks')

    expect(store.state.indexing.tasks.length).toEqual(0)
    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toHaveBeenCalledWith(DatashareClient.getFullUrl('/api/task/stopAll'),
      { method: 'PUT' })
  })

  it('should stop the task named 456', async () => {
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' },
      { name: 'foo.bar@456', progress: 0.7, state: 'RUNNING' }])
    expect(store.state.indexing.tasks.length).toEqual(2)

    await store.dispatch('indexing/stopTask', 'foo.bar@123')

    expect(store.state.indexing.tasks.length).toEqual(1)
    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toHaveBeenCalledWith(DatashareClient.getFullUrl('/api/task/stop/' + encodeURIComponent('foo.bar@123')),
      { method: 'PUT' })
  })

  it('should delete done tasks', async () => {
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' }])
    expect(store.state.indexing.tasks.length).toEqual(1)

    await store.dispatch('indexing/deleteDoneTasks')

    expect(store.state.indexing.tasks.length).toEqual(0)
    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toHaveBeenCalledWith(DatashareClient.getFullUrl('/api/task/clean'),
      { method: 'POST', body: '{}' })
  })

  it('should stop polling jobs', async () => {
    await store.dispatch('indexing/stopPollTasks')

    expect(store.state.indexing.pollHandle).toBeNull()
  })

  it('should reset the extracting form', async () => {
    store.commit('indexing/updateField', { path: 'form.ocr', value: true })
    expect(store.state.indexing.form.ocr).toBeTruthy()

    await store.dispatch('indexing/resetExtractForm')
    expect(store.state.indexing.form.ocr).toBeFalsy()
  })

  it('should reset the Find Named Entities form', async () => {
    store.commit('indexing/updateField', { path: 'form.pipeline', value: 'opennlp' })
    store.commit('indexing/updateField', { path: 'form.offline', value: true })
    expect(store.state.indexing.form.pipeline).toEqual('opennlp')
    expect(store.state.indexing.form.offline).toBeTruthy()

    await store.dispatch('indexing/resetFindNamedEntitiesForm')
    expect(store.state.indexing.form.pipeline).toEqual('corenlp')
    expect(store.state.indexing.form.offline).toBeFalsy()
  })

  it('should delete all the documents in the index', async () => {
    await store.dispatch('indexing/deleteAll')

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toHaveBeenCalledWith(DatashareClient.getFullUrl(`/api/project/${encodeURIComponent(process.env.VUE_APP_ES_INDEX)}`),
      { method: 'DELETE' })
  })
})
