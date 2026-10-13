# Reflect boolean-operator queries in the advanced search modal

**Date:** 2026-06-15
**Branch:** `feat/enable-advanced-search-toggle`
**Status:** Approved design — ready for implementation plan

## Problem

When a search query in the search bar reflects into the advanced search
modal, plain queries pre-fill the form but any query containing a boolean
operator blanks every field.

- `pierre romera` → modal's "Any of these words" = `pierre romera` ✓
- `pierre AND romera` → modal fields all empty ✗

### Root cause

The modal pre-fills by calling `parseLuceneQuery(initialQuery, { fields })`
(`SearchAdvancedModal.vue:221`). That parser walks the query token by token
and, in `parseFallbackWord` (`luceneQuery.js:499`), marks the parse **lossy**
whenever it meets a bare `AND`, `OR`, or `NOT`:

```js
if (LUCENE_BOOLEAN_OPERATORS.includes(token) || !isFaithfulTerm(token)) {
  ctx.lossy = true
}
```

A lossy parse returns `null`, and `populateFromInitialQuery` then skips
pre-filling, leaving the form blank. This was a deliberate guard: the form's
flat *any / all / none* buckets cannot represent every boolean query, so the
original code chose to blank rather than silently rewrite the user's query on
re-submit. The guard is simply too broad — it rejects boolean queries that
*are* representable.

## Goal

Reflect boolean-operator queries into the form whenever the query reduces to
the form's shape, while preserving the hard guarantee that an unrepresentable
query never gets silently rewritten (it still blanks the form).

## Non-goals

- Changing the form shape, `generateLuceneQuery`, `toQueryShape`, or the
  `SearchAdvancedModal` component's behavior/contract.
- Supporting queries that genuinely cannot live in the flat form (mixed
  `AND`/`OR`, an OR-group AND-ed with a required term, multiple
  fuzzy/proximity/wildcard/phrase clauses). These continue to blank.
- Changing how the search bar or search store build or interpret `q`.

## The flat-form constraint

The form only has:

- `anyWords` — OR list
- `allWords` — AND list (generated with `+` prefix)
- `noneWords` — NOT list (generated with `-` prefix)
- `exactPhrase` — a single phrase
- one single-char wildcard pair, one multi-char wildcard pair
- one `fuzzyTerm` + distance, one `proximityPhrase` + distance
- field restrictions applied to the **whole** query

