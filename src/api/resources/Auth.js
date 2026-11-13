import { ref } from 'vue'
import { apiInstance as api } from '@/api/apiInstance'

const USERNAME_TTL_MS = 43200 * 1000

export default class Auth {
  constructor() {
    this.me = ref(null)
    this._pendingUsername = null
  }

  /**
   * Resolves the signed-in username, or null when nobody is signed in.
   * Concurrent calls share a single request.
   * @throws when the server cannot tell who the user is (network error, 5xx...)
   * @returns {Promise<string|null>}
   */
  async getUsername() {
    this._pendingUsername ??= this._fetchUsername()
    try {
      const username = await this._pendingUsername
      this._forgetUsernameUnlessSignedIn(username)
      return username
    }
    catch (error) {
      this.reset()
      throw error
    }
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
    this._pendingUsername = null
  }

  // Nobody signed in yet: ask again next time, the user may sign in meanwhile.
  _forgetUsernameUnlessSignedIn(username) {
    if (!username) {
      this.reset()
    }
  }

  async _fetchUsername() {
    try {
      const { uid } = await api.getUser()
      this.me.value = uid
      setTimeout(this.reset.bind(this), USERNAME_TTL_MS)
      return uid
    }
    catch (error) {
      if (error?.response?.status === 401) {
        return null
      }
      throw error
    }
  }
}
