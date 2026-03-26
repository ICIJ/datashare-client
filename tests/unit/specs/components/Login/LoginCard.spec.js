import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import LoginCard from '@/components/Login/LoginCard'
import LoginCardForm from '@/components/Login/LoginCardForm'
import LoginImage from '@/components/Login/LoginImage'
import LoginLocaleDropdownSelector from '@/components/Login/LoginLocaleDropdownSelector'

describe('LoginCard.vue', () => {
  let wrapper, global

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    global = { plugins: core.plugins }
    wrapper = mount(LoginCard, { global })
  })

  it('should render the illustration panel with the login image', () => {
    expect(wrapper.find('.login-card__illustration').exists()).toBe(true)
    expect(wrapper.findComponent(LoginImage).exists()).toBe(true)
  })

  it('should render the form panel with the login form', () => {
    expect(wrapper.find('.login-card__panel').exists()).toBe(true)
    expect(wrapper.findComponent(LoginCardForm).exists()).toBe(true)
  })

  it('should display the welcome heading and tagline', () => {
    expect(wrapper.find('.login-card__panel__welcome').text()).toBe('Welcome to Datashare')
    expect(wrapper.find('.login-card__panel__tagline').text()).toBe('ICIJ search and discovery platform')
  })

  it('should render a help link', () => {
    expect(wrapper.find('.login-card__panel__help').exists()).toBe(true)
  })

  it('should render the footer', () => {
    expect(wrapper.findComponent(LoginLocaleDropdownSelector).exists()).toBe(true)
  })

  it('should pass error as false to the form by default', () => {
    expect(wrapper.findComponent(LoginCardForm).props('error')).toBe(false)
  })

  it('should pass disabled as false to the form by default', () => {
    expect(wrapper.findComponent(LoginCardForm).props('disabled')).toBe(false)
  })
})
