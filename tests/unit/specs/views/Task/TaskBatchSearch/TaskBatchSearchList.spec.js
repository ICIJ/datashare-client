import { setCookie } from 'tiny-cookie'
import { flushPromises, mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import { useTaskTimerSetup } from '~tests/unit/useTaskTimerSetup'
import TaskBatchSearchList from '@/views/Task/TaskBatchSearch/TaskBatchSearchList'
import BatchSearchActions from '@/components/BatchSearch/BatchSearchActions/BatchSearchActions'

const stubs = {
  BatchSearchActions: true,
  DismissableAlert: true,
  DisplayDatetimeFromNow: true,
  DisplayNumber: true,
  DisplayProgress: true,
  DisplayProjectList: true,
  DisplayUser: true,
  DisplayVisibility: true,
  EmptyState: true,
  PageHeader: true,
  RowPaginationBatchSearches: true,
  RouterLinkBatchSearch: true,
  TaskStatus: true,
}

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      getTasks: vi.fn().mockResolvedValue({
        items: [
          {
            id: 'e0fd5476-fa48-4a1f-ba61-b959ec8ed6fb',
            name: 'org.icij.datashare.tasks.BatchSearchRunner',
            state: 'DONE',
            progress: 1.0,
            createdAt: '2025-03-06T06:47:19.857+00:00',
            retriesLeft: 3,
            completedAt: '2025-03-06T06:47:20.333+00:00',
            args: {
              batchRecord: {
                '@type': 'org.icij.datashare.batch.BatchSearchRecord',
                'uuid': 'e0fd5476-fa48-4a1f-ba61-b959ec8ed6fb',
                'projects': ['local-datashare'],
                'name': 'qsdf',
                'description': '',
                'nbQueries': 3,
                'date': '2025-03-06T06:47:19.820+00:00',
                'state': 'QUEUED',
                'user': { id: 'local', name: null, email: null, provider: 'local' },
                'nbResults': 0,
                'published': false,
                'errorMessage': null,
                'errorQuery': null
              },
              user: {
                '@type': 'org.icij.datashare.session.DatashareUser',
                'id': 'local',
                'name': null,
                'email': null,
                'provider': 'local'
              }
            },
            result: { value: 1 }
          },
          {
            id: 'abcdefgh-fa48-4a1f-ba61-b959ec8ed6fb',
            name: 'org.icij.datashare.tasks.BatchSearchRunner',
            state: 'DONE',
            progress: 1.0,
            createdAt: '2025-03-06T06:47:19.857+00:00',
            retriesLeft: 3,
            completedAt: '2025-03-06T06:47:20.333+00:00',
            args: {
              batchRecord: {
                '@type': 'org.icij.datashare.batch.BatchSearchRecord',
                'uuid': 'abcdefgh-fa48-4a1f-ba61-b959ec8ed6fb',
                'projects': ['local-datashare'],
                'name': 'qsdf',
                'description': '',
                'nbQueries': 3,
                'date': '2025-03-06T06:47:19.820+00:00',
                'state': 'QUEUED',
                'user': { id: 'other', name: null, email: null, provider: 'local' },
                'nbResults': 0,
                'published': false,
                'errorMessage': null,
                'errorQuery': null
              },
              user: {
                '@type': 'org.icij.datashare.session.DatashareUser',
                'id': 'other',
                'name': null,
                'email': null,
                'provider': 'local'
              }
            },
            result: { value: 1 }
          }
        ]
      }),
      getUser: vi.fn().mockResolvedValue({
        uid: 'local',
        projects: [
          {
            name: 'local-datashare'
          }
        ],
        groups_by_applications: { datashare: ['local-datashare'] }
      })
    }
  }
})

describe('TaskBatchSearchList', () => {
  let core, plugins, wrapper

  useTaskTimerSetup()

  beforeAll(() => {
    core = CoreSetup.init().useAll().useRouterWithoutGuards()
  })

  beforeEach(async () => {
    core.createPinia()
    plugins = core.plugins
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should display 2 batch searches', async () => {
    wrapper = mount(TaskBatchSearchList, { global: { plugins, stubs } })
    await flushPromises()
    const rows = wrapper.findAll('.page-table-generic__row')
    expect(rows).toHaveLength(2)
  })

  it('should not display actions if I m not the owner of the batch search', async () => {
    setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'local' }, JSON.stringify)
    wrapper = mount(TaskBatchSearchList, { global: { plugins, stubs } })
    await flushPromises()
    const rows = wrapper.findAll('.page-table-generic__row')
    expect(rows.at(0).findComponent(BatchSearchActions).exists()).toBe(true)
    expect(rows.at(1).findComponent(BatchSearchActions).exists()).toBe(false)
  })
})
