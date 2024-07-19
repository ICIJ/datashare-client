import find from 'lodash/find'
import get from 'lodash/get'
import kebabCase from 'lodash/kebabCase'
import trim from 'lodash/trim'
import {
  PhFileArchive,
  PhFileAudio,
  PhFileCsv,
  PhFileXls,
  PhFileImage,
  PhFile,
  PhFilePdf,
  PhFilePpt,
  PhFileText,
  PhFileVideo,
  PhFileDoc,
  PhFileZip
} from '@phosphor-icons/vue'

import types from '@/utils/types.json'

export const icons = [
  PhFileArchive,
  PhFileAudio,
  PhFileCsv,
  PhFileXls,
  PhFileImage,
  PhFile,
  PhFilePdf,
  PhFilePpt,
  PhFileText,
  PhFileVideo,
  PhFileDoc,
  PhFileZip
]

export function findIcon(type) {
  // Remove leading .
  type = trim(type.toLowerCase(), '.')
  // Find the icon name
  const icon = find(icons, ({ name }) => {
    return kebabCase(name).split('ph-file-').join('').toLowerCase() === type
  })
  return icon
}

export function findContentTypeIcon(contentType) {
  const extensions = get(types, [contentType, 'extensions'], [])
  const icon = get(types, [contentType, 'icon'], null)
  return (icon ? findIcon(icon) : find(extensions.map(findIcon))) || PhFile
}
