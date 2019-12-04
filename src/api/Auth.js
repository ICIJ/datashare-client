import { getCookie } from 'tiny-cookie'
import get from 'lodash/get'
import fetchPonyfill from 'fetch-ponyfill'
import DatashareClient from './DatashareClient'

export class Auth {
  constructor () {
    if (window.fetch) {
      // Build-in fetch method must never be called by an object other than Window
      this.fetch = (...args) => window.fetch(...args)
    } else {
      this.fetch = fetchPonyfill().fetch
    }
    this.cachedIsAuthenticatedValue = null
  }

  async isAuthenticated () {
    if (this.cachedIsAuthenticatedValue === null) {
      this.cachedIsAuthenticatedValue = await this.checkAuthentication()
    }
    return this.cachedIsAuthenticatedValue
  }

  async checkAuthentication () {
    if (process.env.NODE_ENV === 'development') return true
    if (this.getAuthenticatedUserCookie() !== null) return true
    let basicAuthUserName = await this.getBasicAuthUserName()
    return basicAuthUserName !== null
  }

  reset () {
    this.cachedIsAuthenticatedValue = null
  }

  getBasicAuthUserName () {
    return this.fetch(DatashareClient.getFullUrl('/api/user')).then((r) => {
      if (r.status === 200) {
        setTimeout(() => this.reset(), 43200)
        return r.json()
      }
      if (r.status === 401) return { 'uid': null }
      throw new Error(`${r.status} ${r.statusText}`)
    }).then(data => data.uid)
  }

  getAuthenticatedUserCookie () {
    const cookie = getCookie(process.env.VUE_APP_DS_COOKIE_NAME, JSON.parse)
    return get(cookie, 'login', null)
  }
}

export default Auth
