import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import EmailString from '@/components/EmailString'

describe('EmailString.vue', () => {
  const { plugins } = CoreSetup.init().useAll()

  it('is a Vue instance', () => {
    const wrapper = shallowMount(EmailString, {
      global: {
        plugins
      },
      props: {
        email: 'ICIJ <contact@icij.org>'
      }
    })

    expect(wrapper).toBeTruthy()
  })

  it('renders the email address only', () => {
    const wrapper = shallowMount(EmailString, {
      global: {
        plugins
      },
      props: {
        email: 'contact@icij.org'
      }
    })

    expect(wrapper.text()).toBe('contact@icij.org')
  })

  it('renders the name of the sender only', () => {
    const wrapper = shallowMount(EmailString, {
      global: {
        plugins
      },
      props: {
        email: 'ICIJ <contact@icij.org>'
      }
    })

    expect(wrapper.text()).toBe('ICIJ')
  })

  it('renders the firstname and lastname of the sender only', () => {
    const wrapper = shallowMount(EmailString, {
      global: {
        plugins
      },
      props: {
        email: 'Pierre Romera <contact@icij.org>'
      }
    })

    expect(wrapper.text()).toBe('Pierre Romera')
  })
})
