import { flushPromises, shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import TaskBatchSearchFormEdit from '@/components/Task/TaskBatchSearch/TaskBatchSearchFormEdit'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: {
    getBatchSearch: vi.fn(),
    updateBatchSearch: vi.fn()
  }
}))

describe('TaskBatchSearchFormEdit', () => {
  let plugins

  beforeEach(() => {
    vi.clearAllMocks()
    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    plugins = core.plugins
    core.config.set('projects', [{ name: 'local-datashare' }])
    api.getBatchSearch.mockResolvedValue({
      uuid: 'uuid-1',
      name: 'My batch',
      description: 'A description',
      published: true,
      projects: ['local-datashare']
    })
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  async function mountEdit() {
    const wrapper = shallowMount(TaskBatchSearchFormEdit, {
      global: { plugins },
      props: { indices: 'local-datashare', uuid: 'uuid-1' }
    })
    await flushPromises()
    return wrapper
  }

  it('fetches the batch search on mount and seeds visibility', async () => {
    const wrapper = await mountEdit()
    expect(api.getBatchSearch).toHaveBeenCalledWith('uuid-1')
    expect(wrapper.vm.$.setupState.visibility).toBe(true)
    expect(wrapper.vm.$.setupState.name).toBe('My batch')
  })

  it('saves visibility and shows a success toast on submit', async () => {
    api.updateBatchSearch.mockResolvedValue()
    const wrapper = await mountEdit()
    vi.spyOn(wrapper.vm.$router, 'push').mockResolvedValue()
    vi.spyOn(wrapper.vm.$toast, 'success')
    vi.spyOn(wrapper.vm.$toast, 'error')

    await wrapper.find('form-creation-stub').trigger('submit')
    await flushPromises()

    expect(api.updateBatchSearch).toHaveBeenCalledWith('uuid-1', true)
    expect(wrapper.vm.$toast.success).toHaveBeenCalledOnce()
    expect(wrapper.vm.$toast.error).not.toHaveBeenCalled()
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
      name: 'task.batch-search-results.list',
      params: { indices: 'local-datashare', uuid: 'uuid-1' }
    })
  })

  it('shows an error toast when the update fails', async () => {
    api.updateBatchSearch.mockRejectedValue(new Error('500'))
    const wrapper = await mountEdit()
    vi.spyOn(wrapper.vm.$router, 'push').mockResolvedValue()
    vi.spyOn(wrapper.vm.$toast, 'success')
    vi.spyOn(wrapper.vm.$toast, 'error')

    await wrapper.find('form-creation-stub').trigger('submit')
    await flushPromises()

    expect(wrapper.vm.$toast.error).toHaveBeenCalledOnce()
    expect(wrapper.vm.$toast.success).not.toHaveBeenCalled()
  })
})
