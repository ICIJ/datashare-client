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
})
