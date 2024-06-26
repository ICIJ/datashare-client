import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import Login from '@/pages/Login'

describe('Login.vue', () => {
  let wrapper

  beforeEach(() => {
    const { plugins } = CoreSetup.init().useAll()
    wrapper = shallowMount(Login, { global: { plugins } })
  })

  it('should display a login link', () => {
    expect(wrapper.findAll('.login__card__body .btn').at(0).text()).toBe('Login')
  })

  it('should display a help link', () => {
    expect(wrapper.findAll('.login__card__body .btn').at(1).text()).toBe('Ask for help')
  })
})
