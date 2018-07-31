import { getCookie } from 'tiny-cookie'
import get from 'lodash/get'

export const isAuthenticated = function () {
  // Skip authentication in development
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  // Find the cookie created by the backend
  const cookieName = process.env.VUE_APP_DS_COOKIE_NAME
  const cookie = getCookie(cookieName, JSON.parse)

  return get(cookie, 'login', null) !== null
}
