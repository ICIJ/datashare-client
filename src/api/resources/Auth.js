import { ref } from 'vue'
import { apiInstance as api } from '@/api/apiInstance'

const USERNAME_TTL_MS = 43200 * 1000

export default class Auth {
  constructor() {
    this.me = ref(null)
    this._pendingUsername = null
    this._ttlTimer = null
  }

  /**
   * Resolves the signed-in username, or null when nobody is signed in.
   * Concurrent calls share a single request.
   * @throws when the server cannot tell who the user is (network error, 5xx...)
   * @returns {Promise<string|null>}
   */
  async getUsername() {
    this._pendingUsername ??= this._fetchUsername()
    const pending = this._pendingUsername
    try {
      const username = await pending
      // Nobody signed in yet: ask again next time, the user may sign in meanwhile.
      if (!username) {
        this._resetUnlessReplaced(pending)
      }
      return username
    }
    catch (error) {
      this._resetUnlessReplaced(pending)
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
    clearTimeout(this._ttlTimer)
    this.me.value = null
    this._pendingUsername = null
  }

  /**
   * Caches a username the app already got from the server, so the next
   * getUsername() call does not ask for it again.
   * @param {string|null} username
   */
  remember(username) {
    this.reset()
    this.me.value = username
    this._pendingUsername = Promise.resolve(username)
    this._expireLater()
  }

  _expireLater() {
    this._ttlTimer = setTimeout(this.reset.bind(this), USERNAME_TTL_MS)
  }

  // A caller of an older request must not drop the newer one that replaced it.
  _resetUnlessReplaced(pending) {
    if (this._pendingUsername === pending) {
      this.reset()
    }
  }

  async _fetchUsername() {
    try {
      const { uid } = await api.getUser()
      this.me.value = uid
      this._expireLater()
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
