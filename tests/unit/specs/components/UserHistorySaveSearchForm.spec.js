import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import UserHistorySaveSearchForm from '@/components/UserHistorySaveSearchForm'

describe('UserHistorySaveSearchForm.vue', () => {
  it('should call "saveSearch" method on click on submit button', async () => {
    const { plugins, config } = CoreSetup.init().useAll().useRouterWithoutGuards()
    const propsData = {
      index: 'project',
      uri: 'uri'
    }
    config.merge({ mode: 'SERVER' })
    const wrapper = shallowMount(UserHistorySaveSearchForm, {
      propsData,
      global: { plugins },
      renderStubDefaultSlot: true
    })
    const saveSearchMock = vi.spyOn(wrapper.vm, 'saveSearch')
    wrapper.setData({ name: 'Test' })
    wrapper.find('.card-footer .d-flex b-button-stub').trigger('submit')
    expect(saveSearchMock).toBeCalledTimes(1)
  })
})
