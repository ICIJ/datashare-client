import { createLocalVue, shallowMount } from '@vue/test-utils'
import { setCookie, removeCookie } from 'tiny-cookie'
import Auth from '@/api/resources/Auth'
import { Core } from '@/core'
import { getMode } from '@/mode'
import Error from '@/pages/Error'

describe('Error.vue local mode', () => {
  let wrapper
  let i18n
  let localVue

  beforeEach(() => {
    const core = Core.init(createLocalVue()).useAll()
    i18n = core.i18n
    localVue = core.localVue
  })

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
    await new Promise((resolve) => setImmediate(resolve))
    // Render again
    expect(wrapper.find('.error__header').exists()).toBeTruthy()
  })
})

describe('Error.vue server mode', () => {
  let wrapper
  let i18n
  let localVue
  beforeEach(() => {
    const core = Core.init(createLocalVue(), new Auth(getMode('server'))).useAll()
    i18n = core.i18n
    localVue = core.localVue
  })

  it('should not display a header when user is logged out in server mode', async () => {
    removeCookie(process.env.VUE_APP_DS_COOKIE_NAME)
    // Mock the isServer property
    wrapper = shallowMount(Error, { i18n, localVue })
    // Flush promises
    await new Promise((resolve) => setImmediate(resolve))
    // Render again
    expect(wrapper.find('.error__header').exists()).toBeFalsy()
  })
})
