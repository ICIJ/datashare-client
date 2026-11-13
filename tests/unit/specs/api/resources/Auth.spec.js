import { getCookie, removeCookie, setCookie } from 'tiny-cookie'

import { Core } from '@/core'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', {
  apiInstance: {
    getUser: vi.fn(),
    setSettings: vi.fn()
  }
})

describe('auth backend client', () => {
  let auth

  beforeAll(() => {
    const core = Core.init().useAll()
    auth = core.auth
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => auth.reset())

  afterAll(() => {
    vi.resetAllMocks()
  })

  describe('getUsername', () => {
    it('should return user name if user is authenticated with basic auth', async () => {
      api.getUser.mockResolvedValue({ uid: 'john' })
      expect(await auth.getUsername()).toBe('john')
      expect(api.getUser).toBeCalledTimes(1)
    })

    it('should return null if user is not authenticated with basic auth', async () => {
      api.getUser.mockRejectedValue({ response: { status: 401 } })
      expect(await auth.getUsername()).toBeNull()
      expect(api.getUser).toBeCalledTimes(1)
    })

    it('should return null when the server answers with an error other than 401', async () => {
      api.getUser.mockRejectedValue({ response: { status: 503 } })
      expect(await auth.getUsername()).toBeNull()
    })

    it('should return null when the server cannot be reached', async () => {
      api.getUser.mockRejectedValue(new Error('Network Error'))
      expect(await auth.getUsername()).toBeNull()
    })

    it('should ask the server again after a failure', async () => {
      api.getUser.mockRejectedValueOnce(new Error('Network Error'))
      api.getUser.mockResolvedValueOnce({ uid: 'john' })
      await auth.getUsername()
      expect(await auth.getUsername()).toBe('john')
    })

    it('should ask the server again when nobody was signed in', async () => {
      api.getUser.mockRejectedValueOnce({ response: { status: 401 } })
      api.getUser.mockResolvedValueOnce({ uid: 'john' })
      await auth.getUsername()
      expect(await auth.getUsername()).toBe('john')
    })

    it('should send a single request for concurrent calls', async () => {
      api.getUser.mockResolvedValue({ uid: 'john' })
      const usernames = await Promise.all([auth.getUsername(), auth.getUsername()])
      expect(usernames).toEqual(['john', 'john'])
      expect(api.getUser).toBeCalledTimes(1)
    })

    it('should keep a newer username when an older request fails', async () => {
      let rejectOlder
      const olderRequest = new Promise((resolve, reject) => {
        rejectOlder = reject
      })
      api.getUser.mockReturnValueOnce(olderRequest)
      api.getUser.mockResolvedValueOnce({ uid: 'john' })
      const olderCall = auth.whoAmI()
      auth.reset()
      expect(await auth.getUsername()).toBe('john')
      rejectOlder(new Error('Network Error'))
      await expect(olderCall).rejects.toThrow()
      expect(await auth.getUsername()).toBe('john')
      expect(api.getUser).toBeCalledTimes(2)
    })
  })

  describe('whoAmI', () => {
    it('should return the user name if user is authenticated', async () => {
      api.getUser.mockResolvedValue({ uid: 'john' })
      expect(await auth.whoAmI()).toBe('john')
    })

    it('should return null if user is not authenticated', async () => {
      api.getUser.mockRejectedValue({ response: { status: 401 } })
      expect(await auth.whoAmI()).toBeNull()
    })

    it('should throw when the server answers with an error other than 401', async () => {
      const error = { response: { status: 503 } }
      api.getUser.mockRejectedValue(error)
      await expect(auth.whoAmI()).rejects.toBe(error)
    })

    it('should throw when the server cannot be reached', async () => {
      const error = new Error('Network Error')
      api.getUser.mockRejectedValue(error)
      await expect(auth.whoAmI()).rejects.toBe(error)
    })

    it('should ask the server again after a failure', async () => {
      api.getUser.mockRejectedValueOnce(new Error('Network Error'))
      api.getUser.mockResolvedValueOnce({ uid: 'john' })
      await expect(auth.whoAmI()).rejects.toThrow()
      expect(await auth.whoAmI()).toBe('john')
    })
  })

  describe('username expiry', () => {
    const halfDay = 43200 * 1000

    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it('should not let the expiry of a reset username clear a newer one', async () => {
      api.getUser.mockResolvedValueOnce({ uid: 'john' })
      api.getUser.mockResolvedValueOnce({ uid: 'jane' })
      await auth.getUsername()
      auth.reset()
      vi.advanceTimersByTime(halfDay / 2)
      await auth.getUsername()
      vi.advanceTimersByTime(halfDay / 2)
      expect(await auth.getUsername()).toBe('jane')
      expect(api.getUser).toBeCalledTimes(2)
    })

    it('should ask the server again once the username expired', async () => {
      api.getUser.mockResolvedValueOnce({ uid: 'john' })
      api.getUser.mockResolvedValueOnce({ uid: 'jane' })
      await auth.getUsername()
      vi.advanceTimersByTime(halfDay)
      expect(await auth.getUsername()).toBe('jane')
    })
  })

  describe('with a script-readable session cookie', () => {
    const cookieName = '_ds_session_id'
    afterEach(() => removeCookie(cookieName))

    it('should ask the server for the username instead of reading the cookie', async () => {
      setCookie(cookieName, { login: 'doe' }, JSON.stringify)
      api.getUser.mockResolvedValue({ uid: 'john' })
      expect(await auth.getUsername()).toBe('john')
      expect(api.getUser).toBeCalledTimes(1)
    })

    it('should leave the cookie alone on reset', () => {
      setCookie(cookieName, { login: 'doe' }, JSON.stringify)
      auth.reset()
      expect(getCookie(cookieName, JSON.parse)).toEqual({ login: 'doe' })
    })
  })

  describe('reset', () => {
    it('should clear the cached username', async () => {
      api.getUser.mockResolvedValue({ uid: 'john' })
      await auth.getUsername()
      auth.reset()
      expect(auth.me.value).toBeNull()
    })
  })
})
