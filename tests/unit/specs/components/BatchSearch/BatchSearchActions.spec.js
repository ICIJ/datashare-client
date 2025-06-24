import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import BatchSearchActions from '@/components/BatchSearch/BatchSearchActions/BatchSearchActions'
import BatchSearchActionsEdit from '@/components/BatchSearch/BatchSearchActions/BatchSearchActionsEdit'
import BatchSearchActionsRelaunch from '@/components/BatchSearch/BatchSearchActions/BatchSearchActionsRelaunch'
import BatchSearchActionsDelete from '@/components/BatchSearch/BatchSearchActions/BatchSearchActionsDelete'
import { useTaskStore } from '@/store/modules/task'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      getTasks: vi.fn().mockResolvedValue({
        items: [
          {
            id: '12',
            state: 'SUCCESS'
          },
          {
            id: '46',
            state: 'QUEUED'
          }
        ]
      })
    }
  }
})

describe('BatchSearchActions.vue', () => {
  let plugins

  beforeAll(async () => {
    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    const taskStore = useTaskStore()
    plugins = core.plugins
    await taskStore.fetchTasks()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  describe('with a successful task', () => {
    let wrapper

    beforeEach(() => {
      const props = { batchSearch: { uuid: '12' } }
      wrapper = shallowMount(BatchSearchActions, { props, global: { plugins } })
    })

    it('should display a non-disabled button to relaunch the batchSearch', async () => {
      expect(wrapper.findComponent(BatchSearchActionsRelaunch).exists()).toBe(true)
      expect(wrapper.findComponent(BatchSearchActionsRelaunch).attributes('disabled')).toBe('false')
    })

    it.skip('should display a button to edit the batchSearch', async () => {
      expect(wrapper.findComponent(BatchSearchActionsEdit).exists()).toBe(true)
    })

    it('should display a button to delete the batchSearch', async () => {
      expect(wrapper.findComponent(BatchSearchActionsDelete).exists()).toBe(true)
    })
  })

  describe('with a queued task', () => {
    let wrapper

    beforeEach(() => {
      const props = { batchSearch: { uuid: '46' } }
      wrapper = shallowMount(BatchSearchActions, { props, global: { plugins } })
    })

    it('should display a disabled button to relaunch the batchSearch is queued', async () => {
      expect(wrapper.findComponent(BatchSearchActionsRelaunch).exists()).toBe(true)
      expect(wrapper.findComponent(BatchSearchActionsRelaunch).attributes('disabled')).toBe('true')
    })
  })
})
