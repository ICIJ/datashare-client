import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import TaskEntitiesList from '@/views/Task/TaskEntities/TaskEntitiesList'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', {
  apiInstance: {
    getTasks: vi.fn().mockResolvedValue([])
  }
})

describe('TaskEntitiesList.vue', () => {
  let plugins

  beforeEach(() => {
    api.getTasks.mockImplementation((name) => {
      return [
        {
          name,
          id: '6a32bb59-8a23-491c-a441-8447ff7517dc',
          state: 'RUNNING',
          progress: 0,
          args: {
            defaultProject: 'local-datashare',
            nlpPipeline: 'EMAIL'
          },
          createdAt: new Date()
        }
      ]
    })

    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    plugins = core.plugins
  })

  it('renders correctly', () => {
    const wrapper = mount(TaskEntitiesList, { global: { plugins } })
    expect(wrapper.exists()).toBe(true)
    expect(api.getTasks).toBeCalledTimes(2) // 1 for each task type filter
    expect(api.getTasks).toBeCalledWith('org.icij.datashare.tasks.ExtractNlpTask')
    expect(api.getTasks).toBeCalledWith('org.icij.datashare.tasks.EnqueueFromIndexTask')
  })

  it('should display 1 ExtractNlpTask and 1 EnqueueFromIndexTask task', () => {
    const wrapper = mount(TaskEntitiesList, { global: { plugins } })
    expect(wrapper.findAll('.task-list__row')).toHaveLength(2)
  })

  it('should display the correct values in the correct columns for row 1', async () => {
    const wrapper = mount(TaskEntitiesList, { global: { plugins } })
    const firstRow = wrapper.find('.task-list__row')
    const columns = firstRow.findAll('.task-list__row__column')
    expect(columns.at(0).text()).toBe('RUNNING')
    expect(columns.at(1).text()).toBe('NA')
    expect(columns.at(2).text()).toBe('EMAIL')
    expect(columns.at(3).text()).toBe('local-datashare')
    expect(columns.at(4).text()).toBe('0%')
    expect(columns.at(5).text()).toBe('a few seconds ago')
  })
})
