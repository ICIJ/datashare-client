import { setActivePinia, createPinia } from 'pinia'

import { apiInstance as api } from '@/api/apiInstance'
import { useTaskStore } from '@/store/modules'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      index: vi.fn(),
      indexPath: vi.fn(),
      findNames: vi.fn(),
      stopPendingTasks: vi.fn(),
      stopTask: vi.fn(),
      removeDoneTasks: vi.fn(),
      getNerPipelines: vi.fn(),
      updateBatchSearch: vi.fn(),
      getTasks: vi.fn().mockResolvedValue({
        pagination: {
          total: 3,
          from: 0,
          size: 10
        },
        items: [
          {
            id: '12',
            state: 'SUCCESS'
          },
          {
            id: '46',
            state: 'QUEUED'
          },
          {
            id: '57',
            state: 'RUNNING'
          }
        ]
      })
    }
  }
})

describe('TaskStore', () => {
  let store

  beforeAll(() => {
    setActivePinia(createPinia())
  })

  beforeEach(async () => {
    vi.clearAllMocks()
    store = useTaskStore()
    await store.fetchTasks()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should define a store module', () => {
    expect(store).toBeDefined()
  })

  it('should stop pending tasks', async () => {
    await store.stopPendingTasks()
    expect(api.stopPendingTasks).toBeCalled()
  })

  it('should stop the task named 456', async () => {
    await store.stopTask('foo.bar@456')
    expect(api.stopTask).toBeCalledWith('foo.bar@456')
  })

  it('should delete done tasks', async () => {
    expect(store.hasDoneTasks).toBe(true)
    await store.removeDoneTasks()
    expect(api.removeDoneTasks).toBeCalled()
    expect(store.hasDoneTasks).toBe(false)
  })

  it('should indicate task 12 as over', () => {
    expect(store.isOver('12')).toBe(true)
  })

  it('should indicate task 46 as queued', () => {
    expect(store.isQueued('46')).toBe(true)
  })

  it('should indicate task 46 as not over', () => {
    expect(store.isOver('46')).toBe(false)
  })

  it('should indicate task 57 as running', () => {
    expect(store.isRunning('57')).toBe(true)
  })

  it('should indicate task 57 as not over', () => {
    expect(store.isOver('57')).toBe(false)
  })

  it('should delegate updateBatchSearch to the api', async () => {
    const fields = { name: 'New name', description: 'New description', published: true }
    await store.updateBatchSearch('uuid-1', fields)
    expect(api.updateBatchSearch).toBeCalledWith('uuid-1', fields)
  })

  it('should send a joined type param when fetching with types', async () => {
    await store.fetchTasks({ types: ['INDEX', 'SCAN'] })
    expect(api.getTasks).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'INDEX|SCAN' })
    )
  })

  it('should send type: null when fetching with no types', async () => {
    await store.fetchTasks()
    expect(api.getTasks).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: null })
    )
  })

  it('should send a joined type param when stopping pending tasks', async () => {
    await store.stopPendingTasks({ types: ['BATCH_SEARCH'] })
    expect(api.stopPendingTasks).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'BATCH_SEARCH' })
    )
  })

  it('should send a joined type param when removing done tasks', async () => {
    await store.removeDoneTasks({ types: ['BATCH_DOWNLOAD'] })
    expect(api.removeDoneTasks).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'BATCH_DOWNLOAD' })
    )
  })
})
