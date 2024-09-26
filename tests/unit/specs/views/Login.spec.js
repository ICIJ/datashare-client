import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import Login from '@/views/Login'

describe('Login.vue', () => {
  let wrapper

  beforeEach(() => {
    const { plugins } = CoreSetup.init().useAll()
    wrapper = mount(Login, { global: { plugins } })
  })

  it('should display a login link', async () => {
    expect(wrapper.find('.login-view__enter_link').text()).toBe('Login')
  })

  it('should display a help link', () => {
    expect(wrapper.findAll('.login-view__help .btn').at(1).text()).toBe('Ask for help')
  })
})
