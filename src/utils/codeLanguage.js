import { LanguageDescription } from '@codemirror/language'
import { languages } from '@codemirror/language-data'

// Fuzzy matching finds a language inside any longer name ("tika-text-based-message"
// holds "tex"), so names are matched exactly and the few that differ are mapped.
const LANGUAGE_NAMES = Object.freeze({
  'c++src': 'C++',
  'csrc': 'C',
  'httpd-php': 'PHP',
  'java-source': 'Java'
})

function contentTypeLanguageName(contentType = '') {
  const [mimeType] = contentType.split(';')
  const subtype = mimeType.trim().split('/').pop().replace(/^x-/, '')
  if (subtype.endsWith('+xml')) {
    return 'xml'
  }
  return LANGUAGE_NAMES[subtype] ?? subtype
}

// File name patterns are case-sensitive ("Dockerfile"), so the exact name is
// tried before its lowercase form ("MAIN.PY").
function matchResourceName(resourceName) {
  return LanguageDescription.matchFilename(languages, resourceName)
    ?? LanguageDescription.matchFilename(languages, resourceName.toLowerCase())
}

function matchStandardExtension(standardExtension) {
  if (!standardExtension) {
    return null
  }
  return LanguageDescription.matchFilename(languages, `file${standardExtension}`)
}

function matchContentType(contentType) {
  return LanguageDescription.matchLanguageName(languages, contentTypeLanguageName(contentType), false)
}

function findLanguageDescription({ resourceName = '', standardExtension, contentType }) {
  return matchResourceName(resourceName) ?? matchStandardExtension(standardExtension) ?? matchContentType(contentType)
}

/**
 * Find the CodeMirror language to highlight a document with: from its file
 * name first, then from the standard extension of its content type, then from
 * the content type itself.
 *
 * @param {Object} document - The document to highlight.
 * @param {string} document.resourceName - The document own file name, even when embedded.
 * @param {string} [document.standardExtension] - The first extension registered for its content type.
 * @param {string} document.contentType - The document content type.
 * @return {Promise<LanguageSupport|null>} The language, or null for plain text.
 */
export async function findLanguage(document) {
  const description = findLanguageDescription(document)
  if (!description) {
    return null
  }
  // A language pack that fails to load only costs the colors: the source is
  // still readable as plain text.
  try {
    return await description.load()
  }
  catch {
    return null
  }
}
