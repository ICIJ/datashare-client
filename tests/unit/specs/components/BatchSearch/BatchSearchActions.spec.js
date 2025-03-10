import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import BatchSearchActionEdit from '@/components/BatchSearch/BatchSearchAction/BatchSearchActionEdit'
import BatchSearchActionRelaunch from '@/components/BatchSearch/BatchSearchAction/BatchSearchActionRelaunch'
import BatchSearchActions from '@/components/BatchSearch/BatchSearchActions'
import ButtonRowActionDelete from '@/components/Button/ButtonRowAction/ButtonRowActionDelete'
import { useTaskStore } from '@/store/modules/task'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      getTasks: vi.fn().mockResolvedValue([
        {
          id: '12',
          state: 'SUCCESS'
        },
        {
          id: '46',
          state: 'QUEUED'
        }
      ])
    }
  }
})

describe('BatchSearchActions.vue', () => {
  let plugins

  beforeAll(async () => {
    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    const taskStore = useTaskStore()
    plugins = core.plugins
    await taskStore.getTasks()
  })

  describe('with a successful task', () => {
    let wrapper

    beforeEach(() => {
      const props = { uuid: '12' }
      wrapper = shallowMount(BatchSearchActions, { props, global: { plugins } })
    })

    it('should display a non-disabled button to relaunch the batchSearch', async () => {
      expect(wrapper.findComponent(BatchSearchActionRelaunch).exists()).toBe(true)
      expect(wrapper.findComponent(BatchSearchActionRelaunch).props('disabled')).toBe(false)
    })

    it('should display a button to edit the batchSearch', async () => {
      expect(wrapper.findComponent(BatchSearchActionEdit).exists()).toBe(true)
    })

    it('should display a button to delete the batchSearch', async () => {
      expect(wrapper.findComponent(ButtonRowActionDelete).exists()).toBe(true)
    })
  })

  describe('with a queued task', () => {
    let wrapper

    beforeEach(() => {
      const props = { uuid: '46' }
      wrapper = shallowMount(BatchSearchActions, { props, global: { plugins } })
    })

    it('should display a disabled button to relaunch the batchSearch is queued', async () => {
      expect(wrapper.findComponent(BatchSearchActionRelaunch).exists()).toBe(true)
      expect(wrapper.findComponent(BatchSearchActionRelaunch).props('disabled')).toBe(true)
    })
  })
})
