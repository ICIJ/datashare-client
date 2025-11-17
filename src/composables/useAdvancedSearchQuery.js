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
      const orTerms = formData.anyWords.join(' ')
      if (formData.anyWords.length > 1) {
        parts.push(`(${orTerms})`)
      } else {
        parts.push(orTerms)
      }
    }

    // ALL these words (AND) - use + prefix
    if (formData.allWords && formData.allWords.length > 0) {
      const andTerms = formData.allWords.map((word) => `+${word}`).join(' ')
      parts.push(andTerms)
    }

    // Exact phrase - wrap in quotes
    if (formData.exactPhrase && formData.exactPhrase.length > 0) {
      formData.exactPhrase.forEach((phrase) => {
        parts.push(`"${phrase}"`)
      })
    }

    // NONE of these words (NOT) - use - prefix
    if (formData.noneWords && formData.noneWords.length > 0) {
      const notTerms = formData.noneWords.map((word) => `-${word}`).join(' ')
      parts.push(notTerms)
    }

    // Single character wildcard (?)
    if (formData.singleWildcardStart && formData.singleWildcardEnd) {
      const wildcardTerm = `${formData.singleWildcardStart}?${formData.singleWildcardEnd}`
      parts.push(wildcardTerm)
    }

    // Multiple character wildcard (*)
    if (formData.multiWildcardStart && formData.multiWildcardEnd) {
      const wildcardTerm = `${formData.multiWildcardStart}*${formData.multiWildcardEnd}`
      parts.push(wildcardTerm)
    }

    // Fuzzy search (spelling changes)
    if (formData.fuzzyTerm && formData.fuzzyDistance > 0) {
      const fuzzyTerm = `${formData.fuzzyTerm}~${formData.fuzzyDistance}`
      parts.push(fuzzyTerm)
    } else if (formData.fuzzyTerm && formData.fuzzyDistance === 0) {
      parts.push(formData.fuzzyTerm)
    }

    // Proximity search (phrase changes)
    if (formData.proximityPhrase && formData.proximityDistance > 0) {
      const proximityTerm = `"${formData.proximityPhrase}"~${formData.proximityDistance}`
      parts.push(proximityTerm)
    } else if (formData.proximityPhrase && formData.proximityDistance === 0) {
      parts.push(`"${formData.proximityPhrase}"`)
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
      query = fieldQueries.filter((q) => q).join(' OR ')
    }

    return query.trim()
  }

  return {
    generateQuery
  }
}
