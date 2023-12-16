import get from 'lodash/get'
import { getCookie } from 'tiny-cookie'

export default class Auth {
  constructor(mode, api) {
    this.mode = mode
    this.api = api
    this.cachedUsername = null
  }

  async getUsername() {
    if (!this.cachedUsername) {
      this.cachedUsername = await this._checkAuthentication()
    }
    return this.cachedUsername
  }

  reset() {
    this.cachedUsername = null
  }

  async _checkAuthentication() {
    try {
      if (this.mode.name === 'local') {
        return 'local' // default username
      }
      return this._getCookieUsername() || (await this._getBasicAuthUserName())
    } catch (_) {
      return null
    }
  }

  async _getBasicAuthUserName() {
  try {
    const response = await this.api.getUser();

    if (response.status === 200) {
      const authorizationHeader = response.headers['authorization'];
      if (authorizationHeader && authorizationHeader.startsWith('Basic ')) {
        const encodedCredentials = authorizationHeader.split(' ')[1];
        const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf8');
        const [username, _] = decodedCredentials.split(':');
        return username;
      } else {
        throw new Error('Invalid authorization header');
      }
    } else {
      throw new Error(`${response.status} ${response.statusText}`);
    }
  } catch (error) {
    if (error && error.response && error.response.status !== 401) {
      throw new Error(`${error.response.status} ${error.response.statusText}`);
    }
    return null;
  }
}

  _getCookieUsername() {
    const cookie = getCookie(process.env.VUE_APP_DS_COOKIE_NAME, JSON.parse)
    return get(cookie, 'login', null)
  }
}
