import find from 'lodash/find'
import get from 'lodash/get'
import kebabCase from 'lodash/kebabCase'
import trim from 'lodash/trim'

import IPhFileArchive from '~icons/ph/file-archive'
import IPhFileAudio from '~icons/ph/file-audio'
import IPhFileCsv from '~icons/ph/file-csv'
import IPhFileXls from '~icons/ph/file-xls'
import IPhFileImage from '~icons/ph/file-image'
import IPhFile from '~icons/ph/file'
import IPhFilePdf from '~icons/ph/file-pdf'
import IPhFilePpt from '~icons/ph/file-ppt'
import IPhFileText from '~icons/ph/file-text'
import IPhFileVideo from '~icons/ph/file-video'
import IPhFileDoc from '~icons/ph/file-doc'
import IPhFileZip from '~icons/ph/file-zip'

import types from '@/utils/contentTypes.json'

export const icons = [
  IPhFileArchive,
  IPhFileAudio,
  IPhFileCsv,
  IPhFileXls,
  IPhFileImage,
  IPhFile,
  IPhFilePdf,
  IPhFilePpt,
  IPhFileText,
  IPhFileVideo,
  IPhFileDoc,
  IPhFileZip
]

export function findIcon(type) {
  // Remove leading .
  type = trim(type.toLowerCase(), '.')
  // Find the icon name
  const icon = find(icons, ({ name }) => {
    return kebabCase(name).split('i-ph-file-').join('').toLowerCase() === type
  })
  return icon
}

export function findContentTypeIcon(contentType) {
  const extensions = get(types, [contentType, 'extensions'], [])
  const icon = get(types, [contentType, 'icon'], null)
  return (icon ? findIcon(icon) : find(extensions.map(findIcon))) || IPhFile
}
