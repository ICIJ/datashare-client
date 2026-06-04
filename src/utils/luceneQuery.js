/**
 * Reserved characters that have special meaning in Lucene query syntax.
 * They must be backslash-escaped when they appear inside a user-supplied
 * term to avoid producing a malformed query.
 *
 * `&&` and `||` are bigrams handled separately below.
 *
 * Reference: https://lucene.apache.org/core/9_0_0/queryparser/org/apache/lucene/queryparser/classic/package-summary.html#Escaping_Special_Characters
 */
const LUCENE_RESERVED = /[+\-!(){}[\]^"~*?:\\/]/g

/**
 * Escape Lucene-reserved characters in a term so it is treated as plain
 * text by the query parser. Used for word-list inputs (any/all/none).
 */
function escapeTerm(term) {
  return String(term)
    .replace(LUCENE_RESERVED, '\\$&')
    .replace(/&&/g, '\\&\\&')
    .replace(/\|\|/g, '\\|\\|')
}

/**
 * Escape only the characters that would break out of a quoted phrase
 * (`"` and `\`). Everything else inside double quotes is taken literally
 * by Lucene, so leaving operators alone keeps the phrase readable.
 */
function escapePhrase(phrase) {
  return String(phrase).replace(/[\\"]/g, '\\$&')
}

/**
 * Generate a Lucene query string from the advanced search form data.
 * @param {Object} formData - The form data object
 * @returns {string} - The generated Lucene query
 */
export function generateLuceneQuery(formData) {
  const parts = []

  // ANY of these words (OR) - space-separated creates implicit OR
  if (formData.anyWords && formData.anyWords.length > 0) {
    const orTerms = formData.anyWords.map(escapeTerm).join(' ')
    if (formData.anyWords.length > 1) {
      parts.push(`(${orTerms})`)
    }
    else {
      parts.push(orTerms)
    }
  }

  // ALL these words (AND) - use + prefix
  if (formData.allWords && formData.allWords.length > 0) {
    const andTerms = formData.allWords.map(word => `+${escapeTerm(word)}`).join(' ')
    parts.push(andTerms)
  }

  // Exact phrase - wrap in quotes
  if (formData.exactPhrase && formData.exactPhrase.length > 0) {
    formData.exactPhrase.forEach((phrase) => {
      parts.push(`"${escapePhrase(phrase)}"`)
    })
  }

  // NONE of these words (NOT) - use - prefix
  if (formData.noneWords && formData.noneWords.length > 0) {
    const notTerms = formData.noneWords.map(word => `-${escapeTerm(word)}`).join(' ')
    parts.push(notTerms)
  }

  // Single character wildcard (?). Either side alone is also a valid
  // Lucene query (`Mer?` / `?es`), so only require at least one half.
  if (formData.singleWildcardStart || formData.singleWildcardEnd) {
    const start = escapeTerm(formData.singleWildcardStart || '')
    const end = escapeTerm(formData.singleWildcardEnd || '')
    parts.push(`${start}?${end}`)
  }

  // Multiple character wildcard (*) — same single-sided rule as `?`.
  if (formData.multiWildcardStart || formData.multiWildcardEnd) {
    const start = escapeTerm(formData.multiWildcardStart || '')
    const end = escapeTerm(formData.multiWildcardEnd || '')
    parts.push(`${start}*${end}`)
  }

  // Fuzzy search (spelling changes). Distance 0 means the feature is
  // disabled — a plain term lives in `anyWords` already, no point
  // duplicating it here.
  if (formData.fuzzyTerm && formData.fuzzyDistance > 0) {
    const fuzzyTerm = `${escapeTerm(formData.fuzzyTerm)}~${formData.fuzzyDistance}`
    parts.push(fuzzyTerm)
  }

  // Proximity search (phrase changes). Same rule as fuzzy: distance 0
  // is just an exact phrase, which is its own input above.
  if (formData.proximityPhrase && formData.proximityDistance > 0) {
    const proximityTerm = `"${escapePhrase(formData.proximityPhrase)}"~${formData.proximityDistance}`
    parts.push(proximityTerm)
  }

  let query = parts.join(' ')

  if (query && !formData.fieldAll && formData.selectedFields?.length > 0) {
    query = formData.selectedFields.map(field => `${field}:(${query})`).join(' OR ')
  }

  return query.trim()
}

/**
 * Default form shape returned by `parseLuceneQuery` when the input is empty
 * or unparseable. Word inputs are blank strings, distances default to 1
 * (mirroring `getInitialForm` in useAdvancedSearchForm).
 */
function emptyForm() {
  return {
    anyWords: '',
    allWords: '',
    exactPhrase: '',
    noneWords: '',
    singleWildcardStart: '',
    singleWildcardEnd: '',
    multiWildcardStart: '',
    multiWildcardEnd: '',
    fuzzyTerm: '',
    fuzzyDistance: 1,
    proximityPhrase: '',
    proximityDistance: 1,
    fieldAll: true,
    selectedFields: []
  }
}

/**
 * Reverse of `escapeTerm` — turn `\X` back into `X`. Lossy on purpose:
 * we don't try to distinguish reserved chars from accidental backslashes.
 */
function unescapeTerm(term) {
  return String(term).replace(/\\(.)/g, '$1')
}

const unescapePhrase = unescapeTerm

class QueryTokenizer {
  constructor(query) {
    this.query = query
    this.tokens = []
    this.current = ''
    this.inQuotes = false
    this.parenDepth = 0
    this.escape = false
  }

  tokenize() {
    for (const ch of this.query) {
      this.handleChar(ch)
    }
    this.flush()
    return this.tokens
  }

  flush() {
    if (this.current) {
      this.tokens.push(this.current)
      this.current = ''
    }
  }

  handleChar(ch) {
    if (this.escape) {
      this.handleEscaped(ch)
    }
    else if (ch === '\\') {
      this.handleEscapeChar(ch)
    }
    else if (ch === '"') {
      this.handleQuote(ch)
    }
    else if (!this.inQuotes && ch === '(') {
      this.handleOpenParen(ch)
    }
    else if (!this.inQuotes && ch === ')') {
      this.handleCloseParen(ch)
    }
    else if (!this.inQuotes && this.parenDepth === 0 && /\s/.test(ch)) {
      this.handleWhitespace()
    }
    else {
      this.handleDefault(ch)
    }
  }

  handleEscaped(ch) {
    this.current += ch
    this.escape = false
  }

  handleEscapeChar(ch) {
    this.current += ch
    this.escape = true
  }

  handleQuote(ch) {
    this.current += ch
    this.inQuotes = !this.inQuotes
  }

  handleOpenParen(ch) {
    this.current += ch
    this.parenDepth++
  }

  handleCloseParen(ch) {
    this.current += ch
    this.parenDepth--
  }

  handleWhitespace() {
    this.flush()
  }

  handleDefault(ch) {
    this.current += ch
  }
}

/**
 * Split a Lucene query on top-level whitespace while keeping quoted phrases
 * and parenthesised groups (including their trailing `~N` modifier) as
 * single tokens. Handles backslash escapes inside both.
 */
function tokenize(query) {
  return new QueryTokenizer(query).tokenize()
}

/**
 * Find the index of the first occurrence of a character in a string that is
 * not preceded by an unescaped backslash escape sequence.
 */
function findUnescapedChar(str, char) {
  let escape = false
  for (let i = 0; i < str.length; i++) {
    if (escape) {
      escape = false
      continue
    }
    if (str[i] === '\\') {
      escape = true
      continue
    }
    if (str[i] === char) {
      return i
    }
  }
  return -1
}

/**
 * Attempt to extract field restrictions from the query wrapper.
 * E.g., "tags:(Paris) OR content:(Paris)"
 * If the wrapper is symmetric (all fields share the exact same inner query),
 * returns the fields and the inner query. Otherwise, returns null fields and original query.
 */
function extractFieldRestrictions(query) {
  const remaining = String(query).trim()
  const fieldRestrictedRe = /^[\w.]+:\(.+\)( OR [\w.]+:\(.+\))*$/

  if (!fieldRestrictedRe.test(remaining)) {
    return { fields: null, innerQuery: remaining }
  }

  const branches = remaining.split(/ OR (?=[\w.]+:\()/)
  const fields = []
  let inner = null

  for (const branch of branches) {
    const m = branch.match(/^([\w.]+):\((.+)\)$/)
    if (!m) {
      return { fields: null, innerQuery: remaining }
    }
    // Asymmetric query protection: if different branches have different inner queries,
    // we cannot represent this in the modal settings, so bail out.
    if (inner !== null && inner !== m[2]) {
      return { fields: null, innerQuery: remaining }
    }
    fields.push(m[1])
    inner = inner ?? m[2]
  }

  return { fields, innerQuery: inner }
}

function tryParseProximity(token, form) {
  const m = token.match(/^"(.+)"~(\d+)$/)
  if (!m) return false
  form.proximityPhrase = unescapePhrase(m[1])
  form.proximityDistance = Number(m[2]) || 1
  return true
}

function tryParseFuzzy(token, form) {
  const m = token.match(/^([^"\s]+)~(\d+)$/)
  if (!m) return false
  form.fuzzyTerm = unescapeTerm(m[1])
  form.fuzzyDistance = Number(m[2]) || 1
  return true
}

function tryParseExactPhrase(token, exactPhrases) {
  const m = token.match(/^"(.+)"$/)
  if (!m) return false
  exactPhrases.push(unescapePhrase(m[1]))
  return true
}

function tryParseOrGroup(token, anyWords) {
  const m = token.match(/^\((.+)\)$/)
  if (!m) return false
  const inner = tokenize(m[1])
  for (const w of inner) anyWords.push(unescapeTerm(w))
  return true
}

function tryParseAllWords(token, allWords) {
  if (token.startsWith('+') && token.length > 1) {
    allWords.push(unescapeTerm(token.slice(1)))
    return true
  }
  return false
}

function tryParseNoneWords(token, noneWords) {
  if (token.startsWith('-') && token.length > 1) {
    noneWords.push(unescapeTerm(token.slice(1)))
    return true
  }
  return false
}

function tryParseSingleWildcard(token, form) {
  const idx = findUnescapedChar(token, '?')
  if (idx !== -1 && findUnescapedChar(token, '*') === -1) {
    const start = token.slice(0, idx)
    const end = token.slice(idx + 1)
    form.singleWildcardStart = unescapeTerm(start)
    form.singleWildcardEnd = unescapeTerm(end)
    return true
  }
  return false
}

function tryParseMultiWildcard(token, form) {
  const idx = findUnescapedChar(token, '*')
  if (idx !== -1 && findUnescapedChar(token, '?') === -1) {
    const start = token.slice(0, idx)
    const end = token.slice(idx + 1)
    form.multiWildcardStart = unescapeTerm(start)
    form.multiWildcardEnd = unescapeTerm(end)
    return true
  }
  return false
}

/**
 * Parse a Lucene query string back into the advanced-search form shape.
 *
 * Only patterns produced by `generateLuceneQuery` are recognised verbatim;
 * anything else falls into `anyWords` as plain text so the user can still
 * edit it instead of starting from scratch. The mapping is intentionally
 * round-trip safe for the queries this modal emits.
 *
 * @param {string} query
 * @returns {Object} A form-shaped object compatible with `getInitialForm`.
 */
export function parseLuceneQuery(query) {
  const form = emptyForm()
  if (!query || !String(query).trim()) return form

  const { fields, innerQuery } = extractFieldRestrictions(query)
  if (fields) {
    form.fieldAll = false
    form.selectedFields = fields
  }

  const tokens = tokenize(innerQuery)

  const anyWords = []
  const allWords = []
  const noneWords = []
  const exactPhrases = []
  // Plain words mixed into the OR bucket are appended last so positional
  // order is preserved across a round-trip.
  const fallbackAnyWords = []

  for (const token of tokens) {
    if (tryParseProximity(token, form)) continue
    if (tryParseFuzzy(token, form)) continue
    if (tryParseExactPhrase(token, exactPhrases)) continue
    if (tryParseOrGroup(token, anyWords)) continue
    if (tryParseAllWords(token, allWords)) continue
    if (tryParseNoneWords(token, noneWords)) continue
    if (tryParseSingleWildcard(token, form)) continue
    if (tryParseMultiWildcard(token, form)) continue

    // Plain word — drop it in the OR bucket so it stays editable.
    fallbackAnyWords.push(unescapeTerm(token))
  }

  form.anyWords = [...anyWords, ...fallbackAnyWords].join(' ')
  form.allWords = allWords.join(' ')
  form.noneWords = noneWords.join(' ')
  // The form only carries one phrase; surplus phrases survive as plain
  // text in the OR field so nothing is silently dropped.
  if (exactPhrases.length > 0) {
    form.exactPhrase = exactPhrases[0]
    if (exactPhrases.length > 1) {
      const extras = exactPhrases.slice(1).map(p => `"${p}"`).join(' ')
      form.anyWords = form.anyWords ? `${form.anyWords} ${extras}` : extras
    }
  }

  return form
}
