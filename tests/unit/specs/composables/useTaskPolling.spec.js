import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { ref, defineComponent, h } from 'vue'

import { useTaskPolling } from '@/composables/useTaskPolling'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: {
    getTasks: vi.fn().mockResolvedValue({ items: [], pagination: { total: 0, from: 0, size: 10 } })
  }
}))

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
  return { wrapper, result }
}

describe('useTaskPolling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should not send args.batchRecord.name filter when searchQuery is empty', async () => {
    const searchQuery = ref('')
    mountComposable({
      names: ['org.icij.datashare.tasks.BatchSearchRunner'],
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
      names: ['org.icij.datashare.tasks.BatchSearchRunner'],
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
      names: ['org.icij.datashare.tasks.BatchSearchRunner'],
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
})
