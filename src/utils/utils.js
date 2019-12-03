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

function getShortkeyOS () {
  return getOS() === 'mac' ? 'mac' : 'default'
}

function getDocumentTypeLabel (key) {
  if (key === undefined) return ''
  return get(types, [key, 'label'], key)
}

function getExtractionLevelTranslationKey (key) {
  const levels = {
    0: 'level00',
    1: 'level01',
    2: 'level02',
    3: 'level03',
    4: 'level04',
    5: 'level05',
    6: 'level06',
    7: 'level07',
    8: 'level08',
    9: 'level09',
    10: 'level10'
  }
  if (key === undefined) return ''
  return `facet.level.${get(levels, key, key)}`
}

export {
  getOS,
  getShortkeyOS,
  getDocumentTypeLabel,
  getExtractionLevelTranslationKey
}
