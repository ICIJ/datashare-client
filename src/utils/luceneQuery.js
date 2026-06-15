import lucene from 'lucene'

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
 * Lucene boolean occurrence kinds. AND/`+` compile to MUST, OR/default to
 * SHOULD, NOT/`-` to MUST_NOT — the same model Lucene itself uses, which lets
 * `a AND b` and `+a +b` canonicalise to the same thing.
 */
const MUST = 'must'
const SHOULD = 'should'
const MUST_NOT = 'must_not'

// Operators that combine clauses conjunctively (the others are disjunctive).
const AND_FAMILY = new Set(['AND', 'AND NOT'])

function operatorFamily(operator) {
  return AND_FAMILY.has(operator) ? 'AND' : 'OR'
}

function operatorOccur(operator, side) {
  switch (operator) {
    case 'AND': return MUST
    case 'OR': return SHOULD
    case 'AND NOT': return side === 'right' ? MUST_NOT : MUST
    case 'OR NOT': return side === 'right' ? MUST_NOT : SHOULD
    case 'NOT': return side === 'right' ? MUST_NOT : SHOULD
    default: return SHOULD // <implicit> (default operator)
  }
}

/**
 * A clause's occurrence comes from its own `+`/`-` prefix when present,
 * otherwise from the operator that joins it to the chain.
 */
function clauseOccur(node, operator, side) {
  if (node && node.prefix === '+') return MUST
  if (node && node.prefix === '-') return MUST_NOT
  return operatorOccur(operator, side)
}

const isBinaryNode = node => Boolean(node && node.left && node.right)
const isParenthesised = node => Boolean(node && node.parenthesized === true)

/**
 * Turn a `lucene` AST node into a canonical tree of occurrence-tagged
 * clauses. A right-leaning chain of the *same* operator family is linearised
 * into one flat clause list (so `a AND b AND c` and `+a +b +c` match), while a
 * parenthesised group or an operator-family change stays an atomic nested
 * clause (so `(a OR b) AND c` does NOT collapse into `(a b) +c`).
 */
function buildCanonical(node, inheritedField = null) {
  if (!node) return null
  const field = node.field && node.field !== '<implicit>' ? node.field : inheritedField

  if (node.start === 'NOT' && node.left && !node.right) {
    return { bool: [{ occur: MUST_NOT, node: buildCanonical(node.left, field) }] }
  }

  if (isBinaryNode(node)) {
    const family = operatorFamily(node.operator)
    const clauses = [{ occur: clauseOccur(node.left, node.operator, 'left'), node: buildCanonical(node.left, field) }]
    let current = node
    while (true) {
      const right = current.right
      if (isBinaryNode(right) && !isParenthesised(right) && operatorFamily(right.operator) === family) {
        clauses.push({ occur: clauseOccur(right.left, current.operator, 'right'), node: buildCanonical(right.left, field) })
        current = right
        continue
      }
      clauses.push({ occur: clauseOccur(right, current.operator, 'right'), node: buildCanonical(right, field) })
      break
    }
    return { bool: clauses }
  }

  // Field-only wrapper node (e.g. the outer node of `content:(a AND b)`).
  if (node.left && !node.right) return buildCanonical(node.left, field)

  const leaf = {
    leaf: {
      field: field || '*',
      term: node.term ?? '',
      quoted: Boolean(node.quoted),
      similarity: node.similarity ?? null,
      proximity: node.proximity ?? null,
      boost: node.boost ?? null
    }
  }
  // A `+`/`-` prefix on a bare term carries its occurrence. Inside an operator
  // chain `clauseOccur` already consumes it, but a top-level `-a` or a sole
  // `(-a)` has no surrounding clause, so wrap it here. `flattenCanonical`
  // collapses the wrapper back out when the prefix matches the parent
  // occurrence, so `+a +b` still canonicalises identically to `a AND b`.
  if (node.prefix === '+') return { bool: [{ occur: MUST, node: leaf }] }
  if (node.prefix === '-') return { bool: [{ occur: MUST_NOT, node: leaf }] }
  return leaf
}

