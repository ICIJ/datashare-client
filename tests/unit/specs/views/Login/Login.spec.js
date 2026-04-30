import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import Login from '@/views/Login/Login'
import LoginCard from '@/components/Login/LoginCard'
import LoginWelcome from '@/components/Login/LoginWelcome'

describe('Login.vue', () => {
  let wrapper, core

  beforeEach(() => {
    core = CoreSetup.init().useAll()
    wrapper = shallowMount(Login, { global: { plugins: core.plugins } })
  })

  it('should show the welcome layout by default', () => {
    expect(wrapper.findComponent(LoginWelcome).exists()).toBe(true)
  })

  it('should not show the card layout by default', () => {
    expect(wrapper.findComponent(LoginCard).exists()).toBe(false)
  })

  describe('when authFilter is FormAuthFilter', () => {
    beforeEach(() => {
      core.config.set('authFilter', 'org.icij.datashare.session.FormAuthFilter')
      wrapper = shallowMount(Login, { global: { plugins: core.plugins } })
    })

    it('should show the card layout', () => {
      expect(wrapper.findComponent(LoginCard).exists()).toBe(true)
    })

    it('should not show the welcome layout', () => {
      expect(wrapper.findComponent(LoginWelcome).exists()).toBe(false)
    })

    it('should use the form-auth modifier class', () => {
      expect(wrapper.find('.login--form-auth').exists()).toBe(true)
    })
  })
})
