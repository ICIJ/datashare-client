import Murmur from '@icij/murmur-next'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import UserHistorySaveSearchForm from '@/components/UserHistorySaveSearchForm'

describe('UserHistorySaveSearchForm.vue', () => {
  let wrapper
  let i18n, localVue, router, store, wait
  const propsData = {
    index: 'project',
    uri: 'uri'
  }

  beforeAll(() => {
    Murmur.config.merge({ mode: 'SERVER' })
    const core = Core.init(createLocalVue()).useAll()
    i18n = core.i18n
    localVue = core.localVue
    router = core.router
    store = core.store
    wait = core.wait
  })

  it('should call "saveSearch" method on click on submit button', async () => {
    wrapper = shallowMount(UserHistorySaveSearchForm, { i18n, localVue, propsData, router, store, wait })
    const saveSearchMock = vi.spyOn(wrapper.vm, 'saveSearch')
    wrapper.setData({ name: 'Test' })
    wrapper.find('.card-footer .d-flex b-btn-stub').trigger('submit')
    expect(saveSearchMock).toBeCalledTimes(1)
  })
})
