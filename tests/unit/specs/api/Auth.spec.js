import Auth from '@/api/Auth'
import { jsonResp } from 'tests/unit/tests_utils'
import { removeCookie, setCookie } from 'tiny-cookie'

const auth = new Auth()

describe('auth backend client', () => {
  beforeEach(() => {
    jest.spyOn(auth, 'fetch')
    auth.fetch.mockReturnValue(jsonResp({}, 401, {}))
  })
  afterEach(() => {
    removeCookie(process.env.VUE_APP_DS_COOKIE_NAME)
    auth.reset()
  })

  describe('getUsername', () => {
    it('should return user name if user is authenticated with basic auth', async () => {
      auth.fetch.mockReturnValue(jsonResp({ 'uid': 'john' }, 200, {}))
      expect(await auth.getUsername()).toBe('john')
      expect(auth.fetch).toBeCalledWith('http://localhost:9876/api/user')
    })

    it('should return null if user is not authenticated with basic auth', async () => {
      expect(await auth.getUsername()).toBeNull()
      expect(auth.fetch).toBeCalledWith('http://localhost:9876/api/user')
    })

    it('should throw err when testing basic auth and response is other than 200 or 401', async () => {
      auth.fetch.mockReturnValue(jsonResp({}, 500, {}))
      try {
        await auth.getUsername()
      } catch (e) {
        expect(e).toEqual(new Error('500 Internal Server Error'))
      }
    })
  })

  describe('getAuthenticatedUser', () => {
    it('should return null if user is not authenticated', async () => {
      expect(await auth.getUsername()).toBeNull()
    })

    it('should return null if cookie has no "login" field', async () => {
      setCookie(process.env.VUE_APP_DS_COOKIE_NAME, 'doe', JSON.stringify)
      expect(await auth.getUsername()).toBeNull()
    })

    it('should return user login if user is authenticated', async () => {
      setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { 'login': 'doe' }, JSON.stringify)
      expect(await auth.getUsername()).toEqual('doe')
    })
  })
})
