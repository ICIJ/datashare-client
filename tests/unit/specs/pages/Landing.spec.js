import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import Landing from '@/pages/Landing'

describe('Landing.vue', () => {
  const { i18n, localVue, store } = Core.init(createLocalVue()).useAll()
  let wrapper = null

  beforeEach(() => {
    Murmur.config.merge({ mode: 'SERVER' })
    Murmur.config.merge({ groups_by_applications: { datashare: ['project'] } })
    wrapper = shallowMount(Landing, { i18n, localVue, store })
  })

  it('should display a search bar', () => {
    expect(wrapper.find('.landing__form__search-bar').exists()).toBeTruthy()
  })

  it('should display project cards', () => {
    expect(wrapper.find('.landing__form__projects').exists()).toBeTruthy()
  })
})
