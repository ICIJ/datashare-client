# Advanced Search Boolean Operators Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the advanced-search modal reflect boolean-operator queries (`pierre AND romera`, `a OR b`, `a AND NOT c`) into its fields instead of opening blank, while never silently rewriting a query it cannot faithfully represent.

**Architecture:** All changes are in `src/utils/luceneQuery.js`. The existing token scanner keeps extracting leaf values (it correctly handles fuzzy distance, wildcards, phrases — the `lucene` package mis-parses `term~N`). Two things are added: (1) an **operator-routing pass** that turns infix `AND`/`OR`/`NOT` into per-word bucket hints, and (2) a **round-trip faithfulness gate** — regenerate the query from the filled form and compare it to the original via a canonical-AST equivalence check, returning `null` on mismatch. The public contract `parseLuceneQuery(query, { fields }) → formObject | null` is unchanged; only the set of queries that return a non-null form grows.

**Tech Stack:** JavaScript (ES modules), the `lucene` npm package (v2.1.1) for parsing, Vitest for tests, Vue 3 + `@vue/test-utils` for the component test.

**Spec:** `docs/superpowers/specs/2026-06-15-advanced-search-boolean-operators-design.md`

**Test commands:**
- Single util spec: `npx vitest --run tests/unit/specs/utils/luceneQuery.spec.js`
- Single component spec: `npx vitest --run tests/unit/specs/components/Search/SearchAdvancedModal/SearchAdvancedModal.spec.js`
- Full unit suite: `yarn test:unit`

---

## Background the implementer needs

`src/utils/luceneQuery.js` already contains:
- `generateLuceneQuery(formData)` — turns the form into a query string. Buckets compile to: `anyWords` → `(a b)` (one parenthesised group, unprefixed), `allWords` → `+a +b`, `noneWords` → `-a -b`, `exactPhrase` → `"…"`, wildcards/fuzzy/proximity → their tokens, and when specific fields are selected the whole query is wrapped as `field:(…) OR field:(…)`.
- `toQueryShape(form)` — splits the form's string inputs into the array shape `generateLuceneQuery` expects.
- `getInitialForm()` — the blank form object.
- `tokenize(query)` (via `class QueryTokenizer`) — splits on top-level whitespace, keeping quoted phrases and parenthesised groups (incl. trailing `~N`) as single tokens.
- `parseLuceneQuery(query, { fields })` — the function being changed. It currently:
  1. returns a blank form for empty input;
  2. returns `null` if `lucene.parse` throws (grammar gate);
  3. calls `extractFieldRestrictions` to peel a uniform `field:(…)` wrapper into `selectedFields`;
  4. tokenizes the inner query and runs each token through `TOKEN_PARSERS` then `parseFallbackWord`, accumulating into `ctx` buckets and setting `ctx.lossy = true` for anything it cannot faithfully hold;
  5. returns `null` when `ctx.lossy`, else the filled form.

The relevant lossy trigger to remove lives in `parseFallbackWord`:
```js
function parseFallbackWord(token, ctx) {
  if (LUCENE_BOOLEAN_OPERATORS.includes(token) || !isFaithfulTerm(token)) {
    ctx.lossy = true
  }
  ctx.fallbackAnyWords.push(unescapeTerm(token))
}
```
`LUCENE_BOOLEAN_OPERATORS` is `Object.freeze(['AND', 'OR', 'NOT'])` and is used *only* here.

**Why the AST cannot extract values:** `lucene.parse('foo~2')` returns `{ term: "foo", similarity: 0.5 }` plus a stray sibling term `"2"` — the integer fuzzy distance is lost. So the token scanner stays the value extractor. The AST is used *only* for the equivalence comparison, where the deterministic mis-parse is identical on both sides and cancels out.

---

## Task 1: Canonical-AST equivalence check

Add a pure `queriesEquivalent(a, b)` helper (plus its internals) that returns `true` when two Lucene query strings mean the same thing under the form's representable shape. This is the faithfulness gate's engine and is built and tested in isolation first.

**Files:**
- Modify: `src/utils/luceneQuery.js` (add helpers near the top, after the `escapePhrase` helpers and before `generateLuceneQuery`)
- Test: `tests/unit/specs/utils/luceneQuery.spec.js` (add a new `describe('queriesEquivalent', …)` block)

- [ ] **Step 1: Write the failing test**

