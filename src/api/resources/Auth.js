import get from 'lodash/get'

import Api from '@/api'
import { getCookie } from 'tiny-cookie'

const api = new Api()

export default class Auth {
  constructor () {
    this.cachedUsername = null
  }

  async getUsername () {
    if (this.cachedUsername === null) {
      this.cachedUsername = await this._checkAuthentication()
    }
    return this.cachedUsername
  }

  reset () {
    this.cachedUsername = null
  }

  async _checkAuthentication () {
    if (process.env.NODE_ENV === 'development') return 'local'
    const userInCookie = this._getCookieUsername()
    if (userInCookie !== null) return userInCookie
    return this._getBasicAuthUserName()
  }

  async _getBasicAuthUserName () {
    return api.getUser()
      .then(response => {
        setTimeout(() => this.reset(), 43200 * 1000)
        return response.uid
      })
      .catch(error => {
        if (error && error.response && error.response.status === 401) {
          return null
        } else {
          throw new Error(`${error.response.status} ${error.response.statusText}`)
        }
      })
  }

  _getCookieUsername () {
    const cookie = getCookie(process.env.VUE_APP_DS_COOKIE_NAME, JSON.parse)
    return get(cookie, 'login', null)
  }
}
