import { shallowMount } from '@vue/test-utils'

import TaskItemStatus from '@/components/TaskItemStatus'
import CoreSetup from '~tests/unit/CoreSetup'

describe('TaskItemStatus.vue', () => {
  const { plugins } = CoreSetup.init().useAll()
  let wrapper = null

  beforeEach(() => {
    const taskItem = { uuid: '1', state: 'SUCCESS' }
    wrapper = shallowMount(TaskItemStatus, { global: { plugins }, props: { taskItem } })
  })

  describe('isFailed', () => {
    it('should failed if status is "FAILURE"', async () => {
      await wrapper.setProps({ taskItem: { uuid: '1', state: 'FAILURE' } })
      expect(wrapper.vm.isFailed).toBeTruthy()
    })

    it('should failed if status is "ERROR"', async () => {
      await wrapper.setProps({ taskItem: { uuid: '1', state: 'ERROR' } })
      expect(wrapper.vm.isFailed).toBeTruthy()
    })

    it('should NOT failed if status is NOT "FAILURE"', async () => {
      await wrapper.setProps({ taskItem: { uuid: '1', state: 'OTHER' } })
      expect(wrapper.vm.isFailed).toBeFalsy()
    })
  })
})
