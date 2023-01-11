import cloneDeep from 'lodash/cloneDeep'
import toLower from 'lodash/toLower'

import { Api } from '@/api'
import { storeBuilder } from '@/store/storeBuilder'

describe('IndexingStore', () => {
  const project = toLower('IndexingStore')
  let store, mockAxios

  beforeAll(() => {
    mockAxios = { request: jest.fn() }
    const api = new Api(mockAxios)
    store = storeBuilder(api)
    store.commit('search/index', project)
  })

  beforeEach(() => {
    mockAxios.request.mockClear()
    mockAxios.request.mockResolvedValue({ data: {} })
    store.commit('indexing/reset')
  })

  it('should define a store module', () => {
    expect(store.state.indexing).toBeDefined()
  })

  it('should reset the store state', async () => {
    const initialState = cloneDeep(store.state.indexing)
    store.commit('indexing/reset')

    expect(store.state.indexing).toEqual(initialState)
  })

  it('should execute a default extract action', async () => {
    await store.dispatch('indexing/submitExtract')

    expect(mockAxios.request).toBeCalledTimes(1)
    expect(mockAxios.request).toBeCalledWith(
      expect.objectContaining({
        url: Api.getFullUrl('/api/task/batchUpdate/index/file'),
        method: 'POST',
        data: {
          options: expect.objectContaining({ ocr: false, filter: true })
        }
      })
    )
  })

  it('should execute a default find named entities action', async () => {
    await store.dispatch('indexing/submitFindNamedEntities')

    expect(mockAxios.request).toBeCalledTimes(1)
    expect(mockAxios.request).toBeCalledWith(
      expect.objectContaining({
        url: Api.getFullUrl('/api/task/findNames/CORENLP'),
        method: 'POST',
        data: {
          options: expect.objectContaining({ syncModels: true })
        }
      })
    )
  })

  it('should stop pending tasks', async () => {
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' }])
    expect(store.state.indexing.tasks).toHaveLength(1)

    await store.dispatch('indexing/stopPendingTasks')

    expect(store.state.indexing.tasks).toHaveLength(0)
    expect(mockAxios.request).toBeCalledTimes(1)
    expect(mockAxios.request).toBeCalledWith(
      expect.objectContaining({
        url: Api.getFullUrl('/api/task/stopAll'),
        method: 'PUT'
      })
    )
  })

  it('should stop the task named 456', async () => {
    store.commit('indexing/updateTasks', [
      { name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' },
      { name: 'foo.bar@456', progress: 0.7, state: 'RUNNING' }
    ])
    expect(store.state.indexing.tasks).toHaveLength(2)

    await store.dispatch('indexing/stopTask', 'foo.bar@123')

    expect(store.state.indexing.tasks).toHaveLength(1)
    expect(mockAxios.request).toBeCalledTimes(1)
    expect(mockAxios.request).toBeCalledWith(
      expect.objectContaining({
        url: Api.getFullUrl(`/api/task/stop/${encodeURIComponent('foo.bar@123')}`),
        method: 'PUT'
      })
    )
  })

  it('should delete done tasks', async () => {
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' }])
    expect(store.state.indexing.tasks).toHaveLength(1)

    await store.dispatch('indexing/deleteDoneTasks')

    expect(store.state.indexing.tasks).toHaveLength(0)
    expect(mockAxios.request).toBeCalledTimes(1)
    expect(mockAxios.request).toBeCalledWith(
      expect.objectContaining({
        url: Api.getFullUrl('/api/task/clean'),
        method: 'POST'
      })
    )
  })

  it('should reset the extracting form', () => {
    store.commit('indexing/updateField', { path: 'form.ocr', value: true })
    expect(store.state.indexing.form.ocr).toBeTruthy()

    store.commit('indexing/resetExtractForm')
    expect(store.state.indexing.form.ocr).toBeFalsy()
  })

  it('should reset the Find Named Entities form', () => {
    store.commit('indexing/updateField', { path: 'form.pipeline', value: 'OPENNLP' })
    store.commit('indexing/updateField', { path: 'form.offline', value: true })
    expect(store.state.indexing.form.pipeline).toBe('OPENNLP')
    expect(store.state.indexing.form.offline).toBeTruthy()

    store.commit('indexing/resetFindNamedEntitiesForm')

    expect(store.state.indexing.form.pipeline).toBe('CORENLP')
    expect(store.state.indexing.form.offline).toBeFalsy()
  })

  it('should delete all the documents in the index', async () => {
    await store.dispatch('indexing/deleteAll')

    expect(mockAxios.request).toBeCalledTimes(1)
    expect(mockAxios.request).toBeCalledWith(
      expect.objectContaining({
        url: Api.getFullUrl(`/api/project/${project}`),
        method: 'DELETE'
      })
    )
  })

  it('should retrieve the NER pipelines', async () => {
    await store.dispatch('indexing/getNerPipelines')

    expect(mockAxios.request).toBeCalledTimes(1)
    expect(mockAxios.request).toBeCalledWith(
      expect.objectContaining({
        url: Api.getFullUrl('/api/ner/pipelines')
      })
    )
  })
})
