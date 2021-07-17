import { createLocalVue, shallowMount } from '@vue/test-utils'

import UserDisplay from '@/components/UserDisplay'
import { Core } from '@/core'

describe('UserDisplay.vue', () => {
  const flushPromises = () => new Promise(resolve => setImmediate(resolve))
  const { i18n, localVue, store } = Core.init(createLocalVue()).useAll()
  let wrapper = null

  beforeEach(async () => {
    const propsData = { username: 'foo' }
    wrapper = shallowMount(UserDisplay, { i18n, localVue, store, propsData })
    await new Promise(resolve => setImmediate(resolve))
  })

  afterEach(() => {
    store.commit('pipelines/unregister', 'username-to-uppercase')
    store.commit('pipelines/unregister', 'avatar-from-username')
  })

  it('should display "foo"', () => {
    expect(wrapper.find('.user-display__username').text()).toBe('foo')
  })

  it('should display "bar"', async () => {
    wrapper.setProps({ username: 'bar' })
    await flushPromises()
    expect(wrapper.find('.user-display__username').text()).toBe('bar')
  })

  it('should display "foo" in uppercase with a pipeline', async () => {
    store.commit('pipelines/register', {
      name: 'username-to-uppercase',
      category: wrapper.vm.usernamePipeline,
      type: username => username.toUpperCase()
    })
    await flushPromises()
    expect(wrapper.find('.user-display__username').text()).toBe('FOO')
  })

  it('should display an avatar', () => {
    expect(wrapper.find('.user-display__avatar').exists()).toBeTruthy()
  })

  it('should display an avatar with an URL based on the username', async () => {
    store.commit('pipelines/register', {
      name: 'avatar-from-username',
      category: wrapper.vm.avatarPipeline,
      type: (_, username) => `http://datashare.icij.org/${username}.png`
    })
    await flushPromises()
    const src = 'http://datashare.icij.org/foo.png'
    expect(wrapper.find('.user-display__avatar').attributes('src')).toBe(src)
  })

  it('should not display an avatar', async () => {
    wrapper.setProps({ hideAvatar: true })
    await flushPromises()
    expect(wrapper.find('.user-display__avatar').exists()).toBeFalsy()
  })
})
