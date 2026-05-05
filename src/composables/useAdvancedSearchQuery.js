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
 * Composable for generating Lucene query from advanced search form
 */
export function useAdvancedSearchQuery() {
  /**
   * Generate a Lucene query string from the advanced search form data
   * @param {Object} formData - The form data object
   * @returns {string} - The generated Lucene query
   */
  function generateQuery(formData) {
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

    // Fuzzy search (spelling changes)
    if (formData.fuzzyTerm && formData.fuzzyDistance > 0) {
      const fuzzyTerm = `${escapeTerm(formData.fuzzyTerm)}~${formData.fuzzyDistance}`
      parts.push(fuzzyTerm)
    }
    else if (formData.fuzzyTerm && formData.fuzzyDistance === 0) {
      parts.push(escapeTerm(formData.fuzzyTerm))
    }

    // Proximity search (phrase changes)
    if (formData.proximityPhrase && formData.proximityDistance > 0) {
      const proximityTerm = `"${escapePhrase(formData.proximityPhrase)}"~${formData.proximityDistance}`
      parts.push(proximityTerm)
    }
    else if (formData.proximityPhrase && formData.proximityDistance === 0) {
      parts.push(`"${escapePhrase(formData.proximityPhrase)}"`)
    }

    // Combine all parts
    let query = parts.join(' ')

    // Apply field restrictions if not searching all fields
    if (!formData.fieldAll && formData.selectedFields && formData.selectedFields.length > 0) {
      // If specific fields are selected, wrap the query with field restrictions
      const fieldQueries = formData.selectedFields.map((field) => {
        if (query) {
          return `${field}:(${query})`
        }
        return ''
      })
      query = fieldQueries.filter(q => q).join(' OR ')
    }

    return query.trim()
  }

  return {
    generateQuery
  }
}
