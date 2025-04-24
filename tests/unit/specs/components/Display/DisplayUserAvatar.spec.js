import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DisplayUserAvatar from '@/components/Display/DisplayUserAvatar'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      getUser: vi.fn().mockResolvedValue({ uid: 'local' })
    }
  }
})

describe('DisplayUserAvatar.vue', () => {
  const flushPromises = () => new Promise((resolve) => setImmediate(resolve))
  let wrapper, core

  beforeAll(() => {
    core = CoreSetup.init().useAll().useRouterWithoutGuards()
    window.datashare = core
  })

  beforeEach(async () => {
    const props = { value: 'foo' }
    const global = { plugins: core.plugins }
    wrapper = mount(DisplayUserAvatar, { props, global })
    await flushPromises()
  })

  afterEach(() => {
    core.unregisterPipeline('avatar-from-username')
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should display an avatar with an URL based on the username', async () => {
    core.registerPipeline({
      name: 'avatar-from-username',
      category: wrapper.vm.avatarPipeline,
      type: (username) => `http://datashare.icij.org/${username}.png`
    })
    await flushPromises()
    const src = 'http://datashare.icij.org/foo.png'
    expect(wrapper.attributes('src')).toBe(src)
  })
})