Add this block inside the top-level `describe('luceneQuery', () => {` in `tests/unit/specs/utils/luceneQuery.spec.js` (e.g. just before the final closing `})` of that describe). Also add `queriesEquivalent` to the import at the top of the file. The existing import is:

```js
import { generateLuceneQuery as generateQuery, parseLuceneQuery, toQueryShape } from '@/utils/luceneQuery'
```

Change it to:

```js
import { generateLuceneQuery as generateQuery, parseLuceneQuery, queriesEquivalent, toQueryShape } from '@/utils/luceneQuery'
```

```js
  describe('queriesEquivalent', () => {
    it.each([
      ['pierre AND romera', '+pierre +romera'],
      ['pierre OR romera', '(pierre romera)'],
      ['pierre romera', '(pierre romera)'],
      ['a AND b AND c', '+a +b +c'],
      ['x OR y OR z', '(x y z)'],
      ['a AND b AND NOT c', '+a +b -c'],
      ['a AND NOT c', '+a -c'],
      ['Paris NOT London', 'Paris -London'],
      ['content:(a AND b)', 'content:(+a +b)'],
      ['Mercedes~2', 'Mercedes~2'],
      ['"John Mercedes"~3', '"John Mercedes"~3'],
      ['single', 'single'],
      ['tags:(Paris) OR content:(Paris)', 'tags:(Paris) OR content:(Paris)']
    ])('treats %s and %s as equivalent', (a, b) => {
      expect(queriesEquivalent(a, b)).toBe(true)
    })

    it.each([
      ['(pierre OR jean) AND romera', '(pierre jean) +romera'],
      ['a AND b OR c', '+a +b (c)'],
      ['a OR b AND c', '(a b) +c'],
      ['a AND b', 'a OR b'],
      ['roam~2 jakarta~1', 'jakarta~1'],
      ['"a b"~3 "c d"~5', '"c d"~5']
    ])('treats %s and %s as NOT equivalent', (a, b) => {
      expect(queriesEquivalent(a, b)).toBe(false)
    })

    it('returns false when either side is unparseable', () => {
      expect(queriesEquivalent('(unclosed', 'a')).toBe(false)
      expect(queriesEquivalent('a', ')stray(')).toBe(false)
    })
  })
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest --run tests/unit/specs/utils/luceneQuery.spec.js -t queriesEquivalent`
Expected: FAIL — `queriesEquivalent is not a function` (or import error).

- [ ] **Step 3: Implement the canonicalizer and `queriesEquivalent`**

Add the following to `src/utils/luceneQuery.js`, immediately after the `escapePhrase` function (around line 32) and before `generateLuceneQuery`. This code was validated against the full matrix above.

```js
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

  return {
    leaf: {
      field: field || '*',
      term: node.term ?? '',
      quoted: Boolean(node.quoted),
      similarity: node.similarity ?? null,
      proximity: node.proximity ?? null
    }
  }
}

/**
 * Serialise a canonical tree to a string with sibling clauses sorted, so two
 * queries that differ only in operand order serialise identically.
 */
function serializeCanonical(node) {
  if (!node) return 'nil'
  if (node.leaf) {
    const l = node.leaf
    return `L:${l.field}:${l.quoted ? `"${l.term}"` : l.term}:s${l.similarity}:p${l.proximity}`
  }
  return `B(${node.bool.map(c => `${c.occur}:${serializeCanonical(c.node)}`).sort().join(',')})`
}

function normalizeQuery(query) {
  return serializeCanonical(buildCanonical(lucene.parse(query)))
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest --run tests/unit/specs/utils/luceneQuery.spec.js -t queriesEquivalent`
Expected: PASS (all `it.each` rows green).

- [ ] **Step 5: Commit**

```bash
git add src/utils/luceneQuery.js tests/unit/specs/utils/luceneQuery.spec.js
git commit -m "feat(luceneQuery): add canonical-AST query equivalence check"
```

---

## Task 2: Operator routing + round-trip gate in `parseLuceneQuery`

Route infix `AND`/`OR`/`NOT` operands into the right buckets, and gate the whole parse behind `queriesEquivalent`. Done together so the test suite stays consistent: routing alone would make mixed queries populate wrongly, and the gate is what blanks them.

**Files:**
- Modify: `src/utils/luceneQuery.js`
- Test: `tests/unit/specs/utils/luceneQuery.spec.js`

- [ ] **Step 1: Write the failing tests (new boolean mappings + flip the old behaviour)**

