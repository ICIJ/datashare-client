import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import LoginCardForm from '@/components/Login/LoginCardForm'

describe('LoginCardForm.vue', () => {
  let wrapper, global

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    global = { plugins: core.plugins }
    wrapper = mount(LoginCardForm, { global })
  })

  it('should render a form with username and password fields', () => {
    expect(wrapper.find('#login-username').exists()).toBe(true)
    expect(wrapper.find('#login-password').exists()).toBe(true)
  })

  it('should render a submit button', () => {
    expect(wrapper.find('.login-card-form__submit').exists()).toBe(true)
  })

  it('should not show an error message by default', () => {
    expect(wrapper.find('.login-card-form__error').exists()).toBe(false)
  })

  it('should show an error message when error prop is true', async () => {
    await wrapper.setProps({ error: true })
    expect(wrapper.find('.login-card-form__error').exists()).toBe(true)
  })

  it('should disable inputs and submit button when disabled prop is true', async () => {
    await wrapper.setProps({ disabled: true })
    expect(wrapper.find('#login-username').attributes('disabled')).toBeDefined()
    expect(wrapper.find('#login-password').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.login-card-form__submit').attributes('disabled')).toBeDefined()
  })

  it('should emit submit event with credentials on form submit', async () => {
    await wrapper.find('#login-username').setValue('admin')
    await wrapper.find('#login-password').setValue('secret')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toHaveLength(1)
    const [payload] = wrapper.emitted('submit')[0]
    expect(payload.username).toBe('admin')
    expect(payload.password).toBe('secret')
  })

  it('should have password field of type password', () => {
    expect(wrapper.find('#login-password').attributes('type')).toBe('password')
  })
})
