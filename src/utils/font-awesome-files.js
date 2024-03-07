import find from 'lodash/find'
import get from 'lodash/get'
import trim from 'lodash/trim'
import faFileArchive from '@fortawesome/free-solid-svg-icons/faFileArchive'
import faFileAudio from '@fortawesome/free-solid-svg-icons/faFileAudio'
import faFileCsv from '@fortawesome/free-solid-svg-icons/faFileCsv'
import faFileExcel from '@fortawesome/free-solid-svg-icons/faFileExcel'
import faFileImage from '@fortawesome/free-solid-svg-icons/faFileImage'
import faFile from '@fortawesome/free-solid-svg-icons/faFile'
import faFilePdf from '@fortawesome/free-solid-svg-icons/faFilePdf'
import faFilePowerpoint from '@fortawesome/free-solid-svg-icons/faFilePowerpoint'
import faFileText from '@fortawesome/free-solid-svg-icons/faFileText'
import faFileVideo from '@fortawesome/free-solid-svg-icons/faFileVideo'
import faFileWord from '@fortawesome/free-solid-svg-icons/faFileWord'
import faFileZipper from '@fortawesome/free-solid-svg-icons/faFileZipper'

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
