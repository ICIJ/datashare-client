import { setActivePinia, createPinia } from 'pinia'

import { apiInstance as api } from '@/api/apiInstance'
import { useTaskStore } from '@/store/modules'

vi.mock('@/api/apiInstance', {
  apiInstance: {
    index: vi.fn(),
    indexPath: vi.fn(),
    findNames: vi.fn(),
    stopPendingTasks: vi.fn(),
    stopTask: vi.fn(),
    getTasks: vi.fn(),
    deleteDoneTasks: vi.fn(),
    getNerPipelines: vi.fn()
  }
})

describe('TaskStore', () => {
  let store

  beforeAll(() => {
    setActivePinia(createPinia())
  })

  beforeEach(() => {
    vi.clearAllMocks()
    store = useTaskStore()
    store.reset()
  })

  it('should define a store module', () => {
    expect(store).toBeDefined()
  })

  it('should stop pending tasks', async () => {
    store.setTasks([{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' }])
    expect(store.tasks).toHaveLength(1)

    await store.stopPendingTasks()

    expect(store.tasks).toHaveLength(0)
    expect(api.stopPendingTasks).toBeCalledTimes(1)
  })

  it('should stop the task named 456', async () => {
    store.setTasks([
      { name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' },
      { name: 'foo.bar@456', progress: 0.7, state: 'RUNNING' }
    ])
    expect(store.tasks).toHaveLength(2)

    await store.stopTask('foo.bar@456')

    expect(store.tasks).toHaveLength(1)
    expect(api.stopTask).toBeCalledTimes(1)
    expect(api.stopTask).toBeCalledWith('foo.bar@456')
  })

  it('should delete done tasks', async () => {
    store.setTasks([{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' }])
    expect(store.tasks).toHaveLength(1)

    await store.deleteDoneTasks()

    expect(store.tasks).toHaveLength(0)
    expect(api.deleteDoneTasks).toBeCalledTimes(1)
  })
})
