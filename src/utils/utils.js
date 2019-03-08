import { getCookie } from 'tiny-cookie'
import types from '@/utils/types.json'
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

function getDocumentTypeLabel (key) {
  if (key === undefined) return ''
  return get(types, [key, 'label'], key)
}

function getExtractionLevelTranslationKey (key) {
  const levels = {
    0: 'level_00',
    1: 'level_01',
    2: 'level_02',
    3: 'level_03',
    4: 'level_04',
    5: 'level_05',
    6: 'level_06',
    7: 'level_07',
    8: 'level_08',
    9: 'level_09',
    10: 'level_10'
  }
  if (key === undefined) return ''
  return `facet.level.${get(levels, key, key)}`
}

export { getOS, isAuthenticated, getDocumentTypeLabel, getExtractionLevelTranslationKey }
