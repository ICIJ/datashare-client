import Api from '@/api'
import { flushPromises } from 'tests/unit/tests_utils'
import BatchDownloadActions from '@/components/BatchDownloadActions'
import { Core } from '@/core'
import { createLocalVue, mount } from '@vue/test-utils'

describe('BatchDownloadActions.vue', () => {
  const { i18n, localVue } = Core.init(createLocalVue()).useAll()

  function mockRunBatchDownload (batchDownload) {
    // Returns data
    const data = {
      name: 'BatchDownloadTask',
      progress: 0,
      state: 'RUNNING',
      user: batchDownload.user,
      properties: { batchDownload }
    }
    // Mock the `runBatchDownload` method
    const spy = jest.spyOn(Api.prototype, 'runBatchDownload')
      .mockImplementation(Promise.resolve(data))
    return { batchDownload, data, spy }
  }

  beforeEach(async () => {
    await flushPromises()
    // Then clear all mocks
    jest.clearAllMocks()
  })

  describe('relaunch method', () => {
    it('should emit an error when the relaunch fails', async () => {
      const { batchDownload: value } = mockRunBatchDownload({
        query: ';ERRORED;',
        projects: [
          {
            name: 'project',
            sourcePath: 'source'
          }
        ]
      })

      const propsData = { value }
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      await wrapper.vm.relaunch()
      expect(wrapper.emitted('reluanchFailed'))
    })

    it('should emit a success when the relaunch', async () => {
      const { batchDownload: value } = mockRunBatchDownload({
        query: '{ }',
        projects: [
          {
            name: 'project',
            sourcePath: 'source'
          }
        ]
      })

      const propsData = { value }
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      await wrapper.vm.relaunch()
      expect(wrapper.emitted('reluanched'))
    })

    it('should call the API with a parsed query', async () => {
      const { batchDownload: value, spy } = mockRunBatchDownload({
        query: '{ "foo": "bar" }',
        projects: []
      })

      const propsData = { value }
      const query = { foo: 'bar' }
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      await wrapper.vm.relaunch()
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ query }))
    })

    it('should call the API with a list of projects', async () => {
      const { batchDownload: value, spy } = mockRunBatchDownload({
        projects: [
          {
            name: 'project',
            sourcePath: 'source'
          }
        ]
      })

      const propsData = { value }
      const projectIds = ['project']
      const wrapper = mount(BatchDownloadActions, { propsData, i18n, localVue })
      await wrapper.vm.relaunch()
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ projectIds }))
    })
  })
})
