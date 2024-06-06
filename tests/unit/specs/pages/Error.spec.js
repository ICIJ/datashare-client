import { shallowMount } from '@vue/test-utils'
import { setCookie, removeCookie } from 'tiny-cookie'

import Auth from '@/api/resources/Auth'
import CoreSetup from '~tests/unit/CoreSetup'
import { getMode } from '@/mode'
import Error from '@/pages/Error'

describe('Error.vue local mode', () => {
  let wrapper
  let plugins
  let core

  beforeEach(() => {
    core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  it('should display a custom title', () => {
    const propsData = { title: 'This is wrong!' }
    wrapper = shallowMount(Error, {
      propsData,
      global: { plugins }
    })
    expect(wrapper.find('.error__container__heading').text()).toBe('This is wrong!')
  })

  it('should display a header when user is logged in in server mode', async () => {
    // Mock the user session
    setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'foo' }, JSON.stringify)
    core.config.set('mode', 'SERVER')
    wrapper = shallowMount(Error, {
      global: { plugins }
    })
    // Flush promises
    await new Promise((resolve) => setImmediate(resolve))
    expect(wrapper.find('.error__header').exists()).toBeTruthy()
  })
})

describe('Error.vue server mode', () => {
  it('should not display a header when user is logged out in server mode', async () => {
    const core = CoreSetup.init(new Auth(getMode('server'))).useAll()

    removeCookie(process.env.VITE_DS_COOKIE_NAME)
    // Mock the isServer property
    const wrapper = shallowMount(Error, { global: { plugins: core.plugins } })
    // Flush promises
    await new Promise((resolve) => setImmediate(resolve))
    // Render again
    expect(wrapper.find('.error__header').exists()).toBeFalsy()
  })
})
