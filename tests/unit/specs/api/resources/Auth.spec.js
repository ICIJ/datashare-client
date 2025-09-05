import { removeCookie, setCookie } from 'tiny-cookie'

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

    it('should throw error when testing basic auth and response is other than 200 or 401', async () => {
      api.getUser.mockRejectedValue({ response: { status: 500, statusText: 'message' } })
      expect.assertions(1)
      try {
        await auth._getBasicAuthUserName()
      }
      catch (e) {
        expect(e).toEqual(new Error('500 message'))
      }
    })
  })

  describe('getAuthenticatedUser', () => {
    afterEach(() => removeCookie(process.env.VITE_DS_COOKIE_NAME))

    it('should return null if user is not authenticated', async () => {
      expect(await auth.getUsername()).toBeNull()
    })

    it('should return null if cookie has no "login" field', async () => {
      setCookie(process.env.VITE_DS_COOKIE_NAME, 'doe', JSON.stringify)
      expect(await auth.getUsername()).toBeNull()
    })

    it('should return user login if user is authenticated', async () => {
      setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)
      expect(await auth.getUsername()).toBe('doe')
    })
  })
})
