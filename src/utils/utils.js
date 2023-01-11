import { get } from 'lodash'
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck'
import { faExclamation } from '@fortawesome/free-solid-svg-icons/faExclamation'
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes'

import settings from '@/utils/settings'
import { slugger } from '@/utils/strings'
import types from '@/utils/types.json'

function getDocumentTypeLabel(key) {
  if (key === undefined) return ''
  return get(types, [key, 'label'], key)
}

function getExtractionLevelTranslationKey(key) {
  if (key === undefined) return ''
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
  return `filter.level.${get(levels, key, key)}`
}

function getOS() {
  let OSName = 'other'
  if (window.navigator.platform.includes('Mac')) OSName = 'mac'
  else if (window.navigator.platform.includes('Win')) OSName = 'windows'
  else if (window.navigator.platform.includes('Linux')) OSName = 'linux'
  return OSName
}

function getShortkeyOS() {
  return getOS() === 'mac' ? 'mac' : 'default'
}

function objectIncludes(object, text) {
  if (typeof object === 'string') {
    return object.toLowerCase().includes(text.toLowerCase())
  }
  return Object.values(object).some((object) => objectIncludes(object, text))
}

function toVariant(string = '', defaultVariant = 'darker', prefix = '') {
  return prefix + settings.variantsMap[slugger(string).toLowerCase()] || defaultVariant
}

function toVariantIcon(string = '', defaultVariant = 'darker') {
  const variant = toVariant(string, defaultVariant)
  const icons = {
    success: faCheck,
    danger: faTimes,
    warning: faExclamation
  }
  return icons[variant]
}

function toVariantColor(string = '', defaultVariant = 'darker') {
  const variant = toVariant(string, defaultVariant)
  const style = getComputedStyle(document.body)
  return style.getPropertyValue(`--${variant}`) || '#eee'
}

export {
  getDocumentTypeLabel,
  getExtractionLevelTranslationKey,
  getOS,
  getShortkeyOS,
  objectIncludes,
  toVariant,
  toVariantIcon,
  toVariantColor
}
