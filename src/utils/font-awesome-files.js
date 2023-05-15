import { basename } from 'path'
import find from 'lodash/find'
import get from 'lodash/get'
import trim from 'lodash/trim'
import { faFile as defaultIcon } from '@fortawesome/free-solid-svg-icons/faFile'

import types from '@/utils/types.json'

export { faFile as defaultIcon } from '@fortawesome/free-solid-svg-icons/faFile'

// Import all file icon
export const iconsContext = require.context('@fortawesome/free-solid-svg-icons', true, /faFile[A-Z]\w+\.js$/)
export const icons = iconsContext.keys().map((key) => {
  return iconsContext(key)[basename(key, '.js')]
})

export function findIcon(type) {
  // Remove leading .
  type = trim(type.toLowerCase(), '.')
  // Find the icon name
  const icon = find(icons, ({ iconName }) => {
    return iconName.split('file-').join('').toLowerCase() === type
  })
  return icon
}

export function findContentTypeIcon(contentType) {
  const extensions = get(types, [contentType, 'extensions'], [])
  const icon = get(types, [contentType, 'icon'], null)
  return (icon ? findIcon(icon) : find(extensions.map(findIcon))) || defaultIcon
}
