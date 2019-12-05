import { getCookie } from 'tiny-cookie'
import get from 'lodash/get'
import fetchPonyfill from 'fetch-ponyfill'
import DatashareClient from './DatashareClient'

export default class Auth {
  constructor () {
    if (window.fetch) {
      // Build-in fetch method must never be called by an object other than Window
      this.fetch = (...args) => window.fetch(...args)
    } else {
      this.fetch = fetchPonyfill().fetch
    }
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
    if (process.env.NODE_ENV === 'development') return 'development'
    let userInCookie = this._getCookieUsername()
    if (userInCookie !== null) return userInCookie
    return this._getBasicAuthUserName()
  }

  _getBasicAuthUserName () {
    return this.fetch(DatashareClient.getFullUrl('/api/user')).then((r) => {
      if (r.status === 200) {
        setTimeout(() => this.reset(), 43200 * 1000)
        return r.json()
      }
      if (r.status === 401) return { 'uid': null }
      throw new Error(`${r.status} ${r.statusText}`)
    }).then(data => data.uid)
  }

  _getCookieUsername () {
    const cookie = getCookie(process.env.VUE_APP_DS_COOKIE_NAME, JSON.parse)
    return get(cookie, 'login', null)
  }
}
