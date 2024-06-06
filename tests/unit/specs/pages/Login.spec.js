import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import Login from '@/pages/Login'

describe('Login.vue', () => {
  let wrapper

  beforeEach(() => {
    const { plugins } = CoreSetup.init().useAll()
    wrapper = shallowMount(Login, { global: { plugins } })
  })

  it('should display a login link', () => {
    expect(wrapper.findAll('.login__card__body .btn').at(0).text()).toBe('Login with Account')
  })

  it('should display a help link', () => {
    expect(wrapper.findAll('.login__card__body .btn').at(1).text()).toBe('Ask for help')
  })
})
