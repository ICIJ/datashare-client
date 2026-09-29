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

function findLanguageDescription({ basename = '', contentType }) {
  const byFilename = LanguageDescription.matchFilename(languages, basename)
  if (byFilename) {
    return byFilename
  }
  return LanguageDescription.matchLanguageName(languages, contentTypeLanguageName(contentType), false)
}

/**
 * Find the CodeMirror language to highlight a document with: from its file
 * name first, then from its content type.
 *
 * @param {Object} document - The document to highlight.
 * @param {string} document.basename - The document file name.
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
