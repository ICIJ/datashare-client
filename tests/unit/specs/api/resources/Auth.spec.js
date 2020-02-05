import axios from 'axios'
import { removeCookie, setCookie } from 'tiny-cookie'

import Auth from '@/api/resources/Auth'

const auth = new Auth()

jest.mock('axios', () => {
  return {
    request: jest.fn()
  }
})

describe('auth backend client', () => {
  beforeEach(() => axios.request.mockRejectedValue({ response: { status: 401 } }))

  afterEach(() => auth.reset())

  describe('getUsername', () => {
    it('should return user name if user is authenticated with basic auth', async () => {
      axios.request.mockResolvedValue({ data: { uid: 'john' } })
      expect(await auth.getUsername()).toBe('john')
      expect(axios.request).toBeCalledWith({ url: 'http://localhost:9090/api/user' })
    })

    it('should return null if user is not authenticated with basic auth', async () => {
      expect(await auth.getUsername()).toBeNull()
      expect(axios.request).toBeCalledWith({ url: 'http://localhost:9090/api/user' })
    })

    it('should throw error when testing basic auth and response is other than 200 or 401', async () => {
      axios.request.mockRejectedValue({ response: { status: 500, statusText: 'message' } })
      try {
        await auth.getUsername()
      } catch (error) {
        expect(error).toEqual(new Error('500 message'))
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
