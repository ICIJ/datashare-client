import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import UserDisplay from '@/components/UserDisplay'

describe('UserDisplay.vue', () => {
  const flushPromises = () => new Promise((resolve) => setImmediate(resolve))
  let wrapper, api, core

  beforeAll(() => {
    api = { getUser: vi.fn().mockResolvedValue({ uid: 'local' }) }
    core = CoreSetup.init(api).useAll().useRouter()
  })

  beforeEach(async () => {
    const props = { username: 'foo' }
    const global = { plugins: core.plugins }
    wrapper = mount(UserDisplay, { props, global })
    await flushPromises()
  })

  afterEach(() => {
    core.store.commit('pipelines/unregister', 'username-to-uppercase')
    core.store.commit('pipelines/unregister', 'avatar-from-username')
    core.store.commit('pipelines/unregister', 'username-icij-link')
  })

  it('should display "foo"', async () => {
    expect(wrapper.find('.user-display__username').text()).toBe('foo')
  })

  it('should display "bar"', async () => {
    wrapper.setProps({ username: 'bar' })
    await flushPromises()
    expect(wrapper.find('.user-display__username').text()).toBe('bar')
  })

  it('should display "you"', async () => {
    await wrapper.setProps({ username: 'local' })
    await flushPromises()
    expect(wrapper.find('.user-display__username').text().toLowerCase()).toBe('you')
  })

  it('should display "foo" in uppercase with a pipeline', async () => {
    core.store.commit('pipelines/register', {
      name: 'username-to-uppercase',
      category: wrapper.vm.usernamePipeline,
      type: (username) => username.toUpperCase()
    })
    await flushPromises()
    expect(wrapper.find('.user-display__username').text()).toBe('FOO')
  })

  it('should display an avatar', () => {
    expect(wrapper.find('.user-display__avatar').exists()).toBeTruthy()
  })

  it('should display an avatar with an URL based on the username', async () => {
    core.store.commit('pipelines/register', {
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
    core.store.commit('pipelines/register', {
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
    core.store.commit('pipelines/register', {
      name: 'username-icij-link',
      category: wrapper.vm.linkPipeline,
      type: (_, username) => `http://datashare.icij.org/${username}.html`
    })
    await flushPromises()
    expect(wrapper.find('.user-display__username').element.tagName).toBe('SPAN')
  })
})