/**
 * Collapse a nested clause into its parent when the subgroup's members all
 * share the clause's own occurrence — associativity makes such a group
 * transparent (`(a OR b)` inside an OR, a `+a +b` wrapper under MUST). A group
 * whose occurrence differs from its members (e.g. a SHOULD group required by
 * an AND) stays nested, so `(a OR b) AND c` does NOT collapse into `(a b) +c`.
 */
function flattenCanonical(node) {
  if (!node || node.leaf) return node
  const clauses = []
  for (const clause of node.bool) {
    const child = flattenCanonical(clause.node)
    if (child && child.bool && child.bool.every(childClause => childClause.occur === clause.occur)) {
      clauses.push(...child.bool)
    }
    else {
      clauses.push({ occur: clause.occur, node: child })
    }
  }
  return { bool: clauses }
}

/**
 * Serialise a canonical tree to a string with sibling clauses sorted, so two
 * queries that differ only in operand order serialise identically.
 */
function serializeCanonical(node) {
  if (!node) return 'nil'
  if (node.leaf) {
    const leaf = node.leaf
    const term = leaf.quoted ? `"${leaf.term}"` : leaf.term
    return `L:${JSON.stringify(leaf.field)}:${JSON.stringify(term)}:s${leaf.similarity}:p${leaf.proximity}:b${leaf.boost}`
  }
  return `B(${node.bool.map(clause => `${clause.occur}:${serializeCanonical(clause.node)}`).sort().join(',')})`
}

function normalizeQuery(query) {
  return serializeCanonical(flattenCanonical(buildCanonical(lucene.parse(query))))
}

/**
 * True when two Lucene query strings are semantically equivalent under the
 * advanced-search form's representable shape. Used by `parseLuceneQuery` to
 * verify a regenerated query still means what the user typed. Bias is to blank
 * on any doubt: an unparseable side or a thrown error counts as not equivalent.
 */
