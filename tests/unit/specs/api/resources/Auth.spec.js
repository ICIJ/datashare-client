import { createLocalVue } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import { Api } from '@/api'
import { Core } from '@/core'
import { getMode } from '@/mode'

describe('auth backend client', () => {
  let auth
  let mockAxios

  beforeAll(() => {
    mockAxios = { request: jest.fn() }
    const api = new Api(mockAxios, null)
    const core = Core.init(createLocalVue(), api, getMode()).useAll()
    auth = core.auth
  })
  beforeEach(() => {
    mockAxios.request.mockClear()
    mockAxios.request.mockRejectedValue({ response: { status: 401 } })
  })

  afterEach(() => auth.reset())

  describe('getUsername', () => {
    it('should return user name if user is authenticated with basic auth', async () => {
      mockAxios.request.mockResolvedValue({ data: { uid: 'john' } })
      expect(await auth.getUsername()).toBe('john')
      expect(mockAxios.request).toBeCalledWith({ url: 'http://localhost:9009/api/users/me' })
    })

    it('should return null if user is not authenticated with basic auth', async () => {
      expect(await auth.getUsername()).toBeNull()
      expect(mockAxios.request).toBeCalledWith({ url: 'http://localhost:9009/api/users/me' })
    })

    it('should throw error when testing basic auth and response is other than 200 or 401', async () => {
      mockAxios.request.mockRejectedValue({ response: { status: 500, statusText: 'message' } })
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
