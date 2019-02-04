import { getCookie } from 'tiny-cookie'
import get from 'lodash/get'

function getOS () {
  let OSName
  if (window.navigator.platform.includes('Mac')) OSName = 'mac'
  else if (window.navigator.platform.includes('Win')) OSName = 'windows'
  else if (window.navigator.platform.includes('Linux')) OSName = 'linux'
  else OSName = 'other'
  return OSName
}

function isAuthenticated () {
  // Skip authentication in development
  if (process.env.NODE_ENV === 'development') return true
  // Find the cookie created by the backend
  const cookie = getCookie(process.env.VUE_APP_DS_COOKIE_NAME, JSON.parse)
  return get(cookie, 'login', null) !== null
}

export { getOS, isAuthenticated }
