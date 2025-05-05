import { flushPromises, mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import TaskEntitiesList from '@/views/Task/TaskEntities/TaskEntitiesList'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', {
  apiInstance: {
    getTasks: vi.fn().mockResolvedValue({ items: [] })
  }
})

describe('TaskEntitiesList.vue', () => {
  let plugins

  beforeEach(() => {
    api.getTasks.mockImplementation(({ name: names }) => {
      const items = names.split('|').map((name) => {
        return {
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
      })

      return { items }
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

  it('renders correctly', () => {
    const wrapper = mount(TaskEntitiesList, { global: { plugins } })
    expect(wrapper.exists()).toBe(true)
    expect(api.getTasks).toBeCalled()
    expect(api.getTasks).toBeCalledWith(
      expect.objectContaining({
        name: 'org.icij.datashare.tasks.ExtractNlpTask|org.icij.datashare.tasks.EnqueueFromIndexTask'
      })
    )
  })

  it('should display 1 ExtractNlpTask and 1 EnqueueFromIndexTask task', async () => {
    const wrapper = mount(TaskEntitiesList, { global: { plugins } })
    await flushPromises()
    expect(wrapper.findAll('.page-table-generic__row')).toHaveLength(2)
  })

  it('should display the correct values in the correct columns for row 1', async () => {
    const wrapper = mount(TaskEntitiesList, { global: { plugins } })
    await flushPromises()
    const firstRow = wrapper.find('.page-table-generic__row')
    const columns = firstRow.findAll('.page-table-generic__row__field')
    expect(columns.at(0).text()).toBe('Running')
    expect(columns.at(2).text()).toBe('EMAIL')
    expect(columns.at(3).text()).toContain('Local Datashare')
    expect(columns.at(4).text()).toBe('0%')
    expect(columns.at(5).text()).toBe('a few seconds ago')
  })
})
