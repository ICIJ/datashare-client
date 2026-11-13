import { ref } from 'vue'
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

  reset() {
    this.me.value = null
  }

  async _checkAuthentication() {
    try {
      return await this._getBasicAuthUserName()
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
}
