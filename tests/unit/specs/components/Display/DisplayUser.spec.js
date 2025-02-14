import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DisplayUser from '@/components/Display/DisplayUser'

import { usePipelinesStore } from '@/store/modules/pipelines'

describe('DisplayUser.vue', () => {
  const flushPromises = () => new Promise((resolve) => setImmediate(resolve))
  let wrapper, api, core

  beforeAll(() => {
    api = { getUser: vi.fn().mockResolvedValue({ uid: 'local' }) }
    core = CoreSetup.init(api).useAll().useRouter()
    window.datashare = core
  })

  beforeEach(async () => {
    const props = { value: 'foo' }
    const global = { plugins: core.plugins }
    wrapper = mount(DisplayUser, { props, global })
    await flushPromises()
  })

  afterEach(() => {
    core.unregisterPipeline('username-to-uppercase')
    core.unregisterPipeline('avatar-from-username')
    core.unregisterPipeline('username-icij-link')
  })

  it('should display "foo"', async () => {
    expect(wrapper.find('.display-user__username').text()).toBe('foo')
  })

  it('should display "bar"', async () => {
    wrapper.setProps({ value: 'bar' })
    await flushPromises()
    expect(wrapper.find('.display-user__username').text()).toBe('bar')
  })

  it('should display "local (you)"', async () => {
    await wrapper.setProps({ value: 'local' })
    await flushPromises()
    expect(wrapper.find('.display-user__username').text().toLowerCase()).toBe('local (you)')
  })

  it('should display "foo" in uppercase with a pipeline', async () => {
    core.registerPipeline({
      name: 'username-to-uppercase',
      category: wrapper.vm.usernamePipeline,
      type: (username) => username.toUpperCase()
    })
    await flushPromises()
    expect(wrapper.find('.display-user__username').text()).toBe('FOO')
  })

  it('should display an avatar', () => {
    expect(wrapper.find('.display-user__avatar').exists()).toBeTruthy()
  })

  it('should display an avatar with an URL based on the username', async () => {
    core.registerPipeline({
      name: 'avatar-from-username',
      category: wrapper.vm.avatarPipeline,
      type: (username) => `http://datashare.icij.org/${username}.png`
    })
    await flushPromises()
    const src = 'http://datashare.icij.org/foo.png'
    expect(wrapper.find('.display-user__avatar').attributes('src')).toBe(src)
  })

  it('should not display an avatar', async () => {
    wrapper.setProps({ hideAvatar: true })
    await flushPromises()
    expect(wrapper.find('.display-user__avatar').exists()).toBeFalsy()
  })

  it('should not display a link to the user profile', async () => {
    await flushPromises()
    expect(wrapper.find('.display-user__username').element.tagName).toBe('SPAN')
  })

  it('should display a link to the user profile based on the username', async () => {
    core.registerPipeline({
      name: 'username-icij-link',
      category: wrapper.vm.linkPipeline,
      type: (_, username) => `http://datashare.icij.org/${username}.html`
    })
    await flushPromises()
    const src = 'http://datashare.icij.org/foo.html'
    expect(wrapper.find('.display-user__username').attributes('href')).toBe(src)
    expect(wrapper.find('.display-user__username').element.tagName).toBe('A')
  })

  it('should not display a link if the `hideLink` property is set', async () => {
    wrapper.setProps({ hideLink: true })
    core.registerPipeline({
      name: 'username-icij-link',
      category: wrapper.vm.linkPipeline,
      type: (_, username) => `http://datashare.icij.org/${username}.html`
    })
    await flushPromises()
    expect(wrapper.find('.display-user__username').element.tagName).toBe('SPAN')
  })
})
