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
      getTasks: vi.fn().mockResolvedValue([
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
      ])
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
})