export function queriesEquivalent(a, b) {
  try {
    return normalizeQuery(a) === normalizeQuery(b)
  }
  catch {
    return false
  }
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
 * Maximum edit distance for fuzzy search. Lucene caps fuzzy similarity at
 * two character changes; the modal's distance slider and the parser's
 * fidelity check share this bound.
 */
export const FUZZY_DISTANCE_MAX = 2

/**
 * Maximum word distance for proximity search, shared by the modal's
 * distance slider and the parser's fidelity check.
 */
export const PROXIMITY_DISTANCE_MAX = 6

/**
 * Default advanced-search form shape. Word inputs hold strings (whitespace
 * splitting is deferred to submit time), distances default to 1 — distance
 * 0 is the disabled state and the slider's `min` enforces that floor.
 */
export function getInitialForm() {
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
 * Convert the form's string-typed word inputs into the array shape
 * `generateLuceneQuery` expects. Splits on whitespace for word lists
 * and keeps the exact phrase as a single quoted entry.
 */
export function toQueryShape(f) {
  const words = s => s.trim().split(/\s+/).filter(Boolean)
  return {
    ...f,
    anyWords: words(f.anyWords),
    allWords: words(f.allWords),
    noneWords: words(f.noneWords),
    exactPhrase: f.exactPhrase.trim() ? [f.exactPhrase.trim()] : []
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

/**
 * The rest of the app (search bar, breadcrumb, search store) reads `q`
 * through the `lucene` package's grammar. A query that grammar rejects
 * (unbalanced quotes or parentheses, stray operators…) cannot be claimed
 * representable by the form either, so it is screened out before our own
 * pattern matching runs.
 */
function isParseableLuceneQuery(query) {
  try {
    lucene.parse(query)
    return true
  }
  catch {
    return false
  }
}

/**
 * A raw (still-escaped) term is representable in the form only when
 * unescaping then re-escaping it reproduces the original token — i.e. it
 * is escaped exactly the way `generateLuceneQuery` would emit it. Anything
 * else (an unescaped `:`, `[`, `(`, `~`…) carries Lucene syntax the form
 * cannot hold without changing its meaning on re-submit.
 */
function isFaithfulTerm(raw) {
  return escapeTerm(unescapeTerm(raw)) === raw
}

/**
 * Same fidelity rule as `isFaithfulTerm`, but with the laxer quoted-phrase
 * escaping (only `"` and `\` are escaped inside quotes).
 */
function isFaithfulPhrase(raw) {
  return escapePhrase(unescapePhrase(raw)) === raw
}

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
 * Boolean keywords that act as separators between operands rather than as
 * searchable words. These are the single tokens the whitespace tokenizer
 * emits, so this list is distinct from `AND_FAMILY` above: that one classifies
 * the multi-word operators the `lucene` AST reports (`AND NOT`, `OR NOT`) and
 * belongs to the canonical-AST layer, whereas this one belongs to the
 * token-routing layer.
 */
const BOOLEAN_OPERATORS = new Set(['AND', 'OR', 'NOT'])

/**
 * Split a top-level token list into operands and per-operand bucket hints
 * derived from the boolean operators between them:
 * - an operand reached through `NOT` → `none`
 * - an operand reached through `AND` (and the operand before it) → `all`
 * - everything else → `any`
 *
 * The hint only steers plain words; structural tokens (groups, phrases,
 * wildcards, `+`/`-` terms) keep their intrinsic bucket. Mixed-operator
 * queries produce a best-effort routing that the round-trip equivalence check
 * in `parseLuceneQuery` rejects, so over-eager hints can never silently
 * rewrite a query.
 */
function routeBooleanOperators(tokens) {
  const operands = []
  const opsBefore = []
  let pending = []
  for (const token of tokens) {
    if (BOOLEAN_OPERATORS.has(token)) {
      pending.push(token)
      continue
    }
    operands.push(token)
    opsBefore.push(pending)
    pending = []
  }

  const hints = operands.map(() => 'any')
  for (let i = 0; i < operands.length; i++) {
    const ops = opsBefore[i]
    if (ops.includes('NOT')) {
      hints[i] = 'none'
    }
    else if (ops.includes('AND')) {
      hints[i] = 'all'
    }
    // The left operand of an AND also belongs in `all`, unless a stronger
    // hint (none/all) already claimed it.
    if (ops.includes('AND') && i > 0 && hints[i - 1] === 'any') {
      hints[i - 1] = 'all'
    }
  }

  return { operands, hints }
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
 *
 * The split + per-branch match below is the sole validator — a dedicated
 * "does this look field-restricted" regex would need nested quantifiers
 * and is susceptible to catastrophic backtracking on crafted input. When
 * the query is not field-restricted at all, the single resulting "branch"
 * fails the per-branch match and we bail out with the query unchanged.
 *
 * If the wrapper is symmetric (all branches share the exact same inner
 * query) and every field is allowed, returns the fields and the inner
 * query. Otherwise, returns null fields and the original query.
 */
function extractFieldRestrictions(query, allowedFields = null) {
  const remaining = String(query).trim()
  const branches = remaining.split(/ OR (?=[\w.]+:\()/)
  const fields = []
  let inner = null

  for (const branch of branches) {
    const m = branch.match(/^([\w.]+):\((.+)\)$/)
    if (!m) {
      return { fields: null, innerQuery: remaining }
    }
    // Asymmetric query protection: if different branches have different
    // inner queries, we cannot represent this in the modal settings, so
    // bail out.
    if (inner !== null && inner !== m[2]) {
      return { fields: null, innerQuery: remaining }
    }
    // Unknown field protection: a restriction to a field the modal does
    // not offer would be invisible in the checkbox group, so bail out and
    // let the fidelity checks below reject the query as a whole.
    if (allowedFields && !allowedFields.includes(m[1])) {
      return { fields: null, innerQuery: remaining }
    }
    fields.push(m[1])
    inner = inner ?? m[2]
  }

  return { fields, innerQuery: inner }
}

function tryParseProximity(token, ctx) {
  const m = token.match(/^"(.+)"~(\d+)$/)
  if (!m) {
    return false
  }
  const distance = Number(m[2])
  // The form has a single proximity slot and a bounded slider: a second
  // clause or an out-of-range distance cannot be represented.
  if (ctx.form.proximityPhrase || !isFaithfulPhrase(m[1]) || distance < 1 || distance > PROXIMITY_DISTANCE_MAX) {
    ctx.lossy = true
  }
  ctx.form.proximityPhrase = unescapePhrase(m[1])
  ctx.form.proximityDistance = distance || 1
  return true
}

function tryParseFuzzy(token, ctx) {
  const m = token.match(/^([^"\s]+)~(\d+)$/)
  if (!m) {
    return false
  }
  const distance = Number(m[2])
  // Same single-slot and bounded-slider rules as proximity.
  if (ctx.form.fuzzyTerm || !isFaithfulTerm(m[1]) || distance < 1 || distance > FUZZY_DISTANCE_MAX) {
    ctx.lossy = true
  }
  ctx.form.fuzzyTerm = unescapeTerm(m[1])
  ctx.form.fuzzyDistance = distance || 1
  return true
}

function tryParseExactPhrase(token, ctx) {
  const m = token.match(/^"(.+)"$/)
  if (!m) {
    return false
  }
  if (!isFaithfulPhrase(m[1])) {
    ctx.lossy = true
  }
  ctx.exactPhrases.push(unescapePhrase(m[1]))
  return true
}

function tryParseOrGroup(token, ctx) {
  const m = token.match(/^\((.+)\)$/)
  if (!m) {
    return false
  }
  // Route the group's contents like a top-level query so boolean operators
  // inside the group become bucket hints instead of literal words, and
  // structural tokens (phrases, nested groups) keep their intrinsic bucket.
  const { operands, hints } = routeBooleanOperators(tokenize(m[1]))
  operands.forEach((word, i) => parseToken(word, ctx, hints[i]))
  return true
}

function tryParseAllWords(token, ctx) {
  if (!token.startsWith('+') || token.length === 1) {
    return false
  }
  const raw = token.slice(1)
  if (!isFaithfulTerm(raw)) {
    ctx.lossy = true
  }
  ctx.allWords.push(unescapeTerm(raw))
  return true
}

function tryParseNoneWords(token, ctx) {
  if (!token.startsWith('-') || token.length === 1) {
    return false
  }
  const raw = token.slice(1)
  if (!isFaithfulTerm(raw)) {
    ctx.lossy = true
  }
  ctx.noneWords.push(unescapeTerm(raw))
  return true
}

/**
 * Shared by both wildcard parsers: split the token around its single
 * unescaped wildcard character and fill the matching form slot.
 */
function applyWildcard(token, idx, ctx, startKey, endKey) {
  const start = token.slice(0, idx)
  const end = token.slice(idx + 1)
  // A bare wildcard (no half at all) regenerates to an empty query, a
  // second clause has no slot left, and a half that is not faithfully
  // escaped (e.g. a second wildcard char in `a?b?c`) would be re-escaped
  // into a literal on submit. All three lose information.
  const slotTaken = ctx.form[startKey] || ctx.form[endKey]
  if (slotTaken || (!start && !end) || !isFaithfulTerm(start) || !isFaithfulTerm(end)) {
    ctx.lossy = true
  }
  ctx.form[startKey] = unescapeTerm(start)
  ctx.form[endKey] = unescapeTerm(end)
}

function tryParseSingleWildcard(token, ctx) {
  const idx = findUnescapedChar(token, '?')
  if (idx === -1 || findUnescapedChar(token, '*') !== -1) {
    return false
  }
  applyWildcard(token, idx, ctx, 'singleWildcardStart', 'singleWildcardEnd')
  return true
}

function tryParseMultiWildcard(token, ctx) {
  const idx = findUnescapedChar(token, '*')
  if (idx === -1 || findUnescapedChar(token, '?') !== -1) {
    return false
  }
  applyWildcard(token, idx, ctx, 'multiWildcardStart', 'multiWildcardEnd')
  return true
}

/**
 * Fallback for tokens no pattern recognised: a plain word. The bucket hint
 * (from `routeBooleanOperators`) decides whether it is an all/none/any word;
 * a term carrying unescaped Lucene syntax still makes the parse lossy.
 */
function parseFallbackWord(token, ctx, hint = 'any') {
  if (!isFaithfulTerm(token)) {
    ctx.lossy = true
  }
  const word = unescapeTerm(token)
  if (hint === 'all') {
    ctx.allWords.push(word)
  }
  else if (hint === 'none') {
    ctx.noneWords.push(word)
  }
  else {
    ctx.fallbackAnyWords.push(word)
  }
}

/**
 * Recognised token patterns, tried in order. The first parser to match
 * consumes the token.
 */
const TOKEN_PARSERS = Object.freeze([
  tryParseProximity,
  tryParseFuzzy,
  tryParseExactPhrase,
  tryParseOrGroup,
  tryParseAllWords,
  tryParseNoneWords,
  tryParseSingleWildcard,
  tryParseMultiWildcard
])

function parseToken(token, ctx, hint = 'any') {
  for (const tryParse of TOKEN_PARSERS) {
    if (tryParse(token, ctx)) {
      return
    }
  }
  parseFallbackWord(token, ctx, hint)
}

/**
 * Flush the accumulated word buckets into the form's string inputs. Plain
 * words mixed into the OR bucket are appended after group words so the
 * generated query keeps them in one group.
 */
function applyWordBuckets(ctx) {
  ctx.form.anyWords = [...ctx.anyWords, ...ctx.fallbackAnyWords].join(' ')
  ctx.form.allWords = ctx.allWords.join(' ')
  ctx.form.noneWords = ctx.noneWords.join(' ')
  // The form carries a single exact phrase; a surplus one cannot be moved
  // to the OR words without breaking it apart on submit (the words input
  // splits on whitespace), so it makes the parse lossy instead.
  if (ctx.exactPhrases.length > 0) {
    ctx.form.exactPhrase = ctx.exactPhrases[0]
    if (ctx.exactPhrases.length > 1) {
      ctx.lossy = true
    }
  }
}

/**
 * Parse a Lucene query string back into the advanced-search form shape.
 *
 * Flat boolean queries map onto the form's any/all/none buckets (`a AND b`,
 * `a OR b`, `a AND NOT c`). When any part of the query cannot be represented
 * by the form without changing its meaning on re-submit — malformed syntax,
 * field syntax, boolean precedence the flat form cannot hold (mixed AND/OR,
 * grouped sub-expressions), ranges, a second fuzzy/proximity/wildcard clause,
 * an out-of-range distance, a restriction to an unknown field — the function
 * returns `null` so callers can skip pre-population instead of silently
 * rewriting the user's query. Faithfulness is enforced by regenerating the
 * query from the filled form and checking it stays equivalent to the input.
 *
 * @param {string} query
 * @param {Object} [options]
 * @param {string[]|null} [options.fields] - Allowed values for field
 *   restrictions. When omitted, any `[\w.]+` field name is accepted.
 * @returns {Object|null} A form-shaped object compatible with
 *   `getInitialForm`, or `null` when the query is not representable.
 */
export function parseLuceneQuery(query, { fields: allowedFields = null } = {}) {
  const form = getInitialForm()
  if (!query || !String(query).trim()) {
    return form
  }

  if (!isParseableLuceneQuery(query)) {
    return null
  }

  const { fields, innerQuery } = extractFieldRestrictions(query, allowedFields)
  if (fields) {
    form.fieldAll = false
    form.selectedFields = fields
  }

  const ctx = {
    form,
    lossy: false,
    anyWords: [],
    allWords: [],
    noneWords: [],
    exactPhrases: [],
    fallbackAnyWords: []
  }

  const { operands, hints } = routeBooleanOperators(tokenize(innerQuery))
  operands.forEach((token, i) => parseToken(token, ctx, hints[i]))

  applyWordBuckets(ctx)

  if (ctx.lossy) {
    return null
  }

  // Faithfulness gate: the form is only a valid representation of the query if
  // regenerating it reproduces an equivalent query. This is what lets the
  // operator routing above be liberal — anything it gets wrong (mixed
  // operators, grouping the flat form can't hold) fails to round-trip and
  // blanks the modal instead of silently rewriting the user's query.
  //
  // By design there are two views of a query here: the token-routing
  // extraction that fills the form, and the canonical-AST model
  // (`buildCanonical`) used only to compare meaning. They are deliberately
  // kept separate — the extraction stays simple and the gate is the single
  // authority on "are these the same query". The cost is that operator
  // semantics live in both layers; the gate makes any drift fail safe (blank),
  // never unsafe (rewrite).
  const regenerated = generateLuceneQuery(toQueryShape(form))
  if (!queriesEquivalent(query, regenerated)) {
    return null
  }

  return form
}
