import cloneDeep from 'lodash/cloneDeep'
import toLower from 'lodash/toLower'

import { storeBuilder } from '@/store/storeBuilder'

describe('IndexingStore', () => {
  const project = toLower('IndexingStore')
  let store, api

  beforeAll(() => {
    api = {
      index: jest.fn(),
      indexPath: jest.fn(),
      findNames: jest.fn(),
      stopPendingTasks: jest.fn(),
      stopTask: jest.fn(),
      getTasks: jest.fn(),
      deleteDoneTasks: jest.fn(),
      deleteAll: jest.fn(),
      getNerPipelines: jest.fn()
    }
    store = storeBuilder(api)
    store.commit('search/index', project)
  })

  beforeEach(() => {
    jest.clearAllMocks()
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
    expect(api.index).toBeCalledTimes(1)
    expect(api.index).toBeCalledWith(
      expect.objectContaining({
        defaultProject: null,
        filter: true,
        language: null,
        ocr: false,
        offline: false,
        path: null,
        pipeline: 'CORENLP'
      })
    )
  })
  it('should execute an extract action on the path /test', async () => {
    store.commit('indexing/formPath', '/test')
    await store.dispatch('indexing/submitExtract')
    expect(api.indexPath).toBeCalledTimes(1)
    expect(api.indexPath).toBeCalledWith('/test', {
      defaultProject: null,
      filter: true,
      language: null,
      ocr: false,
      offline: false,
      path: '/test',
      pipeline: 'CORENLP'
    })
  })

  it('should execute a default find named entities action', async () => {
    await store.dispatch('indexing/submitFindNamedEntities')
    expect(api.findNames).toBeCalledTimes(1)
    expect(api.findNames).toBeCalledWith('CORENLP', expect.objectContaining({ defaultProject: null, syncModels: true }))
  })

  it('should stop pending tasks', async () => {
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' }])
    expect(store.state.indexing.tasks).toHaveLength(1)

    await store.dispatch('indexing/stopPendingTasks')

    expect(store.state.indexing.tasks).toHaveLength(0)
    expect(api.stopPendingTasks).toBeCalledTimes(1)
  })

  it('should stop the task named 456', async () => {
    store.commit('indexing/updateTasks', [
      { name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' },
      { name: 'foo.bar@456', progress: 0.7, state: 'RUNNING' }
    ])
    expect(store.state.indexing.tasks).toHaveLength(2)

    await store.dispatch('indexing/stopTask', 'foo.bar@456')

    expect(store.state.indexing.tasks).toHaveLength(1)
    expect(api.stopTask).toBeCalledTimes(1)
    expect(api.stopTask).toBeCalledWith('foo.bar@456')
  })

  it('should delete done tasks', async () => {
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' }])
    expect(store.state.indexing.tasks).toHaveLength(1)

    await store.dispatch('indexing/deleteDoneTasks')

    expect(store.state.indexing.tasks).toHaveLength(0)
    expect(api.deleteDoneTasks).toBeCalledTimes(1)
  })

  it('should reset the extracting form', () => {
    store.commit('indexing/formOcr', true)
    expect(store.state.indexing.form.ocr).toBeTruthy()

    store.commit('indexing/resetExtractForm')
    expect(store.state.indexing.form.ocr).toBeFalsy()
  })

  it('should reset the Find Named Entities form', () => {
    store.commit('indexing/formPipeline', 'OPENNLP')
    store.commit('indexing/formOffline', true)
    expect(store.state.indexing.form.pipeline).toBe('OPENNLP')
    expect(store.state.indexing.form.offline).toBeTruthy()

    store.commit('indexing/resetFindNamedEntitiesForm')

    expect(store.state.indexing.form.pipeline).toBe('CORENLP')
    expect(store.state.indexing.form.offline).toBeFalsy()
  })

  it('should delete all the documents in the index', async () => {
    await store.dispatch('indexing/deleteAll')
    expect(api.deleteAll).toBeCalledTimes(1)
  })

  it('should retrieve the NER pipelines', async () => {
    await store.dispatch('indexing/getNerPipelines')
    expect(api.getNerPipelines).toBeCalledTimes(1)
  })
})
