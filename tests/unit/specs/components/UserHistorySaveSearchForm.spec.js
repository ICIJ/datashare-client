import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import Api from '@/api'
import { Core } from '@/core'
import UserHistorySaveSearchForm from '@/components/UserHistorySaveSearchForm'

Api.getFullUrl = jest.fn()

jest.mock('@/api', () => {
  return jest.fn(() => {
    return {
      saveSearch: jest.fn()
    }
  })
})

describe('UserHistorySaveSearchForm.vue', () => {
  let wrapper
  const { i18n, localVue, router, store, wait } = Core.init(createLocalVue()).useAll()
  const propsData = {
    index: 'project',
    uri: 'uri'
  }

  beforeAll(() => Murmur.config.merge({ mode: 'SERVER' }))

  beforeEach(async () => {
    wrapper = shallowMount(UserHistorySaveSearchForm, { i18n, localVue, propsData, router, store, wait })
  })

  afterAll(() => jest.unmock('@/api'))

  it('should call "saveSearch" method on click on submit button', async () => {
    const saveSearchMock = jest.spyOn(wrapper.vm, 'saveSearch')
    wrapper.setData({ name: 'Test' })
    wrapper.find('.card-footer .d-flex b-btn-stub').trigger('submit')
    expect(saveSearchMock).toBeCalledTimes(1)
  })
})
