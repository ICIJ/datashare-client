import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import EmailString from '@/components/EmailString'

const { i18n, localVue, store } = Core.init(createLocalVue()).useAll()

describe('EmailString.vue', () => {
  it('is a Vue instance', () => {
    const wrapper = shallowMount(EmailString, {
      i18n,
      localVue,
      store,
      propsData: {
        email: 'ICIJ <contact@icij.org>'
      }
    })

    expect(wrapper).toBeTruthy()
  })

  it('renders the email address only', () => {
    const wrapper = shallowMount(EmailString, {
      i18n,
      localVue,
      store,
      propsData: {
        email: 'contact@icij.org'
      }
    })

    expect(wrapper.text()).toBe('contact@icij.org')
  })

  it('renders the name of the sender only', () => {
    const wrapper = shallowMount(EmailString, {
      i18n,
      localVue,
      store,
      propsData: {
        email: 'ICIJ <contact@icij.org>'
      }
    })

    expect(wrapper.text()).toBe('ICIJ')
  })

  it('renders the firstname and lastname of the sender only', () => {
    const wrapper = shallowMount(EmailString, {
      i18n,
      localVue,
      store,
      propsData: {
        email: 'Pierre Romera <contact@icij.org>'
      }
    })

    expect(wrapper.text()).toBe('Pierre Romera')
  })
})
