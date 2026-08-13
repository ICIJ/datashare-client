import escapeRegExp from 'lodash/escapeRegExp'
import some from 'lodash/some'
import trimEnd from 'lodash/trimEnd'
/**
 * Slugify a string value.
 *
 * @param {string} [value=''] - The string to be slugified.
 * @return {string} - The slugified string.
 */
export function slugger(value = '') {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '')
    .replace(/\s/g, '-')
}

/**
 * Check if a value is a valid URL.
 *
 * @param {string} value - The value to check.
 * @param {string[]} [protocols=['https', 'http']] - The protocols to validate against.
 * @return {boolean} - True if the value is a valid URL, false otherwise.
 */
export function isUrl(value, protocols = ['https', 'http']) {
  let url

  try {
    url = new URL(value)
  }
  catch {
    return false
  }

  return some(protocols, protocol => protocol === trimEnd(url.protocol, ':'))
}

/**
 * Add a mark class to a string based on search term offsets.
 *
 * @param {Object} [params={}] - The parameters for marking.
 * @param {string} [params.content=''] - The string content to search in.
 * @param {string} [params.term=''] - The search term.
 * @param {number[]} [params.offsets=[]] - The offsets of the search term in the content.
 * @param {number} [params.delta=0] - Optional offset correction.
 * @return {string} - The content string with marked search terms.
 */
export function addLocalSearchMarksClassByOffsets({ content = '', term = '', offsets = [], delta = 0 } = {}) {
  // Create one chunk for each letter
  const chunks = content.split('')
  // Add mark tag to the corresponding letters
  offsets.forEach((offset) => {
    const start = offset - Number(delta)
    const end = Math.min(start + term.length - 1, chunks.length - 1)
    // Only replace by offset in existing chunk
    if (chunks[start] && chunks[end]) {
      chunks[start] = `<mark class="local-search-term" data-offset="${offset}">${chunks[start]}`
      chunks[end] = `${chunks[end]}</mark>`
    }
  })
  // Then merge letters again
  return chunks.join('')
}

/**
 * Fold a string roughly the way the backend artifact search does: lowercase,
 * NFKD-decompose and strip combining marks. Returns the folded string plus, for
 * each folded char, the index of the source char it came from, so a match found
 * in folded text can be mapped back to the original string even when the fold
 * changes its length (a ligature expands, a combining mark disappears).
 *
 * @param {string} [value=''] - The string to fold.
 * @return {Object} - An object with the `folded` string and its `sourceIndexes` map.
 */
export function foldWithSourceIndexes(value = '') {
  const folded = []
  const sourceIndexes = []
  for (let index = 0; index < value.length; index++) {
    const decomposed = value[index].toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '')
    for (const character of decomposed) {
      folded.push(character)
      sourceIndexes.push(index)
    }
  }
  return { folded: folded.join(''), sourceIndexes }
}

/**
 * Find every folded-term match in a text string, mapped back to source offsets.
 *
 * @param {string} text - The source text to search in.
 * @param {string} foldedTerm - The already-folded term to search for.
 * @return {Object[]} - A list of `{ start, end }` source ranges.
 */
function findFoldedMatches(text, foldedTerm) {
  const { folded, sourceIndexes } = foldWithSourceIndexes(text)
  const matches = []
  // A single source character whose fold repeats the term (e.g. the 'ﬀ'
  // ligature folding to 'ff', matched twice by the term 'f', or the 'Ⅲ'
  // roman numeral folding to 'iii', matched twice by the term 'ii') can
  // produce folded matches that map back to identical or overlapping source
  // ranges. Wrapping an overlapping range would let the wider range's
  // `surroundContents` empty the text node the narrower range still expects
  // to address, throwing once `wrapTextNodeMatches` reaches it; each
  // candidate's start is compared against the last kept range's end, so this
  // also catches a narrower range nested entirely inside a wider one.
  let lastKeptEnd = -1
  let at = folded.indexOf(foldedTerm)
  while (at !== -1) {
    const start = sourceIndexes[at]
    const end = sourceIndexes[at + foldedTerm.length - 1] + 1
    if (start >= lastKeptEnd) {
      matches.push({ start, end })
      lastKeptEnd = end
    }
    at = folded.indexOf(foldedTerm, at + foldedTerm.length)
  }
  return matches
}

/**
 * Wrap each matched range of a text node in a mark tag. Ranges are applied last
 * to first so earlier offsets stay valid while the node is being split.
 *
 * @param {Text} node - The text node to mark.
 * @param {Object[]} matches - The `{ start, end }` ranges to wrap.
 */
function wrapTextNodeMatches(node, matches) {
  for (const { start, end } of [...matches].reverse()) {
    const range = node.ownerDocument.createRange()
    range.setStart(node, start)
    range.setEnd(node, end)
    const mark = node.ownerDocument.createElement('mark')
    mark.className = 'local-search-term'
    range.surroundContents(mark)
  }
}

