import { mount, flushPromises } from '@vue/test-utils'

import useAuth from '@/composables/useAuth.js'

const mockCore = {
  config: { get: vi.fn() },
  auth: { getUsername: vi.fn() }
}

vi.mock('@/composables/useCore', () => ({
  useCore: () => mockCore
}))

describe('useAuth', () => {
  function factory() {
    return mount({ setup: () => useAuth(), template: '<div></div>' })
  }

  function mockConfig({ auth = 'form', authFilter } = {}) {
    mockCore.config.get.mockImplementation(key => ({ auth, authFilter })[key])
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockCore.config.get.mockReturnValue('form')
  })

  it('starts with isUsernameResolved false so callers stay guarded before the async auth check lands', () => {
    mockCore.auth.getUsername.mockReturnValue(new Promise(() => {}))
    const wrapper = factory()
    expect(wrapper.vm.isUsernameResolved).toBe(false)
    expect(wrapper.vm.username).toBe(null)
  })

  it('sets isUsernameResolved to true only after the username has resolved', async () => {
    mockCore.auth.getUsername.mockResolvedValue('alice@example.com')
    const wrapper = factory()
    expect(wrapper.vm.isUsernameResolved).toBe(false)
    await flushPromises()
    expect(wrapper.vm.isUsernameResolved).toBe(true)
    expect(wrapper.vm.username).toBe('alice@example.com')
  })

  describe('isCurrentUser', () => {
    it('treats any uid as the viewer until the username resolves', () => {
      mockCore.auth.getUsername.mockReturnValue(new Promise(() => {}))
      const wrapper = factory()
      expect(wrapper.vm.isCurrentUser('bob@example.com')).toBe(true)
    })

    it('matches only the viewer once the username has resolved', async () => {
      mockCore.auth.getUsername.mockResolvedValue('alice@example.com')
      const wrapper = factory()
      await flushPromises()
      expect(wrapper.vm.isCurrentUser('alice@example.com')).toBe(true)
      expect(wrapper.vm.isCurrentUser('bob@example.com')).toBe(false)
    })
  })

  describe('isBasicAuth', () => {
    const BASIC = 'org.icij.datashare.session.BasicAuthAdaptorFilter'

    it('is true when a user is signed in through the basic auth filter', async () => {
      mockConfig({ authFilter: BASIC })
      mockCore.auth.getUsername.mockResolvedValue('alice@example.com')
      const wrapper = factory()
      await flushPromises()
      expect(wrapper.vm.isBasicAuth).toBe(true)
    })

    it('is false when no auth filter is set', async () => {
      mockConfig()
      mockCore.auth.getUsername.mockResolvedValue('local')
      const wrapper = factory()
      await flushPromises()
      expect(wrapper.vm.isBasicAuth).toBe(false)
    })

    it('is false when nobody is signed in', async () => {
      mockConfig({ authFilter: BASIC })
      mockCore.auth.getUsername.mockResolvedValue(null)
      const wrapper = factory()
      await flushPromises()
      expect(wrapper.vm.isBasicAuth).toBe(false)
    })
  })
})
