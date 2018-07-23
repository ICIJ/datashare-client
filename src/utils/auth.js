import { getCookie } from 'tiny-cookie'
import get from 'lodash/get'

export const isAuthenticated = function () {
  // Skip authentication in development
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  // Find the cookie created by the backend
  const cookieName = process.env.CONFIG['ds_cookie_name']
  const cookie = getCookie(cookieName, JSON.parse)

  return get(cookie, 'login', null) !== null
}