So "full boolean parsing" means: parse the entire query structurally, fill the
form when the query reduces to this shape, and blank only when it genuinely
cannot. Example of unrepresentable: `(pierre OR jean) AND romera` — the form
would generate `(pierre jean) +romera`, meaning "*romera* required, *pierre*
/*jean* optional", which is **not** the same query.

## Architecture

All changes live in `src/utils/luceneQuery.js`. The public contract is
preserved:

```
parseLuceneQuery(query, { fields }) → formObject | null
```

`null` continues to mean "cannot faithfully represent — leave the form blank".
Only the set of queries that return a non-null form expands. No consumer
changes.

### Why the AST cannot be the value extractor

The `lucene` package mis-parses fuzzy edit-distances. Proximity is fine
(`"x y"~3` → `{ quoted: true, proximity: 3 }`), but `foo~2` parses to
`{ term: "foo", similarity: 0.5 }` plus a **stray sibling term `"2"`** — the
integer distance the form needs (`fuzzyDistance` 1 or 2) is unrecoverable from
the AST. This is exactly why the original author hand-rolled the token scanner
with `/^([^"\s]+)~(\d+)$/`. Therefore the token scanner stays as the value
extractor; the AST is used only for the equivalence check below, where the
deterministic mis-parse cancels out (it is identical on both sides).

### Parse pipeline (extends the token scanner)

The `QueryTokenizer` and `TOKEN_PARSERS` chain are **kept** as the value
extractor and **extended** with operator routing. The per-token `lossy`
heuristics in `parseFallbackWord` are **replaced** by the round-trip
faithfulness check.

1. **Grammar gate** *(kept)* — `lucene.parse(query)`; on throw return `null`.
2. **Operator-aware tokenization** — top-level tokens are scanned left to
   right; the boolean keywords `AND` / `OR` / `NOT` / `AND NOT` become
   *separators* that set the `occur` of the operands around them rather than
   being treated as fallback words:
   - default operand (no operator, or `OR`) → routed as an *any* word
     (`anyWords`)
   - operand joined by `AND` → routed as an *all* word (`allWords`)
   - operand preceded by `NOT` / `AND NOT`, or carrying a `-` prefix → routed
     as a *none* word (`noneWords`)
   - operand carrying a `+` prefix → *all* word (existing `tryParseAllWords`)
   Each operand (operator keywords stripped) is still run through the existing
   per-token parsers (proximity, fuzzy, exact phrase, OR-group, wildcard) so
   fuzzy distance, wildcards, and phrases are extracted by the regexes that
   already work.
3. **Field restrictions** *(kept)* — `extractFieldRestrictions` runs first; a
   uniform single field set across the whole query → `selectedFields` +
   `fieldAll = false`.
4. **Faithfulness check (the guarantee)** — regenerate with
   `generateLuceneQuery(toQueryShape(form))`, then compare the original query
   against the regenerated one by normalizing **both** through `lucene.parse`
   into a canonical clause set and checking structural equivalence. Equal →
   return the form. Mismatch → return `null`.

### The equivalence comparison

`normalizeAst(ast)` reduces a parsed query to an order-independent canonical
clause set so that the comparison ignores cosmetic differences but catches
semantic ones. It must:

- flatten nested same-operator binary nodes into a flat clause list;
- derive each clause's `occur` from **both** the operator and the term prefix,
  so that `a AND b` (`operator: "AND"`) and `+a +b` (`prefix: "+"`,
  `operator: "<implicit>"`) normalize to the **same** MUST clauses;
- sort operands within commutative AND/OR groups so operand order does not
  matter;
- carry the raw `~N` substring through unchanged — the fuzzy mis-parse is
  identical on both sides, so it cancels out.

### Why the round-trip check carries the design

"Representable" becomes *defined by what the form's own generator can
reproduce*, not by hand-enumerated rules. Step 2 can therefore be liberal;
correctness falls out of the comparison. The round-trip also subsumes today's
special-case guards for free:

- a second fuzzy / proximity / wildcard / phrase clause,
- mixed `AND`/`OR`,
- an OR-group AND-ed with a required term,

all fail to regenerate equivalently and yield `null` with no bespoke code.

**Bias the comparison to blank on any doubt.** Over-blanking only costs
coverage; under-blanking silently rewrites the user's query, which must never
happen.

## Behavior after the change

| Input query | Result |
|---|---|
| `pierre AND romera` | All = `pierre romera` |
| `pierre OR romera` | Any = `pierre romera` |
| `a AND b AND NOT c` | All = `a b`, None = `c` |
| `content:(a AND b)` | fields = `[content]`, All = `a b` |
| `pierre romera` | Any = `pierre romera` (unchanged) |
| `(pierre OR jean) AND romera` | blank (unrepresentable) |
| `a AND b OR c` | blank (mixed operators) |

## Testing (TDD)

Build on `tests/unit/specs/utils/luceneQuery.spec.js`.

- **Flip** `returns null for boolean operators` (line ~678) → now expects the
  form to be populated; add per-operator mapping assertions
  (`AND` → all, `OR` → any, `AND NOT` → none).
- **Keep blanking** for genuinely unrepresentable shapes: add cases for mixed
  `AND`/`OR` and an OR-group AND-ed with a required term.
- **Extend** the round-trip property tests (line ~583) across operator forms
  so generate → parse → generate is stable.
- **Preserve** the existing still-`null` cases (range queries, second
  fuzzy/proximity/wildcard/phrase, unknown field, grammar-rejected input).
- **Component**: one `SearchAdvancedModal` test — opening with
  `initialQuery = "pierre AND romera"` fills the All-words field.

## Risks

- **Default-operator assumption.** Bare `a b` maps to *should/OR*, matching
  today's behavior. If the Elasticsearch backend is configured with an
  AND-default operator, the generated `(a b)` differs semantically — but that
  is pre-existing behavior, not introduced by this change.
- **`normalizeAst` correctness.** The comparator must canonicalize operand
  order and operator encoding (`+a +b` ≡ `a AND b`). This is the subtlest
  piece; heavy round-trip test coverage is the mitigation, and the
  blank-on-doubt bias keeps mistakes on the safe (over-blank) side.
- **AST encoding of `+`/`-`.** The `lucene` package encodes `+`/`-` as a
  `prefix` field alongside an `<implicit>` operator; `normalizeAst` must fold
  prefix and operator into a single `occur` so prefixed and keyword forms
  compare equal.
- **Fuzzy mis-parse.** The `lucene` package cannot recover fuzzy
  edit-distance; value extraction therefore stays on the token scanner, and
  the equivalence check relies on the mis-parse being deterministic and
  identical on both sides.
