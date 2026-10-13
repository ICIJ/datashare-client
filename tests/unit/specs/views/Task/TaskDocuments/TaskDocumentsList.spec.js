import { flushPromises, mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import TaskDocumentsList from '@/views/Task/TaskDocuments/TaskDocumentsList'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', {
  apiInstance: {
    getTasks: vi.fn().mockResolvedValue({ items: [] }),
    stopTask: vi.fn().mockResolvedValue('')
  }
})

describe('TaskDocumentsList.vue', () => {
  let plugins

  beforeEach(() => {
    api.getTasks.mockResolvedValue({
      items: [
        {
          name: 'org.icij.datashare.tasks.IndexTask',
          id: '0b6ae4a4-9a5e-4b63-8a3f-2b0fbc7c1d11',
          state: 'RUNNING',
          progress: 0,
          args: { defaultProject: 'local-datashare' },
          createdAt: new Date()
        }
      ]
    })

    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    plugins = core.plugins
  })

  afterEach(async () => {
    await flushPromises()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should enable the stop button for a running task', async () => {
    const wrapper = mount(TaskDocumentsList, { global: { plugins } })
    await flushPromises()
    const stopButton = wrapper.find('.page-table-generic__row button[aria-label="Stop"]')
    expect(stopButton.attributes('disabled')).toBeUndefined()
  })

  it('should stop the task when clicking on the stop button', async () => {
    const wrapper = mount(TaskDocumentsList, { global: { plugins } })
    await flushPromises()
    await wrapper.find('.page-table-generic__row button[aria-label="Stop"]').trigger('click')
    expect(api.stopTask).toBeCalledWith('0b6ae4a4-9a5e-4b63-8a3f-2b0fbc7c1d11')
  })
})
