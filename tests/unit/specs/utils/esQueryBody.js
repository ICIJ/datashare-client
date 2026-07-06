// Shared recursive inspectors for compiled Elasticsearch query bodies, used by
// the filter and search specs that assert on paired-dimension query shapes.
// Kept in one place so the OR-combine detection logic cannot drift between
// suites.

const stripKeyword = field => field.replace(/\.keyword$/, '')

/**
 * Locate the US-001 cross-dimension OR-combine: a `bool.should` that mixes
 * `terms` clauses on two or more *distinct* base fields (with any `.keyword`
 * sub-field folded onto its base). A `should` carrying only several field
 * variants of a single dimension (e.g. contentTypeCategory +
 * contentTypeCategory.keyword) is a legitimate include clause, not the
 * OR-combine, so it is intentionally not matched.
 * @param {object} node - Any node of the compiled query body.
 * @returns {object|null} The matching `bool` node, or null.
 */
export function findBoolShould(node) {
  if (!node || typeof node !== 'object') {
    return null
  }
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findBoolShould(child)
      if (found) return found
    }
    return null
  }
  if (node.bool && Array.isArray(node.bool.should)) {
    const baseFields = new Set(
      node.bool.should
        .filter(clause => clause.terms)
        .map(clause => stripKeyword(Object.keys(clause.terms)[0]))
    )
    if (baseFields.size > 1) {
      return node.bool
    }
  }
  for (const value of Object.values(node)) {
    const found = findBoolShould(value)
    if (found) return found
  }
  return null
}

/**
 * Return the values of the first `terms` clause on `field` found anywhere in
 * the body, or null.
 * @param {object} node - Any node of the compiled query body.
 * @param {string} field - Exact field name to match.
 * @returns {string[]|null} The clause values, or null.
 */
export function findTermsClause(node, field) {
  if (!node || typeof node !== 'object') {
    return null
  }
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findTermsClause(child, field)
      if (found) return found
    }
    return null
  }
  if (node.terms && Object.prototype.hasOwnProperty.call(node.terms, field)) {
    return node.terms[field]
  }
  for (const value of Object.values(node)) {
    const found = findTermsClause(value, field)
    if (found) return found
  }
  return null
}

/**
 * Return the values of a `terms` clause on `field` sitting under any
 * `bool.must_not`, whether the clause is a direct child or nested inside a
 * `should` (as multi-field excludes are), or null.
 * @param {object} node - Any node of the compiled query body.
 * @param {string} field - Exact field name to match.
 * @returns {string[]|null} The excluded values, or null.
 */
export function findMustNotForField(node, field) {
  if (!node || typeof node !== 'object') {
    return null
  }
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findMustNotForField(child, field)
      if (found) return found
    }
    return null
  }
  if (node.bool && node.bool.must_not) {
    const found = findTermsClause(node.bool.must_not, field)
    if (found) return found
  }
  for (const value of Object.values(node)) {
    const found = findMustNotForField(value, field)
    if (found) return found
  }
  return null
}
