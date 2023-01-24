import { flushPromises } from 'tests/unit/tests_utils'
import BatchDownloadActions from '@/components/BatchDownloadActions'
import { Core } from '@/core'
import { createLocalVue, mount } from '@vue/test-utils'

describe('BatchDownloadActions.vue', () => {
  const mockApi = { runBatchDownload: jest.fn(), deleteTask: jest.fn() }
  const { i18n, localVue } = Core.init(createLocalVue(), mockApi).useAll()
  const projects = [{ name: 'project' }]

  function mockRunBatchDownload(name = 'BatchDownloadTask', batchDownload = {}, state = 'DONE') {
    const data = {
      name,
      state,
      user: batchDownload.user,
      properties: { batchDownload }
    }
    mockApi.runBatchDownload.mockResolvedValue(data)
    return { batchDownload, name, state }
  }

  function mockDeleteBatchDownload(name = 'BatchDownloadTask', batchDownload = {}, state = 'DONE') {
    mockApi.deleteTask.mockResolvedValue(true)
    return { batchDownload, name, state }
  }

  function mockFailToDeleteBatchDownload(name = 'BatchDownloadTask', batchDownload = {}, state = 'RUNNING') {
    mockApi.deleteTask.mockRejectedValue(new Error(''))
    return { batchDownload, name, state }
  }

  beforeEach(async () => {
    await flushPromises()
    jest.clearAllMocks()
  })

  describe('relaunchTask method', () => {
    it('should emit an error when the relaunch fails', async () => {
      const query = ';ERRORED;'
      const { batchDownload: value } = mockRunBatchDownload('erroredTask', { projects, query })
      const propsData = { value }
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      expect(wrapper.emitted().relaunchFailed).toBeUndefined()
      await wrapper.vm.relaunchTask()
      expect(wrapper.emitted().relaunchFailed).toBeDefined()
    })

    it('should emit a success when the relaunch', async () => {
      const query = '{ }'
      const { batchDownload: value } = mockRunBatchDownload('task', { projects, query })
      const propsData = { value }
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      expect(wrapper.emitted().relaunched).toBeUndefined()
      await wrapper.vm.relaunchTask()
      expect(wrapper.emitted().relaunched).toBeDefined()
    })

    it('should call the API with a parsed query', async () => {
      const query = '{ "foo": "bar" }'
      const { batchDownload: value } = mockRunBatchDownload('task', { projects, query })
      const propsData = { value }
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      await wrapper.vm.relaunchTask()
      expect(mockApi.runBatchDownload).toHaveBeenCalledWith(expect.objectContaining({ query: { foo: 'bar' } }))
    })

    it('should call the API with a list of projects', async () => {
      const { batchDownload: value } = mockRunBatchDownload('task', { projects })
      const propsData = { value }
      const projectIds = ['project']
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      await wrapper.vm.relaunchTask()
      expect(mockApi.runBatchDownload).toHaveBeenCalledWith(expect.objectContaining({ projectIds }))
    })
  })

  describe('deleteTask method', () => {
    it('should emit an error when the delete fails', async () => {
      const { name, batchDownload: value } = mockFailToDeleteBatchDownload('failing')
      const propsData = { name, value }
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      expect(wrapper.emitted().deleteFailed).toBeUndefined()
      await wrapper.vm.deleteTask()
      expect(wrapper.emitted().deleteFailed).toBeDefined()
    })

    it('should emit a success when the delete', async () => {
      const { name, batchDownload: value } = mockDeleteBatchDownload('successful')
      const propsData = { name, value }
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      expect(wrapper.emitted().deleted).toBeUndefined()
      await wrapper.vm.deleteTask()
      expect(wrapper.emitted().deleted).toBeDefined()
    })
  })
})
