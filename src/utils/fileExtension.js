import { get } from 'lodash'

import types from '@/utils/types.json'

export function fileExtension(value, documentName) {
  return get(types, [value, 'extensions', 0], extensionFallback(value, documentName))
}
function extensionFallback(value, documentName) {
  if (documentName) {
    return '.' + documentName.split('.').pop()
  }
  return '.' + value.split('/').pop()
}
