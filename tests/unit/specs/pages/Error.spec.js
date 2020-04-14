import { createLocalVue, shallowMount } from '@vue/test-utils'
import { setCookie, removeCookie } from 'tiny-cookie'

import { Core } from '@/core'
import Error from '@/pages/Error'

const { i18n, localVue } = Core.init(createLocalVue()).useAll()

describe('Error.vue', () => {
  let wrapper

  it('should display a custom title', () => {
    const propsData = { title: 'This is wrong!' }
    wrapper = shallowMount(Error, { i18n, localVue, propsData })
    expect(wrapper.find('.error__container__heading').text()).toBe('This is wrong!')
  })

  it('should display a header when user is logged in in server mode', async () => {
    // Mock the user session
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'foo' }, JSON.stringify)
    // Mock the isServer property
    const computed = { isServer: () => true }
    wrapper = shallowMount(Error, { i18n, localVue, computed })
    // Flush promises
    await (new Promise(resolve => setImmediate(resolve)))
    // Render again
    expect(wrapper.find('.error__header').exists()).toBeTruthy()
  })

  it('should not display a header when user is logged out in server mode', async () => {
    // Mock the user session
    removeCookie(process.env.VUE_APP_DS_COOKIE_NAME)
    // Mock the isServer property
    const computed = { isServer: () => true }
    wrapper = shallowMount(Error, { i18n, localVue, computed })
    // Flush promises
    await (new Promise(resolve => setImmediate(resolve)))
    // Render again
    expect(wrapper.find('.error__header').exists()).toBeFalsy()
  })
})
