import { mount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import TaskBatchDownloadList from '@/views/Task/TaskBatchDownload/TaskBatchDownloadList'
import { apiInstance as api } from '@/api/apiInstance'
import BatchDownloadActions from '@/components/BatchDownloadActions'

vi.mock('@/api/apiInstance', {
  apiInstance: {
    getTasks: vi.fn().mockResolvedValue([])
  }
})

describe('TaskBatchDownloadList.vue', () => {
  let plugins

  beforeEach(async () => {
    api.getTasks.mockResolvedValue([
      {
        id: '7d664d35-2c11-4f40-9cd5-a9fca9e2384e',
        name: 'org.icij.datashare.tasks.BatchDownloadRunner',
        state: 'DONE',
        progress: 1.0,
        result: {
          '@type': 'UriResult',
          uri: 'file:///home/dev/.local/share/datashare/tmp/archive_local_2025-01-31T13_58_33.396Z%5BGMT%5D.zip',
          size: 78398589
        },
        args: {
          batchDownload: {
            '@type': 'org.icij.datashare.batch.BatchDownload',
            uuid: '1fff1f1d-5881-4bb3-9d47-207a99878298',
            projects: [
              {
                name: 'notnot',
                sourcePath: 'file:///vault/notnot',
                label: 'notnot',
                description: null,
                publisherName: null,
                maintainerName: null,
                logoUrl: null,
                sourceUrl: null,
                creationDate: null,
                updateDate: null
              }
            ],
            filename: 'file:///home/dev/.local/share/datashare/tmp/archive_local_2025-01-31T13_58_33.396Z%5BGMT%5D.zip',
            query: {
              query:
                '{"bool":{"must":[{"match_all":{}},{"bool":{"should":[{"query_string":{"query":"*"}}]}},{"match":{"type":"Document"}}]}}'
            },
            uri: '/?q=&from=0&size=25&sort=relevance&indices=notnot&field=all&tab=extracted-text',
            user: { id: 'local', name: null, email: null, provider: 'local' },
            encrypted: false,
            exists: true
          },
          user: {
            '@type': 'org.icij.datashare.session.DatashareUser',
            id: 'local',
            name: null,
            email: null,
            provider: 'local'
          },
          group: { '@type': 'org.icij.datashare.asynctasks.Group', id: 'Java' }
        },
        retriesLeft: 3,
        createdAt: new Date()
      },
      {
        id: 'ac021709-2f55-4a9a-bd12-dddfd0c8e958',
        name: 'org.icij.datashare.tasks.BatchDownloadRunner',
        state: 'RUNNING',
        progress: 0.9696969696969697,
        args: {
          batchDownload: {
            '@type': 'org.icij.datashare.batch.BatchDownload',
            uuid: 'a6e98c34-4464-4399-b281-61d89b9198d6',
            projects: [
              {
                name: 'notnot',
                sourcePath: 'file:///vault/notnot',
                label: 'notnot',
                description: null,
                publisherName: null,
                maintainerName: null,
                logoUrl: null,
                sourceUrl: null,
                creationDate: null,
                updateDate: null
              }
            ],
            filename: 'file:///home/dev/.local/share/datashare/tmp/archive_local_2025-01-31T14_01_02.092Z%5BGMT%5D.zip',
            query: {
              query:
                '{"bool":{"must":[{"match_all":{}},{"bool":{"should":[{"query_string":{"query":"*"}}]}},{"match":{"type":"Document"}}]}}'
            },
            uri: '/?from=0&perPage=25&sort=_score&order=desc&tab=extracted-text&q=&indices=notnot&field=all',
            user: { id: 'local', name: null, email: null, provider: 'local' },
            encrypted: false,
            exists: true
          },
          user: {
            '@type': 'org.icij.datashare.session.DatashareUser',
            id: 'local',
            name: null,
            email: null,
            provider: 'local'
          },
          group: { '@type': 'org.icij.datashare.asynctasks.Group', id: 'Java' }
        },
        retriesLeft: 3,
        createdAt: '2023-01-31T14:01:02.092+00:00'
      }
    ])

    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    plugins = core.plugins
  })

  it('renders correctly', async () => {
    const wrapper = mount(TaskBatchDownloadList, { global: { plugins } })
    expect(wrapper.exists()).toBe(true)
    expect(api.getTasks).toBeCalledTimes(1)
    expect(api.getTasks).toBeCalledWith('org.icij.datashare.tasks.BatchDownloadRunner')
  })

  it('should display 2 batch download tasks', async () => {
    const wrapper = mount(TaskBatchDownloadList, { global: { plugins } })
    await flushPromises()
    expect(wrapper.findAll('.task-list__row')).toHaveLength(2)
  })

  it('should display the correct values in the correct columns for row 1', async () => {
    const wrapper = mount(TaskBatchDownloadList, { global: { plugins } })
    await flushPromises()
    const firstRow = wrapper.find('.task-list__row')
    const columns = firstRow.findAll('.task-list__row__column')
    expect(columns.at(0).text()).toBe('DONE')
    expect(columns.at(1).text()).toBe('archive_local_2025-01-31T13_58_33.396Z[GMT].zip')
    expect(columns.at(2).text()).toBe('74.77 MB')
    expect(columns.at(3).text()).toContain('notnot')
    expect(columns.at(4).text()).toBe('a few seconds ago')
  })

  it('should display batch download actions', async () => {
    const wrapper = mount(TaskBatchDownloadList, { global: { plugins } })
    await flushPromises()
    const firstRow = wrapper.find('.task-list__row')
    expect(firstRow.findComponent(BatchDownloadActions).exists()).toBe(true)
  })
})