/**
 * Highlight term occurrences inside an HTML string, matching text nodes only
 * (never attributes, never across element boundaries), with the same case and
 * diacritic folding as the backend artifact search.
 *
 * @param {string} [html=''] - The HTML content to mark.
 * @param {string} [term=''] - The search term.
 * @return {string} - The HTML with `<mark class="local-search-term">` around matches.
 */
export function addLocalSearchMarksClassInHtml(html = '', term = '') {
  const trimmedTerm = term.trim()
  if (!trimmedTerm) {
    return html
  }
  const { folded: foldedTerm } = foldWithSourceIndexes(trimmedTerm)
  if (!foldedTerm) {
    return html
  }
  const parsed = new DOMParser().parseFromString(html, 'text/html')
  const walker = parsed.createTreeWalker(parsed.body, NodeFilter.SHOW_TEXT)
  // Collect first: wrapping mutates the tree and would derail a live walker
  const textNodes = []
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode)
  }
  for (const node of textNodes) {
    wrapTextNodeMatches(node, findFoldedMatches(node.nodeValue, foldedTerm))
  }
  return parsed.body.innerHTML
}

/**
 * Highlight search term occurrences in the given content.
 *
 * @param {string} [content='<div></div>'] - The HTML content to search in.
 * @param {Object} [localSearchTerm={ label: '' }] - The search term object.
 * @param {string} [localSearchTerm.label=''] - The label of the search term.
 * @param {boolean} [localSearchTerm.regex=false] - Indicates if the term is a regular expression.
 * @return {Object} - An object with updated content, local search index and local search occurrences count.
 */
export function addLocalSearchMarksClass(content = '<div></div>', localSearchTerm = { label: '' }) {
  const escapedLocalSearchTerm = localSearchTerm.regex ? localSearchTerm.label : escapeRegExp(localSearchTerm.label)
  // In case the searched term is split on 2 lines in the content
  const escapedLocalSearchTermAsRegex = escapedLocalSearchTerm.replace(' ', '( |  |.|..| .)')
  const regex = new RegExp(`(?![^<]*>)${escapedLocalSearchTermAsRegex}`, 'gims')
  const localSearchOccurrences = (content.match(regex) || []).length
  const localSearchIndex = Number(!!localSearchOccurrences)
  try {
    if (localSearchOccurrences === 0) {
      throw new Error('No local search occurrences')
    }
    const needle = new RegExp(`(${escapedLocalSearchTermAsRegex})`, 'gims')
    const replacedContent = content.replace(needle, (m) => {
      const term = m.replace(/(\r\n|\n|\r)/gm, ' ').replace('  ', ' ')
      return `<mark class="local-search-term">${term}</mark>`
    })

    return {
      content: replacedContent,
      localSearchIndex,
      localSearchOccurrences
    }
    // Silently fails
  }
  catch {
    return { content, localSearchIndex, localSearchOccurrences }
  }
}

/**
 * Retrieves consonants from a given string.
 *
 * @param {string} [value=''] - The input string. Default is an empty string.
 * @returns {string[]} An array containing the consonants extracted from the input string.
 */
export function getConsonants(value = '') {
  const vowels = ['a', 'e', 'i', 'o', 'u', 'y']
  const consonants = []

  for (const v of value) {
    const char = v.toLowerCase()
    // Check if the character is an alphabet and not a vowel
    if (/^[a-z]$/.test(char) && !vowels.includes(char)) {
      // Push the original value to keep the case
      consonants.push(v)
    }
  }

  return consonants
}

/**
 * Turn a given wildcard token into a ReqExp pattern.
 *
 * @param {string} token - The token to turn, where "*" represents any sequence of characters.
 * @returns {String} - Returns a RegExp pattern string
 */
export function wildcardRegExpPattern(token) {
  // Transform the token into a regex pattern
  return token.split('*').map(escapeRegExp).join('.*')
}

/**
 * Turn a given wildcard token into a ReqExp object.
 *
 * @param {string} token - The token to turn, where "*" represents any sequence of characters.
 * @returns {RegExp} - Returns a RegExp instance
 */
export function wildcardRegExp(token) {
  // Create a RegExp object
  return new RegExp(wildcardRegExpPattern(token))
}

/**
 * Matches a string against a rule that can include wildcard characters.
 *
 * @param {string} str - The string to test against the rule.
 * @param {string} token - The token to match, where "*" represents any sequence of characters.
 * @returns {boolean} - Returns true if the string matches the token, otherwise false.
 */
export function wildcardMatch(str, token) {
  // Test the string against the generated regex
  return wildcardRegExp(token).test(str)
}

/**
 * Case-insensitive matches a string against a token that can include wildcard characters.
 *
 * @param {string} str - The string to test against the token.
 * @param {string} token - The token to match, where "*" represents any sequence of characters.
 * @returns {boolean} - Returns true if the string matches the token, otherwise false.
 */
export function iwildcardMatch(str, token) {
  return wildcardMatch(str.toLowerCase(), token.toLocaleLowerCase())
}
