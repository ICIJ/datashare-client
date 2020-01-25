import get from 'lodash/get'
import DatashareClient from '@/api/DatashareClient'
import { getCookie } from 'tiny-cookie'

export default class Auth {
  constructor () {
    // Build-in fetch method must never be called by an object other than Window
    this.fetch = (...args) => fetch(...args)
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
    const r = await this.fetch(DatashareClient.getFullUrl('/api/user'))
    if (r.status === 200) {
      setTimeout(() => this.reset(), 43200 * 1000)
      const data = await r.json()
      return data.uid
    }
    if (r.status === 401) return null
    throw new Error(`${r.status} ${r.statusText}`)
  }

  _getCookieUsername () {
    const cookie = getCookie(process.env.VUE_APP_DS_COOKIE_NAME, JSON.parse)
    return get(cookie, 'login', null)
  }
}
