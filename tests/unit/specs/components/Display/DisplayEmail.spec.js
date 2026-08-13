import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DisplayEmail from '@/components/Display/DisplayEmail'

describe('DisplayEmail.vue', () => {
  const { plugins } = CoreSetup.init().useAll()

  it('is a Vue instance', () => {
    const wrapper = mount(DisplayEmail, {
      global: {
        plugins
      },
      props: {
        value: 'ICIJ <contact@icij.org>'
      }
    })

    expect(wrapper).toBeTruthy()
  })

  it('renders the email address only', () => {
    const wrapper = mount(DisplayEmail, {
      global: {
        plugins
      },
      props: {
        value: 'contact@icij.org'
      }
    })

    expect(wrapper.text()).toBe('contact@icij.org')
  })

  it('renders the name of the sender only', () => {
    const wrapper = mount(DisplayEmail, {
      global: {
        plugins
      },
      props: {
        value: 'ICIJ <contact@icij.org>'
      }
    })

    expect(wrapper.text()).toBe('ICIJ')
  })

  it('renders the firstname and lastname of the sender only', () => {
    const wrapper = mount(DisplayEmail, {
      global: {
        plugins
      },
      props: {
        value: 'Pierre Romera <contact@icij.org>'
      }
    })

    expect(wrapper.text()).toBe('Pierre Romera')
  })

  describe('keyboard access', () => {
    const mountEmail = () => {
      const props = { value: 'ICIJ <contact@icij.org>' }
      return mount(DisplayEmail, { global: { plugins }, props })
    }

    it('exposes the target as a focusable button to assistive technologies', () => {
      const target = mountEmail().find('.display-email')
      expect(target.attributes('role')).toBe('button')
      expect(target.attributes('tabindex')).toBe('0')
      expect(target.attributes('aria-expanded')).toBe('false')
    })

    it('opens the popover on Enter', async () => {
      const wrapper = mountEmail()
      await wrapper.find('.display-email').trigger('keydown.enter')
      expect(wrapper.find('.display-email').attributes('aria-expanded')).toBe('true')
    })

    it('opens the popover on Space', async () => {
      const wrapper = mountEmail()
      await wrapper.find('.display-email').trigger('keydown.space')
      expect(wrapper.find('.display-email').attributes('aria-expanded')).toBe('true')
    })

    it('closes the popover on a second Enter', async () => {
      const wrapper = mountEmail()
      await wrapper.find('.display-email').trigger('keydown.enter')
      await wrapper.find('.display-email').trigger('keydown.enter')
      expect(wrapper.find('.display-email').attributes('aria-expanded')).toBe('false')
    })
  })
})
