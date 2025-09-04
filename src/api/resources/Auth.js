import get from 'lodash/get'
import { ref } from 'vue'
import { getCookie } from 'tiny-cookie'
import { apiInstance as api } from '@/api/apiInstance'

export default class Auth {
  constructor() {
    this.me = ref(null)
  }

  async getUsername() {
    if (!this.me.value) {
      this.me.value = await this._checkAuthentication()
    }
    return this.me.value
  }

  async signOutBasicAuth() {
    return api.sendAction('/api/users/me', {
      headers: {
        Authorization: `Basic ${window.btoa('logout:logout')}`,
      }
    })
  }

  isBasicAuth() {
    return !!this.me.value && !this._getCookieUsername()
  }

  reset() {
    this.me.value = null
  }

  async _checkAuthentication() {
    try {
      return this._getCookieUsername() || (await this._getBasicAuthUserName())
    }
    catch {
      return null
    }
  }

  async _getBasicAuthUserName() {
    try {
      const response = await api.getUser()
      setTimeout(this.reset.bind(this), 43200 * 1000)
      return response.uid
    }
    catch (error) {
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
