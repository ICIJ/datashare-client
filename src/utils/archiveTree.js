const PST_FOLDER_PATH = 'tika_metadata_pst_folderpath'
const COLLATOR_OPTIONS = { sensitivity: 'base' }

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

function findOrCreateFolder(parent, name) {
  const existing = parent.folders.find(folder => folder.name === name)
  if (existing) {
    return existing
  }
  const path = parent.path ? `${parent.path}/${name}` : name
  const folder = createFolder(name, path)
  parent.folders.push(folder)
  return folder
}

function compareText(a, b) {
  return (a ?? '').localeCompare(b ?? '', undefined, COLLATOR_OPTIONS)
}

function sortFolder(folder) {
  folder.folders.sort((a, b) => compareText(a.name, b.name))
  folder.documents.sort((a, b) => compareText(getEntryName(a), getEntryName(b)))
  folder.folders.forEach(sortFolder)
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
  for (const document of documents) {
    const folder = folderSegments(document).reduce(findOrCreateFolder, root)
    folder.documents.push(document)
  }
  sortFolder(root)
  return root
}
