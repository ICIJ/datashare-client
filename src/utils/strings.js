import { escapeRegExp, some, trimEnd } from 'lodash'

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
