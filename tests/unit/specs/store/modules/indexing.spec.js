import cloneDeep from 'lodash/cloneDeep'
import toLower from 'lodash/toLower'

import { storeBuilder } from '@/store/storeBuilder'

describe('IndexingStore', () => {
  const project = toLower('IndexingStore')
  let store, api

  beforeAll(() => {
    api = {
      index: vi.fn(),
      indexPath: vi.fn(),
      findNames: vi.fn(),
      stopPendingTasks: vi.fn(),
      stopTask: vi.fn(),
      getTasks: vi.fn(),
      deleteDoneTasks: vi.fn(),
      getNerPipelines: vi.fn()
    }
    store = storeBuilder(api)
    store.commit('search/index', project)
  })

  beforeEach(() => {
    vi.clearAllMocks()
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
})
