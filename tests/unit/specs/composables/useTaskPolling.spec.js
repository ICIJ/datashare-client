import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { ref, defineComponent, h, nextTick } from 'vue'

import { useTaskPolling } from '@/composables/useTaskPolling'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: {
    getTasks: vi.fn().mockResolvedValue({ items: [], pagination: { total: 0, from: 0, size: 10 } })
  }
}))

const wrappers = []

function mountComposable(options = {}) {
  const result = {}
  const TestComponent = defineComponent({
    setup() {
      Object.assign(result, useTaskPolling(options))
      return () => h('div')
    }
  })
  const pinia = createPinia()
  const wrapper = mount(TestComponent, { global: { plugins: [pinia] } })
  wrappers.push(wrapper)
  return { wrapper, result }
}

describe('useTaskPolling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Unmounting stops the polls a test may have started
    wrappers.splice(0).forEach(wrapper => wrapper.unmount())
    vi.useRealTimers()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should not send args.batchRecord.name filter when searchQuery is empty', async () => {
    const searchQuery = ref('')
    mountComposable({
      types: ['BATCH_SEARCH'],
      searchQuery,
      sortBy: ref(['createdAt', 'desc']),
      perPage: ref(10),
      page: ref(1)
    })
    await flushPromises()

    expect(api.getTasks).toHaveBeenCalled()
    const callArgs = api.getTasks.mock.calls[0][0]
    expect(callArgs).not.toHaveProperty('args.batchRecord.name')
  })

  it('should not send args.batchRecord.name filter when searchQuery is null', async () => {
    const searchQuery = ref(null)
    mountComposable({
      types: ['BATCH_SEARCH'],
      searchQuery,
      sortBy: ref(['createdAt', 'desc']),
      perPage: ref(10),
      page: ref(1)
    })
    await flushPromises()

    expect(api.getTasks).toHaveBeenCalled()
    const callArgs = api.getTasks.mock.calls[0][0]
    expect(callArgs).not.toHaveProperty('args.batchRecord.name')
  })

  it('should send args.batchRecord.name filter when searchQuery has a value', async () => {
    const searchQuery = ref('my search')
    mountComposable({
      types: ['BATCH_SEARCH'],
      searchQuery,
      sortBy: ref(['createdAt', 'desc']),
      perPage: ref(10),
      page: ref(1)
    })
    await flushPromises()

    expect(api.getTasks).toHaveBeenCalled()
    const callArgs = api.getTasks.mock.calls[0][0]
    expect(callArgs['args.batchRecord.name']).toBe('my search')
  })

  it('should not reload tasks when a watched source changes identity but not value', async () => {
    const sortBy = ref(['createdAt', 'desc'])
    const { result } = mountComposable({ types: ['BATCH_DOWNLOAD'], sortBy, perPage: ref(10), page: ref(1) })
    await flushPromises()
    expect(api.getTasks).toHaveBeenCalledTimes(1)

    // e.g. `useUrlParamsWithStore` rebuilds its array on any unrelated route change
    sortBy.value = ['createdAt', 'desc']
    await nextTick()
    expect(result.isLoading.value).toBe(false)
    await flushPromises()
    expect(api.getTasks).toHaveBeenCalledTimes(1)
  })

  it('should reload tasks with a loader when a watched source changes value', async () => {
    const page = ref(1)
    const { result } = mountComposable({ types: ['BATCH_DOWNLOAD'], sortBy: ref(['createdAt', 'desc']), perPage: ref(10), page })
    await flushPromises()

    page.value = 2
    await nextTick()
    expect(result.isLoading.value).toBe(true)
    await flushPromises()
    expect(api.getTasks).toHaveBeenCalledTimes(2)
    expect(api.getTasks.mock.calls[1][0].from).toBe(10)
  })

  it('should start polling again when a refresh finds a pending task', async () => {
    vi.useFakeTimers()
    const pagination = { total: 1, from: 0, size: 10 }
    api.getTasks.mockResolvedValueOnce({ items: [{ id: 'a', state: 'DONE' }], pagination })
    const { result } = mountComposable({ types: ['BATCH_DOWNLOAD'], sortBy: ref(['createdAt', 'desc']), perPage: ref(10), page: ref(1) })
    await vi.advanceTimersByTimeAsync(5000)
    // No pending task, so no polling
    expect(api.getTasks).toHaveBeenCalledTimes(1)

    // e.g. a task was relaunched
    api.getTasks.mockResolvedValueOnce({ items: [{ id: 'a', state: 'QUEUED' }], pagination })
    await result.startPollingTasks()
    expect(api.getTasks).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(5000)
    expect(api.getTasks.mock.calls.length).toBeGreaterThan(2)
  })

  it('should keep polling when a refresh fails', async () => {
    vi.useFakeTimers()
    const running = { items: [{ id: 'a', state: 'RUNNING' }], pagination: { total: 1, from: 0, size: 10 } }
    api.getTasks.mockResolvedValueOnce(running)
    const { result } = mountComposable({ types: ['BATCH_DOWNLOAD'], sortBy: ref(['createdAt', 'desc']), perPage: ref(10), page: ref(1) })
    await vi.advanceTimersByTimeAsync(0)
    expect(api.getTasks).toHaveBeenCalledTimes(1)

    api.getTasks.mockRejectedValueOnce(new Error('Network Error')).mockResolvedValueOnce(running)
    await expect(result.startPollingTasks()).rejects.toThrow('Network Error')
    expect(api.getTasks).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(5000)
    expect(api.getTasks.mock.calls.length).toBeGreaterThan(2)
  })

  it('should forward types to the store as a joined type param', async () => {
    mountComposable({
      types: ['INDEX', 'SCAN'],
      searchQuery: ref(''),
      sortBy: ref(['createdAt', 'desc']),
      perPage: ref(10),
      page: ref(1)
    })
    await flushPromises()

    expect(api.getTasks).toHaveBeenCalled()
    const callArgs = api.getTasks.mock.calls[0][0]
    expect(callArgs.type).toBe('INDEX|SCAN')
  })
})
