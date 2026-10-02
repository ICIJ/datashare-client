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

  describe('isCurrentUser', () => {
    it('treats any uid as the viewer until the username resolves', () => {
      mockCore.auth.getUsername.mockReturnValue(new Promise(() => {}))
      mockCore.auth.isBasicAuth.mockReturnValue(new Promise(() => {}))
      const wrapper = factory()
      expect(wrapper.vm.isCurrentUser('bob@example.com')).toBe(true)
    })

    it('matches only the viewer once the username has resolved', async () => {
      mockCore.auth.getUsername.mockResolvedValue('alice@example.com')
      mockCore.auth.isBasicAuth.mockResolvedValue(false)
      const wrapper = factory()
      await flushPromises()
      expect(wrapper.vm.isCurrentUser('alice@example.com')).toBe(true)
      expect(wrapper.vm.isCurrentUser('bob@example.com')).toBe(false)
    })
  })
})