In `tests/unit/specs/utils/luceneQuery.spec.js`, inside `describe('parseLuceneQuery', …)`, add:

```js
    it('parses `a AND b` into allWords', () => {
      const f = parseLuceneQuery('Paris AND London')
      expect(f.allWords).toBe('Paris London')
      expect(f.anyWords).toBe('')
    })

    it('parses `a OR b` into anyWords', () => {
      const f = parseLuceneQuery('Paris OR London')
      expect(f.anyWords).toBe('Paris London')
      expect(f.allWords).toBe('')
    })

    it('parses `a AND b AND NOT c` into allWords + noneWords', () => {
      const f = parseLuceneQuery('Paris AND London AND NOT Berlin')
      expect(f.allWords).toBe('Paris London')
      expect(f.noneWords).toBe('Berlin')
    })

    it('parses a field-restricted boolean query', () => {
      const f = parseLuceneQuery('content:(Paris AND London)')
      expect(f.fieldAll).toBe(false)
      expect(f.selectedFields).toEqual(['content'])
      expect(f.allWords).toBe('Paris London')
    })
```

Then, in `describe('parseLuceneQuery non-representable queries', …)`, **replace** the existing test:

```js
    it('returns null for boolean operators', () => {
      expect(parseLuceneQuery('Paris OR London')).toBeNull()
      expect(parseLuceneQuery('cat AND dog')).toBeNull()
      expect(parseLuceneQuery('Paris NOT London')).toBeNull()
    })
```

with:

```js
    it('returns null for mixed AND/OR operators it cannot represent', () => {
      // The flat form has no place for operator precedence, so a query that
      // mixes AND and OR must open the modal blank rather than be rewritten.
      expect(parseLuceneQuery('a AND b OR c')).toBeNull()
      expect(parseLuceneQuery('(Paris OR Lyon) AND France')).toBeNull()
    })
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest --run tests/unit/specs/utils/luceneQuery.spec.js`
Expected: the four new `parses …` tests FAIL (boolean operands currently land in `anyWords` as literal `AND`/`OR`/`NOT` words and the parse returns `null`), and the suite is red.

- [ ] **Step 3: Add the operator-routing helper**

In `src/utils/luceneQuery.js`, add this near the other token helpers (e.g. just after the `tokenize` function, around line 307):

```js
/**
 * Boolean keywords that act as separators between operands rather than as
 * searchable words.
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
    if (ops.includes('AND') && i > 0 && hints[i - 1] === 'any') {
      hints[i - 1] = 'all'
    }
  }

  return { operands, hints }
}
```

- [ ] **Step 4: Thread the hint through `parseToken` and `parseFallbackWord`**

In `src/utils/luceneQuery.js`, change `parseFallbackWord` to route by hint and drop the boolean-operator branch (operators no longer reach it):

```js
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
```

Change `parseToken` to accept and forward the hint:

```js
function parseToken(token, ctx, hint = 'any') {
  for (const tryParse of TOKEN_PARSERS) {
    if (tryParse(token, ctx)) {
      return
    }
  }
  parseFallbackWord(token, ctx, hint)
}
```

Delete the now-unused constant `LUCENE_BOOLEAN_OPERATORS` (the `Object.freeze(['AND', 'OR', 'NOT'])` declaration and its doc comment).

- [ ] **Step 5: Wire routing + the round-trip gate into `parseLuceneQuery`**

In `parseLuceneQuery`, replace the tokenisation loop:

```js
  for (const token of tokenize(innerQuery)) {
    parseToken(token, ctx)
  }

  applyWordBuckets(ctx)

  return ctx.lossy ? null : form
```

with:

```js
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
  const regenerated = generateLuceneQuery(toQueryShape(form))
  if (!queriesEquivalent(query, regenerated)) {
    return null
  }

  return form
```

Note: `generateLuceneQuery` and `toQueryShape` are already defined in this module, so no new imports are needed.

- [ ] **Step 6: Run the full util spec**

Run: `npx vitest --run tests/unit/specs/utils/luceneQuery.spec.js`
Expected: PASS — the four new `parses …` tests pass, the new mixed-operator null test passes, and **all pre-existing tests still pass** (the `generate → parse` round-trip tests, the field-restriction tests, and every `non-representable` case: `content:cat`, ranges, second fuzzy/proximity/wildcard/phrase, bare/multi wildcard, out-of-range distances, unknown field, and the backtracking guard).

