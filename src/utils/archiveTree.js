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

function getPstFolderPath(document) {
  return document.get(`_source.metadata.${PST_FOLDER_PATH}`, '')
}

function folderSegments(document, isMailbox) {
  const pstFolderPath = getPstFolderPath(document)
  if (pstFolderPath) {
    return splitSegments(pstFolderPath, '/')
  }
  if (isMailbox) {
    return []
  }
  return resourceFolderSegments(document.resourceName)
}

function createFolder(name, path) {
  return { name, path, folders: [], entries: [] }
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

function sortFolder(folder) {
  folder.folders.sort((a, b) => compareText(a.name, b.name))
  folder.entries.sort((a, b) => compareText(a.name, b.name))
  folder.folders.forEach(sortFolder)
}

/**
 * Name of an archive entry inside its folder: the last segment of its
 * resource name when that name holds folders, its title otherwise. Emails
 * from a mailbox or a PST always use their title, since their resource name
 * is a subject that may hold slashes.
 * @param {Document} document
 * @param {boolean} [isMailbox=false] - Whether the archive is a mailbox
 * @returns {string}
 */
export function getEntryName(document, isMailbox = false) {
  if (isMailbox || getPstFolderPath(document)) {
    return document.title
  }
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
 * @param {Object} [options]
 * @param {boolean} [options.isMailbox=false] - Whether the archive is a mailbox, whose emails have no folders
 * @returns {{ name: string, path: string, folders: Array, entries: Array<{ document: Document, name: string }> }} The root folder
 */
export function toArchiveTree(documents, { isMailbox = false } = {}) {
  const root = createFolder('', '')
  const foldersByPath = new Map()
  for (const document of documents) {
    const segments = folderSegments(document, isMailbox)
    const folder = segments.reduce((parent, name) => findOrCreateFolder(foldersByPath, parent, name), root)
    folder.entries.push({ document, name: getEntryName(document, isMailbox) })
  }
  sortFolder(root)
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
  folder.entries.forEach(({ document, name }, index) => {
    if (nameMatches(name, foldedTerm)) {
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

/**
 * The key a folder or a document is rendered with in the archive tree.
 *
 * @param {Object} entry - A match, or any object with the same `type`, `path` and `id`
 * @returns {string}
 */
export function toEntryKey({ type, path, id }) {
  return type === 'folder' ? `folder:${path}` : `document:${id}`
}
