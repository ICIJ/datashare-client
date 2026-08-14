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

    it('renders the target as a real button so keyboard and assistive tech raise native clicks', () => {
      const target = mountEmail().find('.display-email')
      expect(target.element.tagName).toBe('BUTTON')
      expect(target.attributes('aria-expanded')).toBe('false')
    })

    // The click trigger comes from the global BPopover defaults and flips the
    // model asynchronously, hence the waitFor instead of a single tick.
    const expanded = wrapper => wrapper.find('.display-email').attributes('aria-expanded')

    it('opens the popover on click', async () => {
      const wrapper = mountEmail()
      await wrapper.find('.display-email').trigger('click')
      await vi.waitFor(() => expect(expanded(wrapper)).toBe('true'))
    })

    it('closes the popover on a second click', async () => {
      const wrapper = mountEmail()
      await wrapper.find('.display-email').trigger('click')
      await vi.waitFor(() => expect(expanded(wrapper)).toBe('true'))
      await wrapper.find('.display-email').trigger('click')
      await vi.waitFor(() => expect(expanded(wrapper)).toBe('false'))
    })
  })
})
