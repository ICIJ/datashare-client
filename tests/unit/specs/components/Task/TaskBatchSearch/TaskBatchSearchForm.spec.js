import { flushPromises, shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import TaskBatchSearchForm from '@/components/Task/TaskBatchSearch/TaskBatchSearchForm'
import { apiInstance as api } from '@/api/apiInstance'
import { BATCH_SEARCH_CSV_STRING } from '@/enums/batchSearch'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: {
    batchSearch: vi.fn(),
    elasticsearch: {
      rootSearch: vi.fn().mockReturnValue({
        build: vi.fn().mockReturnValue({ query: { match_all: {} } })
      })
    }
  }
}))

describe('TaskBatchSearchForm', () => {
  let core, plugins

  beforeAll(() => {
    core = CoreSetup.init().useAll().useRouterWithoutGuards()
  })

  beforeEach(() => {
    core.createPinia()
    plugins = core.plugins
    vi.clearAllMocks()
    core.config.set('projects', [{ name: 'local-datashare' }])
    core.config.set('defaultProject', 'local-datashare')
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  function createValidWrapper() {
    const wrapper = shallowMount(TaskBatchSearchForm, { global: { plugins } })
    // Directly set internal refs to make the form valid (name + csv).
    // setupState auto-unwraps refs, so we assign values directly.
    wrapper.vm.$.setupState.name = 'Test Batch Search'
    wrapper.vm.$.setupState.csvTab = BATCH_SEARCH_CSV_STRING
    wrapper.vm.$.setupState.csvString = 'test query'
    return wrapper
  }

  it('shows a success toast when batch search is created', async () => {
    api.batchSearch.mockResolvedValue('task-id-123')
    const wrapper = createValidWrapper()
    vi.spyOn(wrapper.vm.$router, 'push').mockResolvedValue()
    vi.spyOn(wrapper.vm.$toast, 'success')
    vi.spyOn(wrapper.vm.$toast, 'error')

    await wrapper.find('form-creation-stub').trigger('submit')
    await flushPromises()

    expect(api.batchSearch).toHaveBeenCalledOnce()
    expect(wrapper.vm.$toast.success).toHaveBeenCalledOnce()
    expect(wrapper.vm.$toast.error).not.toHaveBeenCalled()
  })

  it('shows an error toast when batch search creation fails', async () => {
    api.batchSearch.mockRejectedValue(new Error('500 Internal Server Error'))
    const wrapper = createValidWrapper()
    vi.spyOn(wrapper.vm.$router, 'push').mockResolvedValue()
    vi.spyOn(wrapper.vm.$toast, 'success')
    vi.spyOn(wrapper.vm.$toast, 'error')

    await wrapper.find('form-creation-stub').trigger('submit')
    await flushPromises()

    expect(api.batchSearch).toHaveBeenCalledOnce()
    expect(wrapper.vm.$toast.error).toHaveBeenCalledOnce()
    expect(wrapper.vm.$toast.success).not.toHaveBeenCalled()
  })
})
