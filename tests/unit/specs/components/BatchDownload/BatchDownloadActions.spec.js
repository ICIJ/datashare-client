import { mount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import BatchDownloadActions from '@/components/BatchDownload/BatchDownloadActions'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', {
  apiInstance: {
    runBatchDownload: vi.fn(),
    removeTask: vi.fn()
  }
})

describe('BatchDownloadActions.vue', () => {
  const projects = [{ name: 'project' }]
  let plugins

  function mockRunBatchDownload(id = 'id', name = 'BatchDownloadTask', batchDownload = {}, state = 'DONE') {
    const data = {
      id,
      name,
      state,
      user: batchDownload.user,
      properties: { batchDownload }
    }
    api.runBatchDownload.mockResolvedValue(data)
    return { value: batchDownload, id, name, state }
  }

  function mockDeleteBatchDownload(id = 'id', name = 'BatchDownloadTask', batchDownload = {}, state = 'DONE') {
    api.removeTask.mockResolvedValue(true)
    return { value: batchDownload, id, name, state }
  }

  beforeAll(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  beforeEach(async () => {
    await flushPromises()
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  describe('relaunchTask method', () => {
    it('should emit a refresh when the relaunch is done', async () => {
      const query = { query: '{ }' }
      const props = mockRunBatchDownload('id', 'task', { projects, query })
      const wrapper = mount(BatchDownloadActions, { props, global: { plugins } })
      expect(wrapper.emitted().refresh).toBeUndefined()
      await wrapper.vm.relaunch()
      expect(wrapper.emitted().refresh).toBeDefined()
    })

    it('should call the API with a parsed query', async () => {
      const query = { query: '{ "foo": "bar" }' }
      const props = mockRunBatchDownload('id', 'task', { projects, query })
      const wrapper = mount(BatchDownloadActions, { props, global: { plugins } })
      await wrapper.vm.relaunch()
      expect(api.runBatchDownload).toHaveBeenCalledWith(expect.objectContaining({ query: { foo: 'bar' } }))
    })

    it('should call the API with a list of projects', async () => {
      const props = mockRunBatchDownload('id', 'task', { projects })
      const projectIds = ['project']
      const wrapper = mount(BatchDownloadActions, { props, global: { plugins } })
      await wrapper.vm.relaunch()
      expect(api.runBatchDownload).toHaveBeenCalledWith(expect.objectContaining({ projectIds }))
    })
  })

  describe('removeTask method', () => {
    it('should emit a refresh when the delete', async () => {
      const props = mockDeleteBatchDownload('id', 'successful')
      const wrapper = mount(BatchDownloadActions, { props, global: { plugins } })
      expect(wrapper.emitted().refresh).toBeUndefined()
      await wrapper.vm.remove()
      expect(wrapper.emitted().refresh).toBeDefined()
    })
  })
})
