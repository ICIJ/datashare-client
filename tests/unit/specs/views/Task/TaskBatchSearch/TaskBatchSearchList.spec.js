import { setCookie } from 'tiny-cookie'
import { flushPromises, mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import TaskBatchSearchList from '@/views/Task/TaskBatchSearch/TaskBatchSearchList'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      getTasks: vi.fn().mockResolvedValue([
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
              uuid: 'e0fd5476-fa48-4a1f-ba61-b959ec8ed6fb',
              projects: ['local-datashare'],
              name: 'qsdf',
              description: '',
              nbQueries: 3,
              date: '2025-03-06T06:47:19.820+00:00',
              state: 'QUEUED',
              user: { id: 'local', name: null, email: null, provider: 'local' },
              nbResults: 0,
              published: false,
              errorMessage: null,
              errorQuery: null
            },
            user: {
              '@type': 'org.icij.datashare.session.DatashareUser',
              id: 'local',
              name: null,
              email: null,
              provider: 'local'
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
              uuid: 'abcdefgh-fa48-4a1f-ba61-b959ec8ed6fb',
              projects: ['local-datashare'],
              name: 'qsdf',
              description: '',
              nbQueries: 3,
              date: '2025-03-06T06:47:19.820+00:00',
              state: 'QUEUED',
              user: { id: 'other', name: null, email: null, provider: 'local' },
              nbResults: 0,
              published: false,
              errorMessage: null,
              errorQuery: null
            },
            user: {
              '@type': 'org.icij.datashare.session.DatashareUser',
              id: 'other',
              name: null,
              email: null,
              provider: 'local'
            }
          },
          result: { value: 1 }
        }
      ]),
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
  let plugins

  beforeEach(async () => {
    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    plugins = core.plugins
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should display 2 batch searches', async () => {
    const wrapper = mount(TaskBatchSearchList, { global: { plugins } })
    await flushPromises()
    const rows = wrapper.findAll('.page-table-generic__row')
    expect(rows).toHaveLength(2)
  })

  it('should not display actions if I m not the owner of the batch search', async () => {
    setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'local' }, JSON.stringify)
    const wrapper = mount(TaskBatchSearchList, { global: { plugins } })
    await flushPromises()
    const rows = wrapper.findAll('.page-table-generic__row')
    expect(rows.at(0).find('.batch-search-actions').exists()).toBe(true)
    expect(rows.at(1).find('.batch-search-actions').exists()).toBe(false)
  })
})
