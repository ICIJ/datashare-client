import { foldForFilter } from '@/utils/strings'

export const ARCHIVE_PAGE_SIZE = 50

const PST_FOLDER_PATH = 'tika_metadata_pst_folderpath'
const collator = new Intl.Collator(undefined, { sensitivity: 'base' })

function splitSegments(path, separator = /[/\\]/) {
  return path.split(separator).filter(segment => segment !== '' && segment !== '.')
}

function endsWithSeparator(path) {
  return /[/\\]$/.test(path)
}

function resourceFolderSegments(resourceName) {
  const segments = splitSegments(resourceName)
  return endsWithSeparator(resourceName) ? segments : segments.slice(0, -1)
}

function folderSegments(document) {
  const pstFolderPath = document.get(`_source.metadata.${PST_FOLDER_PATH}`, '')
  if (pstFolderPath) {
    return splitSegments(pstFolderPath, '/')
  }
  return resourceFolderSegments(document.resourceName)
}

function createFolder(name, path) {
  return { name, path, folders: [], documents: [] }
}

function findOrCreateFolder(foldersByPath, parent, name) {
  const path = parent.path ? `${parent.path}/${name}` : name
  if (foldersByPath.has(path)) {
    return foldersByPath.get(path)
  }
  const folder = createFolder(name, path)
  foldersByPath.set(path, folder)
  parent.folders.push(folder)
  return folder
}

function compareText(a, b) {
  return collator.compare(a ?? '', b ?? '')
}

function sortFolder(folder, entryNames) {
  folder.folders.sort((a, b) => compareText(a.name, b.name))
  folder.documents.sort((a, b) => compareText(entryNames.get(a), entryNames.get(b)))
  folder.folders.forEach(child => sortFolder(child, entryNames))
}

/**
 * Name of an archive entry inside its folder: the last segment of its
 * resource name when that name holds folders, its title otherwise.
 * @param {Document} document
 * @returns {string}
 */
export function getEntryName(document) {
  const { resourceName } = document
  const segments = splitSegments(resourceName)
  if (segments.length < 2 || endsWithSeparator(resourceName)) {
    return document.title
  }
  return segments.at(-1)
}

/**
 * Group the direct children of an archive into nested folders, based on
 * their PST folder path or on the directory of their resource name.
 * @param {Document[]} documents
 * @returns {{ name: string, path: string, folders: Array, documents: Document[] }} The root folder
 */
export function toArchiveTree(documents) {
  const root = createFolder('', '')
  const foldersByPath = new Map()
  const entryNames = new Map()
  for (const document of documents) {
    const folder = folderSegments(document).reduce((parent, name) => findOrCreateFolder(foldersByPath, parent, name), root)
    folder.documents.push(document)
    entryNames.set(document, getEntryName(document))
  }
  sortFolder(root, entryNames)
  return root
}

function nameMatches(name, foldedTerm) {
  return foldForFilter(name ?? '').includes(foldedTerm)
}

function collectMatches(folder, foldedTerm, ancestors) {
  const matches = []
  for (const child of folder.folders) {
    if (nameMatches(child.name, foldedTerm)) {
      matches.push({ type: 'folder', path: child.path, ancestors })
    }
    matches.push(...collectMatches(child, foldedTerm, [...ancestors, child.path]))
  }
  folder.documents.forEach((document, index) => {
    if (nameMatches(getEntryName(document), foldedTerm)) {
      matches.push({ type: 'document', id: document.id, folderPath: folder.path, index, ancestors })
    }
  })
  return matches
}

/**
 * Find the folders and files of an archive tree whose name holds a term,
 * ignoring case and accents, in the order the tree displays them.
 * @param {Object} tree - The root folder returned by toArchiveTree
 * @param {string} term
 * @returns {Object[]} Matches, each with the folder paths to open to reveal it
 */
export function findArchiveMatches(tree, term) {
  const foldedTerm = foldForFilter(term.trim())
  if (!foldedTerm) {
    return []
  }
  return collectMatches(tree, foldedTerm, [])
}
