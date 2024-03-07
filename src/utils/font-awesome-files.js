import find from 'lodash/find'
import get from 'lodash/get'
import trim from 'lodash/trim'
import {
  faFileArchive,
  faFileAudio,
  faFileCsv,
  faFileExcel,
  faFileImage,
  faFile,
  faFilePdf,
  faFilePowerpoint,
  faFileText,
  faFileVideo,
  faFileWord,
  faFileZipper
} from '@fortawesome/free-solid-svg-icons'

import types from '@/utils/types.json'

export const icons = {
  faFileArchive,
  faFileAudio,
  faFileCsv,
  faFileExcel,
  faFileImage,
  faFile,
  faFilePdf,
  faFilePowerpoint,
  faFileText,
  faFileVideo,
  faFileWord,
  faFileZipper
}

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
  return (icon ? findIcon(icon) : find(extensions.map(findIcon))) || faFile
}
