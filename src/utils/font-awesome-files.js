import { basename } from 'path'
import find from 'lodash/find'
import trim from 'lodash/trim'
export { faFile as defaultIcon } from '@fortawesome/free-solid-svg-icons/faFile'

// Import all file icon
export const iconsContext = require.context('@fortawesome/free-solid-svg-icons', true, /faFile[A-Z]\w+\.js$/)
export const icons = iconsContext.keys().map(key => {
  return iconsContext(key)[basename(key, '.js')]
})

export function findIcon (type) {
  // Remove leading .
  type = trim(type.toLowerCase(), '.')
  // Find the icon name
  const icon = find(icons, ({ iconName }) => {
    return iconName.split('file-').join('').toLowerCase() === type
  })
  return icon
}
