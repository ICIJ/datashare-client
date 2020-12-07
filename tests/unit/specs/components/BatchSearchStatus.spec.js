import { createLocalVue, shallowMount } from '@vue/test-utils'

import BatchSearchStatus from '@/components/BatchSearchStatus'
import { Core } from '@/core'

describe('BatchSearchStatus.vue', () => {
  const { i18n, localVue } = Core.init(createLocalVue()).useAll()
  let wrapper = null

  beforeEach(() => {
    const batchSearch = { uuid: '1', state: 'SUCCESS' }
    wrapper = shallowMount(BatchSearchStatus, { i18n, localVue, propsData: { batchSearch } })
  })

  describe('getStateIcon', () => {
    it('should return an icon for each batchSearch state', async () => {
      await wrapper.setProps({ batchSearch: { uuid: '1', state: 'FAILURE' } })
      expect(wrapper.vm.getStateIcon).toBe('times-circle')

      await wrapper.setProps({ batchSearch: { uuid: '1', state: 'QUEUED' } })
      expect(wrapper.vm.getStateIcon).toBe('clock')

      await wrapper.setProps({ batchSearch: { uuid: '1', state: 'RUNNING' } })
      expect(wrapper.vm.getStateIcon).toBe('circle-notch')

      await wrapper.setProps({ batchSearch: { uuid: '1', state: 'SUCCESS' } })
      expect(wrapper.vm.getStateIcon).toBe('glass-cheers')
    })

    it('should return a default icon if the batchSearch state is unknown', async () => {
      await wrapper.setProps({ batchSearch: { uuid: '1', state: 'UNKNOWN' } })
      expect(wrapper.vm.getStateIcon).toBe('ban')
    })
  })

  describe('isFailed', () => {
    it('should failed if status is "FAILURE"', async () => {
      await wrapper.setProps({ batchSearch: { uuid: '1', state: 'FAILURE' } })
      expect(wrapper.vm.isFailed).toBeTruthy()
    })

    it('should NOT failed if status is NOT "FAILURE"', async () => {
      await wrapper.setProps({ batchSearch: { uuid: '1', state: 'OTHER' } })
      expect(wrapper.vm.isFailed).toBeFalsy()
    })
  })
})
