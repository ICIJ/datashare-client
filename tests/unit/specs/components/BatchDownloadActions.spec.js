import Api from '@/api'
import { flushPromises } from 'tests/unit/tests_utils'
import BatchDownloadActions from '@/components/BatchDownloadActions'
import { Core } from '@/core'
import { createLocalVue, mount } from '@vue/test-utils'

describe('BatchDownloadActions.vue', () => {
  const { i18n, localVue } = Core.init(createLocalVue()).useAll()
  const projects = [{ name: 'project' }]

  function mockRunBatchDownload (name = 'BatchDownloadTask', batchDownload = {}, state = 'DONE') {
    const data = {
      name,
      state,
      user: batchDownload.user,
      properties: { batchDownload }
    }
    // Mock the `runBatchDownload` method
    const spy = jest.spyOn(Api.prototype, 'runBatchDownload')
      .mockImplementation(Promise.resolve(data))
    return { batchDownload, name, state, spy }
  }

  function mockDeleteBatchDownload (name = 'BatchDownloadTask', batchDownload = {}, state = 'DONE') {
    // Mock the `deleteTask` method
    const spy = jest.spyOn(Api.prototype, 'deleteTask')
      .mockImplementation(Promise.resolve(true))
    return { batchDownload, name, state, spy }
  }

  function mockFailToDeleteBatchDownload (name = 'BatchDownloadTask', batchDownload = {}, state = 'RUNNING') {
    // Mock the `deleteTask` method
    const spy = jest.spyOn(Api.prototype, 'deleteTask')
      .mockImplementation(Promise.reject(new Error('')))
    return { batchDownload, name, state, spy }
  }

  beforeEach(async () => {
    await flushPromises()
    // Then clear all mocks
    jest.clearAllMocks()
  })

  describe('relaunchTask method', () => {
    it('should emit an error when the relaunch fails', async () => {
      const query = ';ERRORED;'
      const { batchDownload: value } = mockRunBatchDownload('erroredTask', { projects, query })
      const propsData = { value }
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      await wrapper.vm.relaunchTask()
      expect(wrapper.emitted('reluanchFailed'))
    })

    it('should emit a success when the relaunch', async () => {
      const query = '{ }'
      const { batchDownload: value } = mockRunBatchDownload('task', { projects, query })
      const propsData = { value }
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      await wrapper.vm.relaunchTask()
      expect(wrapper.emitted('reluanched'))
    })

    it('should call the API with a parsed query', async () => {
      const query = '{ "foo": "bar" }'
      const { batchDownload: value, spy } = mockRunBatchDownload('task', { projects, query })
      const propsData = { value }
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      await wrapper.vm.relaunchTask()
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ query: { foo: 'bar' } }))
    })

    it('should call the API with a list of projects', async () => {
      const { batchDownload: value, spy } = mockRunBatchDownload('task', { projects })
      const propsData = { value }
      const projectIds = ['project']
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      await wrapper.vm.relaunchTask()
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ projectIds }))
    })
  })

  describe('deleteTask method', () => {
    it('should emit an error when the delete fails', async () => {
      const { name, batchDownload: value } = mockFailToDeleteBatchDownload('failing')
      const propsData = { name, value }
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      await wrapper.vm.deleteTask()
      expect(wrapper.emitted('deleteFailed'))
    })

    it('should emit a success when the delete', async () => {
      const { name, batchDownload: value } = mockDeleteBatchDownload('successful')
      const propsData = { name, value }
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      await wrapper.vm.deleteTask()
      expect(wrapper.emitted('deleted'))
    })
  })
})
