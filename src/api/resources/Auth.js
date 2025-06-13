import get from 'lodash/get'
import { ref } from 'vue'
import { getCookie } from 'tiny-cookie'

export default class Auth {
  constructor(mode, api) {
    this.mode = mode
    this.api = api
    this.me = ref(null)
  }

  async getUsername() {
    if (!this.me.value) {
      this.me.value = await this._checkAuthentication()
    }
    return this.me.value
  }

  reset() {
    this.me.value = null
  }

  async _checkAuthentication() {
    try {
      return this._getCookieUsername() || (await this._getBasicAuthUserName())
    } catch (_) {
      return null
    }
  }

  async _getBasicAuthUserName() {
    try {
      const response = await this.api.getUser()
      setTimeout(this.reset.bind(this), 43200 * 1000)
      return response.uid
    } catch (error) {
      if (error && error.response && error.response.status !== 401) {
        throw new Error(`${error.response.status} ${error.response.statusText}`)
      }
      return null
    }
  }

  _getCookieUsername() {
    const cookie = getCookie(import.meta.env.VITE_DS_COOKIE_NAME, JSON.parse)
    return get(cookie, 'login', null)
  }
}
