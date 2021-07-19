import { createLocalVue, mount } from '@vue/test-utils'

import UserDisplay from '@/components/UserDisplay'
import { Core } from '@/core'

jest.mock('@/api', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getUser: jest.fn().mockImplementation(() => {
        return Promise.resolve({ uid: 'local' })
      })
    }
  })
})

describe('UserDisplay.vue', () => {
  const flushPromises = () => new Promise(resolve => setImmediate(resolve))
  const { i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()
  let wrapper = null

  beforeEach(async () => {
    const propsData = { username: 'foo' }
    wrapper = mount(UserDisplay, { i18n, localVue, store, propsData, wait })
    await flushPromises()
  })

  afterEach(() => {
    store.commit('pipelines/unregister', 'username-to-uppercase')
    store.commit('pipelines/unregister', 'avatar-from-username')
    store.commit('pipelines/unregister', 'username-icij-link')
  })

  afterAll(() => jest.unmock('@/api'))

  it('should display "foo"', async () => {
    expect(wrapper.find('.user-display__username').text()).toBe('foo')
  })

  it('should display "bar"', async () => {
    wrapper.setProps({ username: 'bar' })
    await flushPromises()
    expect(wrapper.find('.user-display__username').text()).toBe('bar')
  })

  it('should display "you"', async () => {
    wrapper.setProps({ username: 'local' })
    await flushPromises()
    expect(wrapper.find('.user-display__username').text().toLowerCase()).toBe('you')
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

  it('should not display a link to the user profile', async () => {
    await flushPromises()
    expect(wrapper.find('.user-display__username').element.tagName).toBe('SPAN')
  })

  it('should display a link to the user profile based on the username', async () => {
    store.commit('pipelines/register', {
      name: 'username-icij-link',
      category: wrapper.vm.linkPipeline,
      type: (_, username) => `http://datashare.icij.org/${username}.html`
    })
    await flushPromises()
    const src = 'http://datashare.icij.org/foo.html'
    expect(wrapper.find('.user-display__username').attributes('href')).toBe(src)
    expect(wrapper.find('.user-display__username').element.tagName).toBe('A')
  })

  it('should not display a link if the `hideLink` property is set', async () => {
    wrapper.setProps({ hideLink: true })
    store.commit('pipelines/register', {
      name: 'username-icij-link',
      category: wrapper.vm.linkPipeline,
      type: (_, username) => `http://datashare.icij.org/${username}.html`
    })
    await flushPromises()
    expect(wrapper.find('.user-display__username').element.tagName).toBe('SPAN')
  })
})
