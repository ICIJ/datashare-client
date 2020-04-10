import get from 'lodash/get'

import Api from '@/api'
import { getCookie } from 'tiny-cookie'

const api = new Api()

export default class Auth {
  constructor () {
    this.cachedUsername = null
  }

  async getUsername () {
    if (!this.cachedUsername) {
      this.cachedUsername = await this._checkAuthentication()
    }
    return this.cachedUsername
  }

  reset () {
    this.cachedUsername = null
  }

  async _checkAuthentication () {
    try {
      if (process.env.NODE_ENV === 'development') {
        return 'local'
      }
      return this._getCookieUsername() || await this._getBasicAuthUserName()
    } catch (_) {
      return null
    }
  }

  async _getBasicAuthUserName () {
    try {
      const response = await api.getUser()
      setTimeout(() => this.reset(), 43200 * 1000)
      return response.uid
    } catch (error) {
      if (error && error.response && error.response.status !== 401) {
        throw new Error(`${error.response.status} ${error.response.statusText}`)
      }
      return null
    }
  }

  _getCookieUsername () {
    const cookie = getCookie(process.env.VUE_APP_DS_COOKIE_NAME, JSON.parse)
    return get(cookie, 'login', null)
  }
}