If any pre-existing `non-representable` test regresses, the cause is almost certainly the round-trip gate accepting something the old per-token guards rejected — debug with `node` in the repo root: compare `normalizeQuery(original)` against `normalizeQuery(generateLuceneQuery(toQueryShape(parsed)))`. Do **not** weaken the gate to pass a test; if a genuinely unrepresentable query slips through, tighten `buildCanonical`/`serializeCanonical`.

- [ ] **Step 7: Commit**

```bash
git add src/utils/luceneQuery.js tests/unit/specs/utils/luceneQuery.spec.js
git commit -m "feat(luceneQuery): reflect AND/OR/NOT queries into the form via round-trip gate"
```

---

## Task 3: Component test — modal pre-populates from a boolean query

Prove the user-visible behaviour: opening the modal with a boolean `initialQuery` fills the fields.

**Files:**
- Test: `tests/unit/specs/components/Search/SearchAdvancedModal/SearchAdvancedModal.spec.js`

- [ ] **Step 1: Write the failing test**

Add this test inside `describe('SearchAdvancedModal.vue', …)`, right after the existing `pre-populates a field-restricted query into the right buckets` test (around line 129). It mirrors that test's mount pattern.

```js
  it('pre-populates an AND query into allWords', async () => {
    const wrapper = shallowMount(SearchAdvancedModal, {
      props: { modelValue: false, initialQuery: 'pierre AND romera' },
      global: { plugins, renderStubDefaultSlot: true }
    })
    await wrapper.setProps({ modelValue: true })
    await nextTick()
    expect(wrapper.vm.form.allWords).toBe('pierre romera')
    expect(wrapper.vm.form.anyWords).toBe('')
  })
```

- [ ] **Step 2: Run the test to verify it passes**

Run: `npx vitest --run tests/unit/specs/components/Search/SearchAdvancedModal/SearchAdvancedModal.spec.js -t "AND query"`
Expected: PASS — the modal wires `initialQuery` through `parseLuceneQuery`, which now populates `allWords`. (This is a confirmation test; it passes immediately on top of Task 2. If it fails, the component is not re-parsing on open — re-check `populateFromInitialQuery` is reached, not that the parser is wrong.)

- [ ] **Step 3: Run the whole suite**

Run: `yarn test:unit`
Expected: PASS — full unit suite green.

- [ ] **Step 4: Commit**

```bash
git add tests/unit/specs/components/Search/SearchAdvancedModal/SearchAdvancedModal.spec.js
git commit -m "test(SearchAdvancedModal): pre-populate from a boolean AND query"
```

---

## Self-review (completed during planning)

**Spec coverage:**
- Operator-aware tokenisation (spec §"Parse pipeline" step 2) → Task 2 Steps 3–4.
- Field restrictions kept (step 3) → unchanged `extractFieldRestrictions`, verified by Task 2 Step 1's field-restricted boolean test.
- Round-trip faithfulness check (step 4) → Task 2 Step 5.
- `normalizeAst` / equivalence (spec §"The equivalence comparison") → Task 1, with the four required properties (flatten same-operator chains, derive occur from operator+prefix, sort operands, carry `~N` through) realised by `buildCanonical`/`serializeCanonical` and proven by Task 1's match/no-match matrix.
- Behaviour table (`pierre AND romera`, `pierre OR romera`, `a AND b AND NOT c`, `content:(a AND b)`, mixed → blank) → Task 1 + Task 2 tests.
- Component pre-population → Task 3.

**Distance bounds (spec risk note):** the round-trip gate does *not* catch out-of-range distances — `foo~3` regenerates faithfully to `foo~3`, so it would compare equal. The existing bound checks in `tryParseFuzzy`/`tryParseProximity` (`distance < 1 || distance > MAX` → `ctx.lossy = true`) are therefore **kept as-is**; they still run before the gate, so the existing `returns null for out-of-range distances` test continues to pass. Do not remove them.

**Placeholder scan:** none — every code step shows the full code.

**Type consistency:** `queriesEquivalent`, `normalizeQuery`, `buildCanonical`, `serializeCanonical`, `routeBooleanOperators`, `parseToken(token, ctx, hint)`, `parseFallbackWord(token, ctx, hint)` are named identically across tasks. `ctx` buckets used by hint routing (`ctx.allWords`, `ctx.noneWords`, `ctx.fallbackAnyWords`) already exist in the current `ctx` object and are consumed by `applyWordBuckets`.
