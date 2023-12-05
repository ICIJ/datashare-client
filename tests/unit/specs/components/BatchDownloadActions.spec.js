import {flushPromises} from 'tests/unit/tests_utils'
import {createLocalVue, mount} from '@vue/test-utils'

import BatchDownloadActions from '@/components/BatchDownloadActions'
import {Core} from '@/core'

describe('BatchDownloadActions.vue', () => {
  const api = { runBatchDownload: jest.fn(), deleteTask: jest.fn() }
  const { i18n, localVue } = Core.init(createLocalVue(), api).useAll()
  const projects = [{ name: 'project' }]

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

  beforeEach(async () => {
    await flushPromises()
    jest.clearAllMocks()
  })

  describe('relaunchTask method', () => {
    it('should emit an error when the relaunch fails', async () => {
      const query = ';ERRORED;'
      const propsData = mockRunBatchDownload('id', 'erroredTask', { projects, query })
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      expect(wrapper.emitted().relaunchFailed).toBeUndefined()
      await wrapper.vm.relaunchTask()
      expect(wrapper.emitted().relaunchFailed).toBeDefined()
    })

    it('should emit a success when the relaunch', async () => {
      const query = '{ }'
      const propsData = mockRunBatchDownload('id', 'task', { projects, query })
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      expect(wrapper.emitted().relaunched).toBeUndefined()
      await wrapper.vm.relaunchTask()
      expect(wrapper.emitted().relaunched).toBeDefined()
    })

    it('should call the API with a parsed query', async () => {
      const query = '{ "foo": "bar" }'
      const propsData = mockRunBatchDownload('id', 'task', { projects, query })
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      await wrapper.vm.relaunchTask()
      expect(api.runBatchDownload).toHaveBeenCalledWith(expect.objectContaining({ query: { foo: 'bar' } }))
    })

    it('should call the API with a list of projects', async () => {
      const propsData = mockRunBatchDownload('id', 'task', { projects })
      const projectIds = ['project']
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      await wrapper.vm.relaunchTask()
      expect(api.runBatchDownload).toHaveBeenCalledWith(expect.objectContaining({ projectIds }))
    })
  })

  describe('deleteTask method', () => {
    it('should emit an error when the delete fails', async () => {
      const propsData = mockFailToDeleteBatchDownload('id', 'failing')
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      expect(wrapper.emitted().deleteFailed).toBeUndefined()
      await wrapper.vm.deleteTask()
      expect(wrapper.emitted().deleteFailed).toBeDefined()
    })

    it('should emit a success when the delete', async () => {
      const propsData = mockDeleteBatchDownload('id', 'successful')
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      expect(wrapper.emitted().deleted).toBeUndefined()
      await wrapper.vm.deleteTask()
      expect(wrapper.emitted().deleted).toBeDefined()
    })
  })
})
