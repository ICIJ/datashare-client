import { mount, flushPromises } from '@vue/test-utils'

import useAuth from '@/composables/useAuth.js'

const mockCore = {
  config: { get: vi.fn() },
  auth: { getUsername: vi.fn(), isBasicAuth: vi.fn() }
}

vi.mock('@/composables/useCore', () => ({
  useCore: () => mockCore
}))

describe('useAuth', () => {
  function factory() {
    return mount({ setup: () => useAuth(), template: '<div></div>' })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockCore.config.get.mockReturnValue('form')
  })

  it('starts with isUsernameResolved false so callers stay guarded before the async auth check lands', () => {
    mockCore.auth.getUsername.mockReturnValue(new Promise(() => {}))
    mockCore.auth.isBasicAuth.mockReturnValue(new Promise(() => {}))
    const wrapper = factory()
    expect(wrapper.vm.isUsernameResolved).toBe(false)
    expect(wrapper.vm.username).toBe(null)
  })

  it('sets isUsernameResolved to true only after username and isBasicAuth have resolved', async () => {
    mockCore.auth.getUsername.mockResolvedValue('alice@example.com')
    mockCore.auth.isBasicAuth.mockResolvedValue(false)
    const wrapper = factory()
    expect(wrapper.vm.isUsernameResolved).toBe(false)
    await flushPromises()
    expect(wrapper.vm.isUsernameResolved).toBe(true)
    expect(wrapper.vm.username).toBe('alice@example.com')
  })
})
