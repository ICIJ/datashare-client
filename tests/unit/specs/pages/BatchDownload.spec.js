import { flushPromises } from 'tests/unit/tests_utils'
import { createLocalVue, mount } from '@vue/test-utils'

import { Api } from '@/api'
import BatchDownload from '@/pages/BatchDownload'
import { Core } from '@/core'
import { getMode, MODE_NAME } from '@/mode'
import { storeBuilder } from '@/store/storeBuilder'

describe('BatchDownload.vue', () => {
  let i18n, localVue, wrapper, store, wait, mockAxios

  beforeAll(() => {
    mockAxios = { request: jest.fn() }
    const api = new Api(mockAxios, null)
    const core = Core.init(createLocalVue(), api, getMode(MODE_NAME.SERVER)).useAll()
    i18n = core.i18n
    localVue = core.localVue
    wait = core.wait
    store = storeBuilder(api)
  })
  beforeEach(async () => {
    mockAxios.request.mockResolvedValue({
      data: [
        {
          name: 'BatchDownloadTask_01_name',
          result: 'BatchDownloadTask_01_result',
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
              filename: 'filename_01_2021-01-01T12:45:25',
              query: 'query_01',
              zipSize: 150,
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
          name: 'BatchDownloadTask_02_name',
          result: 'BatchDownloadTask_02_result',
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
              filename: 'filename_02_2020-01-01T19:50:00',
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
          name: 'BatchDownloadTask_03_name',
          result: 'BatchDownloadTask_03_result',
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
              filename: 'filename_03_2020-12-07T17:35:20',
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
        }
      ]
    })
    wrapper = mount(BatchDownload, { i18n, localVue, store, wait })
    mockAxios.request.mockClear()
    await flushPromises()
  })

  it('should get all batch download tasks', async () => {
    await wrapper.vm.getDownloadTasks()

    expect(mockAxios.request).toBeCalledTimes(1)
    expect(mockAxios.request).toBeCalledWith({
      url: Api.getFullUrl('/api/task/all'),
      params: {
        filter: 'BatchDownloadRunner'
      }
    })
  })

  it('should display a list of batch download tasks', async () => {
    expect(wrapper.findAll('.tasks-list__tasks__item')).toHaveLength(3)
  })

  it('should a message when zip is encrypted', async () => {
    expect(
      wrapper.find('.tasks-list__tasks__item:nth-child(3) .tasks-list__tasks__item__encrypted').exists()
    ).toBeTruthy()
  })

  it('should sort the list with pending tasks first then sort by datetime descending', async () => {
    expect(wrapper.find('.tasks-list__tasks__item:nth-child(1)').text()).toContain('BatchDownloadTask_03_name')
    expect(wrapper.find('.tasks-list__tasks__item:nth-child(2)').text()).toContain('BatchDownloadTask_01_name')
    expect(wrapper.find('.tasks-list__tasks__item:nth-child(3)').text()).toContain('BatchDownloadTask_02_name')
  })

  it('should display the zip size if there is any', async () => {
    expect(wrapper.find('.tasks-list__tasks__item:nth-child(2) .tasks-list__tasks__item__size').exists()).toBeTruthy()
    expect(wrapper.find('.tasks-list__tasks__item:nth-child(3) .tasks-list__tasks__item__size').exists()).toBeFalsy()
  })

  it('should disable the download when the file doesnt exist anymore', async () => {
    const span = wrapper.find('#batch-download__item--uuid_02 .batch-download__item__link--disabled')
    expect(span.exists()).toBeTruthy()
    expect(span.element.title).toEqual('The archive has expired.')
  })
})
