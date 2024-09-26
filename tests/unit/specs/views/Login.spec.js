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
    expect(wrapper.find('.login-view__assistance__help').text()).toBe('Ask for help')
  })
  it('should show the locale menu with the current locale', () => {
    expect(wrapper.find('.locales-menu').text()).toBe('English')
    expect(wrapper.find('.locales-menu').exists()).toBe(true)
  })
})
