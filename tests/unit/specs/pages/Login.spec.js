import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import Login from '@/pages/Login'

const { i18n, localVue, store } = Core.init(createLocalVue()).useAll()

describe('Login.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(Login, { i18n, localVue, store })
  })

  it('should display a login link', () => {
    expect(wrapper.findAll('.login__card__body .btn').at(0).text()).toBe('Login with Account')
  })

  it('should display a help link', () => {
    expect(wrapper.findAll('.login__card__body .btn').at(1).text()).toBe('Ask for help')
  })
})
