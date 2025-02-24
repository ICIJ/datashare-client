import { mount } from '@vue/test-utils'

import { flushPromises } from '~tests/unit/tests_utils'
import CoreSetup from '~tests/unit/CoreSetup'
import BatchDownloadActions from '@/components/BatchDownloadActions'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', {
  apiInstance: {
    runBatchDownload: vi.fn(),
    deleteTask: vi.fn()
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
    api.deleteTask.mockResolvedValue(true)
    return { value: batchDownload, id, name, state }
  }

  function mockFailToDeleteBatchDownload(id = 'id', name = 'BatchDownloadTask', batchDownload = {}, state = 'RUNNING') {
    api.deleteTask.mockRejectedValue(new Error(''))
    return { value: batchDownload, id, name, state }
  }

  beforeAll(() => {
    const core = CoreSetup.init().useAll()
    plugins = [core.plugin, core.i18n]
  })

  beforeEach(async () => {
    await flushPromises()
    vi.clearAllMocks()
  })

  describe('relaunchTask method', () => {
    it('should emit an error when the relaunch fails', async () => {
      const query = { query: ';ERRORED;' }
      const props = mockRunBatchDownload('id', 'erroredTask', { projects, query })
      const wrapper = mount(BatchDownloadActions, { props, global: { plugins } })
      expect(wrapper.emitted().relaunchFailed).toBeUndefined()
      await wrapper.vm.relaunchTask()
      expect(wrapper.emitted().relaunchFailed).toBeDefined()
    })

    it('should emit a success when the relaunch', async () => {
      const query = { query: '{ }' }
      const props = mockRunBatchDownload('id', 'task', { projects, query })
      const wrapper = mount(BatchDownloadActions, { props, global: { plugins } })
      expect(wrapper.emitted().relaunched).toBeUndefined()
      await wrapper.vm.relaunchTask()
      expect(wrapper.emitted().relaunched).toBeDefined()
    })

    it('should call the API with a parsed query', async () => {
      const query = { query: '{ "foo": "bar" }' }
      const props = mockRunBatchDownload('id', 'task', { projects, query })
      const wrapper = mount(BatchDownloadActions, { props, global: { plugins } })
      await wrapper.vm.relaunchTask()
      expect(api.runBatchDownload).toHaveBeenCalledWith(expect.objectContaining({ query: { foo: 'bar' } }))
    })

    it('should call the API with a list of projects', async () => {
      const props = mockRunBatchDownload('id', 'task', { projects })
      const projectIds = ['project']
      const wrapper = mount(BatchDownloadActions, { props, global: { plugins } })
      await wrapper.vm.relaunchTask()
      expect(api.runBatchDownload).toHaveBeenCalledWith(expect.objectContaining({ projectIds }))
    })
  })

  describe('deleteTask method', () => {
    it('should emit an error when the delete fails', async () => {
      const props = mockFailToDeleteBatchDownload('id', 'failing')
      const wrapper = mount(BatchDownloadActions, { props, global: { plugins } })
      expect(wrapper.emitted().deleteFailed).toBeUndefined()
      await wrapper.vm.deleteTask()
      expect(wrapper.emitted().deleteFailed).toBeDefined()
    })

    it('should emit a success when the delete', async () => {
      const props = mockDeleteBatchDownload('id', 'successful')
      const wrapper = mount(BatchDownloadActions, { props, global: { plugins } })
      expect(wrapper.emitted().deleted).toBeUndefined()
      await wrapper.vm.deleteTask()
      expect(wrapper.emitted().deleted).toBeDefined()
    })
  })
})
