import { flushPromises, mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import TaskBatchSearchEdit from '@/views/Task/TaskBatchSearch/TaskBatchSearchEdit'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: {
    getBatchSearch: vi.fn(),
    updateBatchSearch: vi.fn()
  }
}))

describe('TaskBatchSearchEdit', () => {
  let plugins
  let router

  beforeEach(async () => {
    vi.clearAllMocks()
    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    plugins = core.plugins
    router = core.router
    core.config.set('projects', [{ name: 'local-datashare' }])
    api.getBatchSearch.mockResolvedValue({
      uuid: 'uuid-1',
      name: 'My batch',
      description: 'A description',
      published: true,
      projects: ['local-datashare']
    })
    // The breadcrumb resolves sibling routes (queries list) by name and
    // inherits the indices/uuid params from the current route, so we must be
    // on the edit route before mounting.
    await router.push({
      name: 'task.batch-search.edit',
      params: { indices: 'local-datashare', uuid: 'uuid-1' }
    })
    await router.isReady()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  async function mountEdit() {
    const wrapper = mount(TaskBatchSearchEdit, {
      global: { plugins },
      props: { indices: 'local-datashare', uuid: 'uuid-1' }
    })
    await flushPromises()
    return wrapper
  }

  it('fetches the batch search on mount', async () => {
    await mountEdit()
    expect(api.getBatchSearch).toHaveBeenCalledWith('uuid-1')
  })

  it('renders the batch search name in the breadcrumb', async () => {
    const wrapper = await mountEdit()
    expect(wrapper.find('.navigation-breadcrumb').text()).toContain('My batch')
  })
})
