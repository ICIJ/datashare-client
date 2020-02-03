import axios from 'axios'
import { removeCookie, setCookie } from 'tiny-cookie'

import Auth from '@/api/resources/Auth'

const auth = new Auth()

jest.mock('axios', () => {
  return {
    get: jest.fn().mockResolvedValue({ data: {}, status: 401 })
  }
})

describe('auth backend client', () => {
  beforeEach(() => {
    axios.get.mockReturnValue({ data: {}, status: 401 })
  })

  afterEach(() => auth.reset())

  describe('getUsername', () => {
    it('should return user name if user is authenticated with basic auth', async () => {
      axios.get.mockReturnValue({ data: { uid: 'john' }, status: 200 })
      expect(await auth.getUsername()).toBe('john')
      expect(axios.get).toBeCalledWith('http://localhost:9090/api/user')
    })

    it('should return null if user is not authenticated with basic auth', async () => {
      expect(await auth.getUsername()).toBeNull()
      expect(axios.get).toBeCalledWith('http://localhost:9090/api/user')
    })

    it('should throw err when testing basic auth and response is other than 200 or 401', async () => {
      axios.get.mockReturnValue({ data: { }, status: 500, statusText: 'OK' })
      try {
        await auth.getUsername()
      } catch (e) {
        expect(e).toEqual(new Error('500 OK'))
      }
    })
  })

  describe('getAuthenticatedUser', () => {
    afterEach(() => removeCookie(process.env.VUE_APP_DS_COOKIE_NAME))

    it('should return null if user is not authenticated', async () => {
      expect(await auth.getUsername()).toBeNull()
    })

    it('should return null if cookie has no "login" field', async () => {
      setCookie(process.env.VUE_APP_DS_COOKIE_NAME, 'doe', JSON.stringify)
      expect(await auth.getUsername()).toBeNull()
    })

    it('should return user login if user is authenticated', async () => {
      setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)
      expect(await auth.getUsername()).toBe('doe')
    })
  })
})
