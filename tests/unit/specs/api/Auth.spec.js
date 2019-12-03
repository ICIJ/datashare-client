import Auth from '@/api/Auth'
import { jsonResp } from 'tests/unit/tests_utils'
import { removeCookie, setCookie } from 'tiny-cookie'

const auth = new Auth()

describe('auth backend client', () => {
  beforeEach(() => {
    jest.spyOn(auth, 'fetch')
  })
  afterEach(() => {
    removeCookie(process.env.VUE_APP_DS_COOKIE_NAME)
    auth.reset()
  })

  describe('isAuthenticatedWithBasicAuth', () => {
    it('should return true if user is authenticated with basic auth', async () => {
      auth.fetch.mockReturnValue(jsonResp({}, 200, {}))
      expect(await auth.isAuthenticatedWithBasicAuth()).toBeTruthy()
      expect(auth.fetch).toBeCalledWith('http://localhost:9876/api/config', { method: 'HEAD' })
    })

    it('should return false if user is not authenticated with basic auth', async () => {
      auth.fetch.mockReturnValue(jsonResp({}, 401, {}))
      expect(await auth.isAuthenticatedWithBasicAuth()).toBeFalsy()
      expect(auth.fetch).toBeCalledWith('http://localhost:9876/api/config', { method: 'HEAD' })
    })

    it('should throw err when testing basic auth and response is other than 200 or 401', async () => {
      auth.fetch.mockReturnValue(jsonResp({}, 500, {}))
      try {
        await auth.isAuthenticatedWithBasicAuth()
      } catch (e) {
        expect(e).toEqual(new Error('500 Internal Server Error'))
      }
    })
  })

  describe('getAuthenticatedUser', () => {
    it('should return null if user is not authenticated', () => {
      expect(auth.getAuthenticatedUserCookie()).toBeNull()
    })

    it('should return null if cookie has no "login" field', () => {
      setCookie(process.env.VUE_APP_DS_COOKIE_NAME, 'doe', JSON.stringify)
      expect(auth.getAuthenticatedUserCookie()).toBeNull()
    })

    it('should return user login if user is authenticated', () => {
      setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { 'login': 'doe' }, JSON.stringify)
      expect(auth.getAuthenticatedUserCookie()).toEqual('doe')
    })
  })

  describe('isAuthenticated', () => {
    it('should not be authenticated by default', async () => {
      auth.fetch.mockReturnValue(jsonResp({}, 401, {}))
      expect(await auth.isAuthenticated()).toBeFalsy()
    })

    it('should not be authenticated if the cookie has no login field', async () => {
      setCookie(process.env.VUE_APP_DS_COOKIE_NAME, 'doe', JSON.stringify)
      expect(await auth.isAuthenticated()).toBeFalsy()
    })

    it('should be authenticated if there is a cookie with a login field', async () => {
      setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { 'login': 'doe' }, JSON.stringify)
      expect(await auth.isAuthenticated()).toBeTruthy()
    })
  })
})
