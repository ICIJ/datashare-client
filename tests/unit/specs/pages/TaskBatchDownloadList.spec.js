import { mount } from '@vue/test-utils'

import { flushPromises } from '~tests/unit/tests_utils'
import CoreSetup from '~tests/unit/CoreSetup'
import TaskBatchDownloadList from '@/pages/TaskBatchDownloadList'
import { getMode, MODE_NAME } from '@/mode'
import { storeBuilder } from '@/store/storeBuilder'

describe('TaskBatchDownloadList.vue', () => {
  const BatchDownloadList = [
    {
      id: 'BatchDownloadTask_01_id',
      name: 'BatchDownloadTask_01_name',
      result: {
        file: 'BatchDownloadTask_01_result',
        size: 1024
      },
      progress: 1,
      state: 'DONE',
      user: {
        id: 'test',
        provider: 'test',
        email: null,
        name: null
      },
      properties: {
        batchDownload: {
          uuid: 'uuid_01',
          encrypted: false,
          filename: 'filename_01_2021-01-01T12_45_25.137Z',
          query: 'query_01',
          exists: true,
          project: {
            name: 'project',
            sourcePath: 'source'
          },
          user: {
            id: 'test',
            provider: 'test',
            email: null,
            name: null
          }
        }
      }
    },
    {
      id: 'BatchDownloadTask_02_id',
      name: 'BatchDownloadTask_02_name',
      progress: 1,
      state: 'DONE',
      user: {
        id: 'test',
        provider: 'test',
        email: null,
        name: null
      },
      properties: {
        batchDownload: {
          uuid: 'uuid_02',
          encrypted: true,
          exists: false,
          filename: 'filename_02_2020-01-01T19_50_00.831Z',
          query: 'query_02',
          project: {
            name: 'project',
            sourcePath: 'source'
          },
          user: {
            id: 'test',
            provider: 'test',
            email: null,
            name: null
          }
        }
      }
    },
    {
      id: 'BatchDownloadTask_03_id',
      name: 'BatchDownloadTask_03_name',
      progress: 0.5,
      state: 'RUNNING',
      user: {
        id: 'test',
        provider: 'test',
        email: null,
        name: null
      },
      properties: {
        batchDownload: {
          uuid: 'uuid_03',
          encrypted: false,
          filename: 'filename_03_2020-12-07T17_35_20.314Z',
          query: 'query_03',
          project: {
            name: 'project',
            sourcePath: 'source'
          },
          user: {
            id: 'test',
            provider: 'test',
            email: null,
            name: null
          }
        }
      }
    },
    {
      id: 'BatchDownloadTask_04_id',
      name: 'BatchDownloadTask_04_name',
      progress: 1,
      state: 'DONE',
      user: {
        id: 'test',
        provider: 'test',
        email: null,
        name: null
      },
      properties: {
        batchDownload: {
          uuid: 'uuid_04',
          encrypted: false,
          filename: 'filename_03_2024-05-02T18_13_45.61Z',
          query: 'query_04',
          project: {
            name: 'project',
            sourcePath: 'source'
          },
          user: {
            id: 'test',
            provider: 'test',
            email: null,
            name: null
          }
        }
      }
    }
  ]

  let api, core, wrapper

  beforeEach(async () => {
    api = {
      getTasks: vi.fn().mockResolvedValue(BatchDownloadList)
    }
    core = CoreSetup.init(api, getMode(MODE_NAME.SERVER)).useAll()
    wrapper = mount(TaskBatchDownloadList, { global: { plugins: core.plugins } })
    await flushPromises()
  })

  it('should get all batch download tasks', async () => {
    await wrapper.vm.getDownloadTasks()

    expect(api.getTasks).toBeCalledTimes(2) // 1 on mount and 1 in the getDownloadTasks
    expect(api.getTasks).toBeCalledWith('BatchDownloadRunner')
  })

  it('should display a list of batch download tasks', async () => {
    expect(wrapper.findAll('.tasks-list__tasks__item')).toHaveLength(4)
  })

  it('should a message when zip is encrypted', async () => {
    expect(
      wrapper.find('.tasks-list__tasks__item:nth-child(4) .tasks-list__tasks__item__encrypted').exists()
    ).toBeTruthy()
  })

  it('should sort the list with pending tasks first then sort by datetime descending', async () => {
    expect(wrapper.find('.tasks-list__tasks__item:nth-child(1)').text()).toContain('BatchDownloadTask_03_id')
    expect(wrapper.find('.tasks-list__tasks__item:nth-child(2)').text()).toContain('BatchDownloadTask_04_id')
    expect(wrapper.find('.tasks-list__tasks__item:nth-child(3)').text()).toContain('BatchDownloadTask_01_id')
    expect(wrapper.find('.tasks-list__tasks__item:nth-child(4)').text()).toContain('BatchDownloadTask_02_id')
  })

  it('should display the zip size if there is any', async () => {
    expect(wrapper.find('.tasks-list__tasks__item:nth-child(3) .tasks-list__tasks__item__size').exists()).toBeTruthy()
    expect(wrapper.find('.tasks-list__tasks__item:nth-child(4) .tasks-list__tasks__item__size').exists()).toBeFalsy()
  })

  it('should disable the download when the file doesnt exist anymore', async () => {
    const span = wrapper.find(
      '#task-batch-download-list__item--uuid_02 .task-batch-download-list__item__link--disabled'
    )
    expect(span.exists()).toBeTruthy()
    expect(span.attributes('data-original-title')).toEqual('The archive has expired.')
  })
})
