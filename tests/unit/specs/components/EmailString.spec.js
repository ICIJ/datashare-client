import { mount, createLocalVue } from '@vue/test-utils'

import { Core } from '@/core'
import EmailString from '@/components/EmailString'

const { localVue, store } = Core.init(createLocalVue()).useBootstrapVue()

describe('EmailString.vue', () => {
  it('is a Vue instance', () => {
    const wrapper = mount(EmailString, {
      localVue,
      store,
      propsData: {
        email: 'ICIJ <contact@icij.org>'
      },
      mocks: { $t: msg => msg }
    })

    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  it('renders the email address only', () => {
    const wrapper = mount(EmailString, {
      localVue,
      store,
      propsData: {
        email: 'contact@icij.org'
      },
      mocks: { $t: msg => msg }
    })

    expect(wrapper.text()).toBe('contact@icij.org')
  })

  it('renders the name of the sender only', () => {
    const wrapper = mount(EmailString, {
      localVue,
      store,
      propsData: {
        email: 'ICIJ <contact@icij.org>'
      },
      mocks: { $t: msg => msg }
    })

    expect(wrapper.text()).toBe('ICIJ')
  })

  it('renders the firstname and lastname of the sender only', () => {
    const wrapper = mount(EmailString, {
      localVue,
      store,
      propsData: {
        email: 'Pierre Romera <contact@icij.org>'
      },
      mocks: { $t: msg => msg }
    })

    expect(wrapper.text()).toBe('Pierre Romera')
  })
})
