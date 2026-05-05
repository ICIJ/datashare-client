import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import LoginWelcome from '@/components/Login/LoginWelcome'
import LoginImage from '@/components/Login/LoginImage'
import LoginLocaleDropdownSelector from '@/components/Login/LoginLocaleDropdownSelector'

describe('LoginWelcome.vue', () => {
  let core, wrapper, global

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    core.createPinia()
    global = { plugins: core.plugins }
    wrapper = mount(LoginWelcome, { global })
  })

  it('should render the login image', () => {
    expect(wrapper.findComponent(LoginImage).exists()).toBe(true)
  })

  it('should display a sign-in link', () => {
    expect(wrapper.find('.login-welcome__enter__link').text()).toBe('Login')
  })

  it('should display a help link', () => {
    expect(wrapper.find('.login-welcome__assistance__help').text()).toBe('Ask for help')
  })

  it('should render the footer', () => {
    expect(wrapper.findComponent(LoginLocaleDropdownSelector).exists()).toBe(true)
  })
})
