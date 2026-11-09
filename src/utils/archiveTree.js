const PST_FOLDER_PATH = 'tika_metadata_pst_folderpath'
const RESOURCE_NAME = 'tika_metadata_resourcename'
const COLLATOR_OPTIONS = { sensitivity: 'base' }

function splitSegments(path, separator = /[/\\]/) {
  return path.split(separator).filter(segment => segment !== '' && segment !== '.')
}

function resourceFolderSegments(resourceName) {
  const segments = splitSegments(resourceName)
  const endsWithSeparator = /[/\\]$/.test(resourceName)
  return endsWithSeparator ? segments : segments.slice(0, -1)
}

function folderSegments(document) {
  const pstFolderPath = document.get(`_source.metadata.${PST_FOLDER_PATH}`, '')
  if (pstFolderPath) {
    return splitSegments(pstFolderPath, '/')
  }
  const resourceName = document.get(`_source.metadata.${RESOURCE_NAME}`, '')
  return resourceFolderSegments(resourceName)
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
  folder.documents.sort((a, b) => compareText(a.title, b.title))
  folder.folders.forEach(sortFolder)
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
