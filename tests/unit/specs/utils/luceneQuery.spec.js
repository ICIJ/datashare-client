import { describe, it, expect } from 'vitest'
import { generateLuceneQuery as generateQuery, parseLuceneQuery, queriesEquivalent, toQueryShape } from '@/utils/luceneQuery'

describe('luceneQuery', () => {
  describe('generateLuceneQuery', () => {
    it('should generate empty query for empty form', () => {
      const formData = {
        anyWords: [],
        allWords: [],
        exactPhrase: [],
        noneWords: [],
        singleWildcardStart: '',
        singleWildcardEnd: '',
        multiWildcardStart: '',
        multiWildcardEnd: '',
        fuzzyTerm: '',
        fuzzyDistance: 0,
        proximityPhrase: '',
        proximityDistance: 0,
        fieldAll: true,
        selectedFields: []
      }

      const query = generateQuery(formData)
      expect(query).toBe('')
    })

    it('should generate OR query for any of these words', () => {
      const formData = {
        anyWords: ['Paris', 'London'],
        allWords: [],
        exactPhrase: [],
        noneWords: [],
        singleWildcardStart: '',
        singleWildcardEnd: '',
        multiWildcardStart: '',
        multiWildcardEnd: '',
        fuzzyTerm: '',
        fuzzyDistance: 0,
        proximityPhrase: '',
        proximityDistance: 0,
        fieldAll: true,
        selectedFields: []
      }

      const query = generateQuery(formData)
      expect(query).toBe('(Paris London)')
    })

    it('should generate AND query for all these words', () => {
      const formData = {
        anyWords: [],
        allWords: ['Paris', 'Donald', 'Mercedes'],
        exactPhrase: [],
        noneWords: [],
        singleWildcardStart: '',
        singleWildcardEnd: '',
        multiWildcardStart: '',
        multiWildcardEnd: '',
        fuzzyTerm: '',
        fuzzyDistance: 0,
        proximityPhrase: '',
        proximityDistance: 0,
        fieldAll: true,
        selectedFields: []
      }

      const query = generateQuery(formData)
      expect(query).toBe('+Paris +Donald +Mercedes')
    })

    it('should generate exact phrase query', () => {
      const formData = {
        anyWords: [],
        allWords: [],
        exactPhrase: ['Société SAS', 'Paris France'],
        noneWords: [],
        singleWildcardStart: '',
        singleWildcardEnd: '',
        multiWildcardStart: '',
        multiWildcardEnd: '',
        fuzzyTerm: '',
        fuzzyDistance: 0,
        proximityPhrase: '',
        proximityDistance: 0,
        fieldAll: true,
        selectedFields: []
      }

      const query = generateQuery(formData)
      expect(query).toBe('"Société SAS" "Paris France"')
    })

    it('should generate NOT query for none of these words', () => {
      const formData = {
        anyWords: [],
        allWords: [],
        exactPhrase: [],
        noneWords: ['spam', 'junk'],
        singleWildcardStart: '',
        singleWildcardEnd: '',
        multiWildcardStart: '',
        multiWildcardEnd: '',
        fuzzyTerm: '',
        fuzzyDistance: 0,
        proximityPhrase: '',
        proximityDistance: 0,
        fieldAll: true,
        selectedFields: []
      }

      const query = generateQuery(formData)
      expect(query).toBe('-spam -junk')
    })

    it('should generate single character wildcard query', () => {
      const formData = {
        anyWords: [],
        allWords: [],
        exactPhrase: [],
        noneWords: [],
        singleWildcardStart: 'Merced',
        singleWildcardEnd: 's',
        multiWildcardStart: '',
        multiWildcardEnd: '',
        fuzzyTerm: '',
        fuzzyDistance: 0,
        proximityPhrase: '',
        proximityDistance: 0,
        fieldAll: true,
        selectedFields: []
      }

      const query = generateQuery(formData)
      expect(query).toBe('Merced?s')
    })

    it('should generate multiple character wildcard query', () => {
      const formData = {
        anyWords: [],
        allWords: [],
        exactPhrase: [],
        noneWords: [],
        singleWildcardStart: '',
        singleWildcardEnd: '',
        multiWildcardStart: 'Mer',
        multiWildcardEnd: 'es',
        fuzzyTerm: '',
        fuzzyDistance: 0,
        proximityPhrase: '',
        proximityDistance: 0,
        fieldAll: true,
        selectedFields: []
      }

      const query = generateQuery(formData)
      expect(query).toBe('Mer*es')
    })

    it('should generate fuzzy search query', () => {
      const formData = {
        anyWords: [],
        allWords: [],
        exactPhrase: [],
        noneWords: [],
        singleWildcardStart: '',
        singleWildcardEnd: '',
        multiWildcardStart: '',
        multiWildcardEnd: '',
        fuzzyTerm: 'Mercedes',
        fuzzyDistance: 1,
        proximityPhrase: '',
        proximityDistance: 0,
        fieldAll: true,
        selectedFields: []
      }

      const query = generateQuery(formData)
      expect(query).toBe('Mercedes~1')
    })

    it('should ignore the fuzzy term when distance is 0', () => {
      const formData = {
        anyWords: [],
        allWords: [],
        exactPhrase: [],
        noneWords: [],
        singleWildcardStart: '',
        singleWildcardEnd: '',
        multiWildcardStart: '',
        multiWildcardEnd: '',
        fuzzyTerm: 'Mercedes',
        fuzzyDistance: 0,
        proximityPhrase: '',
        proximityDistance: 0,
        fieldAll: true,
        selectedFields: []
      }

      const query = generateQuery(formData)
      expect(query).toBe('')
    })

    it('should generate proximity search query', () => {
      const formData = {
        anyWords: [],
        allWords: [],
        exactPhrase: [],
        noneWords: [],
        singleWildcardStart: '',
        singleWildcardEnd: '',
        multiWildcardStart: '',
        multiWildcardEnd: '',
        fuzzyTerm: '',
        fuzzyDistance: 0,
        proximityPhrase: 'Donald and Mercedes are in Paris',
        proximityDistance: 2,
        fieldAll: true,
        selectedFields: []
      }

      const query = generateQuery(formData)
      expect(query).toBe('"Donald and Mercedes are in Paris"~2')
    })

    it('should ignore the proximity phrase when distance is 0', () => {
      const formData = {
        anyWords: [],
        allWords: [],
        exactPhrase: [],
        noneWords: [],
        singleWildcardStart: '',
        singleWildcardEnd: '',
        multiWildcardStart: '',
        multiWildcardEnd: '',
        fuzzyTerm: '',
        fuzzyDistance: 0,
        proximityPhrase: 'Donald and Mercedes',
        proximityDistance: 0,
        fieldAll: true,
        selectedFields: []
      }

      const query = generateQuery(formData)
      expect(query).toBe('')
    })

    it('should combine multiple query types', () => {
      const formData = {
        anyWords: ['Paris', 'London'],
        allWords: ['France'],
        exactPhrase: [],
        noneWords: ['spam'],
        singleWildcardStart: '',
        singleWildcardEnd: '',
        multiWildcardStart: '',
        multiWildcardEnd: '',
        fuzzyTerm: '',
        fuzzyDistance: 0,
        proximityPhrase: '',
        proximityDistance: 0,
        fieldAll: true,
        selectedFields: []
      }

      const query = generateQuery(formData)
      expect(query).toBe('(Paris London) +France -spam')
    })

    it('never bakes the field into the query — scoping is applied via the store field', () => {
      // The selected field sets the search store's `field`; it is no longer
      // wrapped into the query string (`content:(Paris)`).
      const formData = {
        anyWords: ['Paris'],
        allWords: [],
        exactPhrase: [],
        noneWords: [],
        singleWildcardStart: '',
        singleWildcardEnd: '',
        multiWildcardStart: '',
        multiWildcardEnd: '',
        fuzzyTerm: '',
        fuzzyDistance: 0,
        proximityPhrase: '',
        proximityDistance: 0,
        field: 'content'
      }

      const query = generateQuery(formData)
      expect(query).toBe('Paris')
    })

    it('should not apply field restriction when all fields is selected', () => {
      const formData = {
        anyWords: ['Paris'],
        allWords: [],
        exactPhrase: [],
        noneWords: [],
        singleWildcardStart: '',
        singleWildcardEnd: '',
        multiWildcardStart: '',
        multiWildcardEnd: '',
        fuzzyTerm: '',
        fuzzyDistance: 0,
        proximityPhrase: '',
        proximityDistance: 0,
        fieldAll: true,
        selectedFields: []
      }

      const query = generateQuery(formData)
      expect(query).toBe('Paris')
    })

    it('should handle complex query with all features', () => {
      const formData = {
        anyWords: ['Paris', 'London'],
        allWords: ['France'],
        exactPhrase: ['United Kingdom'],
        noneWords: ['spam'],
        singleWildcardStart: 'Merced',
        singleWildcardEnd: 's',
        multiWildcardStart: '',
        multiWildcardEnd: '',
        fuzzyTerm: 'Mercedes',
        fuzzyDistance: 1,
        proximityPhrase: '',
        proximityDistance: 0,
        fieldAll: true,
        selectedFields: []
      }

      const query = generateQuery(formData)
      expect(query).toBe('(Paris London) +France "United Kingdom" -spam Merced?s Mercedes~1')
    })

    it('generates a single-sided single-char wildcard (suffix)', () => {
      const formData = {
        anyWords: [],
        allWords: [],
        exactPhrase: [],
        noneWords: [],
        singleWildcardStart: 'Merced',
        singleWildcardEnd: '',
        multiWildcardStart: '',
        multiWildcardEnd: '',
        fuzzyTerm: '',
        fuzzyDistance: 0,
        proximityPhrase: '',
        proximityDistance: 0,
        fieldAll: true,
        selectedFields: []
      }

      const query = generateQuery(formData)
      expect(query).toBe('Merced?')
    })

    it('generates a single-sided multi-char wildcard (prefix)', () => {
      const formData = {
        anyWords: [],
        allWords: [],
        exactPhrase: [],
        noneWords: [],
        singleWildcardStart: '',
        singleWildcardEnd: '',
        multiWildcardStart: '',
        multiWildcardEnd: 'es',
        fuzzyTerm: '',
        fuzzyDistance: 0,
        proximityPhrase: '',
        proximityDistance: 0,
        fieldAll: true,
        selectedFields: []
      }

      const query = generateQuery(formData)
      expect(query).toBe('*es')
    })

    it('escapes Lucene operators in word inputs', () => {
      const formData = {
        anyWords: ['foo:bar', 'baz(qux)'],
        allWords: ['+a'],
        exactPhrase: [],
        noneWords: ['-b'],
        singleWildcardStart: '',
        singleWildcardEnd: '',
        multiWildcardStart: '',
        multiWildcardEnd: '',
        fuzzyTerm: '',
        fuzzyDistance: 0,
        proximityPhrase: '',
        proximityDistance: 0,
        fieldAll: true,
        selectedFields: []
      }

      const query = generateQuery(formData)
      expect(query).toBe('(foo\\:bar baz\\(qux\\)) +\\+a -\\-b')
    })

    it('escapes embedded quotes in exact phrase', () => {
      const formData = {
        anyWords: [],
        allWords: [],
        exactPhrase: ['He said "hi"'],
        noneWords: [],
        singleWildcardStart: '',
        singleWildcardEnd: '',
        multiWildcardStart: '',
        multiWildcardEnd: '',
        fuzzyTerm: '',
        fuzzyDistance: 0,
        proximityPhrase: '',
        proximityDistance: 0,
        fieldAll: true,
        selectedFields: []
      }

      const query = generateQuery(formData)
      expect(query).toBe('"He said \\"hi\\""')
    })

    it('should handle single word in anyWords without parentheses', () => {
      const formData = {
        anyWords: ['Paris'],
        allWords: [],
        exactPhrase: [],
        noneWords: [],
        singleWildcardStart: '',
        singleWildcardEnd: '',
        multiWildcardStart: '',
        multiWildcardEnd: '',
        fuzzyTerm: '',
        fuzzyDistance: 0,
        proximityPhrase: '',
        proximityDistance: 0,
        fieldAll: true,
        selectedFields: []
      }

      const query = generateQuery(formData)
      expect(query).toBe('Paris')
    })
  })

  describe('parseLuceneQuery', () => {
    it('returns an empty form for empty input', () => {
      const f = parseLuceneQuery('')
      expect(f.anyWords).toBe('')
      expect(f.allWords).toBe('')
      expect(f.exactPhrase).toBe('')
      expect(f.noneWords).toBe('')
      expect(f.fuzzyTerm).toBe('')
      expect(f.proximityPhrase).toBe('')
      expect(f.fuzzyDistance).toBe(1)
      expect(f.proximityDistance).toBe(1)
      expect(f.field).toBe('all')
    })

    it('returns an empty form for null / whitespace input', () => {
      expect(parseLuceneQuery(null).anyWords).toBe('')
      expect(parseLuceneQuery('   ').anyWords).toBe('')
    })

    it('parses a single bare word into anyWords', () => {
      expect(parseLuceneQuery('Paris').anyWords).toBe('Paris')
    })

    it('parses a parenthesised OR group into anyWords', () => {
      expect(parseLuceneQuery('(Paris London)').anyWords).toBe('Paris London')
    })

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

    it('returns null for a field-restricted query (no longer representable)', () => {
      // The form scopes via the store `field`, not in the query string, so a
      // field-restricted query cannot be faithfully edited and blanks the modal.
      expect(parseLuceneQuery('content:(Paris AND London)')).toBeNull()
    })

    it('treats a query that is only a boolean operator as empty', () => {
      // A lone operator has no operands to route, so the form opens blank.
      const f = parseLuceneQuery('AND')
      expect(f).not.toBeNull()
      expect(f.anyWords).toBe('')
      expect(f.allWords).toBe('')
    })

    it('parses `+word +word` into allWords', () => {
      const f = parseLuceneQuery('+Paris +London')
      expect(f.allWords).toBe('Paris London')
      expect(f.anyWords).toBe('')
    })

    it('parses `-word -word` into noneWords', () => {
      const f = parseLuceneQuery('-Paris -London')
      expect(f.noneWords).toBe('Paris London')
    })

    it('parses a quoted phrase into exactPhrase', () => {
      expect(parseLuceneQuery('"Société SAS"').exactPhrase).toBe('Société SAS')
    })

    it('parses `term~N` into fuzzy', () => {
      const f = parseLuceneQuery('Mercedes~2')
      expect(f.fuzzyTerm).toBe('Mercedes')
      expect(f.fuzzyDistance).toBe(2)
    })

    it('parses `"phrase"~N` into proximity', () => {
      const f = parseLuceneQuery('"John and Mercedes"~3')
      expect(f.proximityPhrase).toBe('John and Mercedes')
      expect(f.proximityDistance).toBe(3)
    })

    it('parses single-character wildcard `a?b`', () => {
      const f = parseLuceneQuery('Mer?es')
      expect(f.singleWildcardStart).toBe('Mer')
      expect(f.singleWildcardEnd).toBe('es')
    })

    it('parses multi-character wildcard `a*b`', () => {
      const f = parseLuceneQuery('Mer*es')
      expect(f.multiWildcardStart).toBe('Mer')
      expect(f.multiWildcardEnd).toBe('es')
    })

    it('does not parse escaped wildcard characters as wildcards', () => {
      const f = parseLuceneQuery('abc\\?def')
      expect(f.singleWildcardStart).toBe('')
      expect(f.singleWildcardEnd).toBe('')
      expect(f.anyWords).toBe('abc?def')
    })

    it('does not parse escaped asterisk characters as wildcards', () => {
      const f = parseLuceneQuery('abc\\*def')
      expect(f.multiWildcardStart).toBe('')
      expect(f.multiWildcardEnd).toBe('')
      expect(f.anyWords).toBe('abc*def')
    })

    it('parses a wildcard following an escaped backslash', () => {
      const f = parseLuceneQuery('abc\\\\?def')
      expect(f.singleWildcardStart).toBe('abc\\')
      expect(f.singleWildcardEnd).toBe('def')
    })

    it('returns null for a multi-field-restricted query (no longer representable)', () => {
      expect(parseLuceneQuery('tags:(Paris) OR content:(Paris)')).toBeNull()
    })

    it('returns null for a dotted-ES-field-restricted query (no longer representable)', () => {
      expect(parseLuceneQuery('metadata.tika_metadata_dc_creator:(Paris)')).toBeNull()
    })

    it('returns null if a field-restricted query has asymmetric inner queries', () => {
      // The form cannot hold a different inner query per field; editing a
      // mangled version would silently drop one of the branches.
      expect(parseLuceneQuery('tags:(Paris) OR content:(London)')).toBeNull()
    })

    it('returns null for a query it cannot faithfully represent', () => {
      // Re-submitting these as escaped plain words would change their
      // meaning, so the modal must open blank instead.
      expect(parseLuceneQuery('weirdField:value AND other:value')).toBeNull()
    })

    it('round-trips a representative full form through generate → parse', () => {
      const initial = {
        anyWords: 'Paris London',
        allWords: 'Macron Emmanuel',
        exactPhrase: 'Société SAS',
        noneWords: 'Jo',
        singleWildcardStart: 'Mer',
        singleWildcardEnd: 'es',
        multiWildcardStart: '',
        multiWildcardEnd: '',
        fuzzyTerm: 'Mercedes',
        fuzzyDistance: 2,
        proximityPhrase: 'John and Mercedes are in Paris',
        proximityDistance: 3,
        fieldAll: true,
        selectedFields: []
      }
      const query = generateQuery(toQueryShape(initial))
      const round = parseLuceneQuery(query)
      expect(round.anyWords).toBe('Paris London')
      expect(round.allWords).toBe('Macron Emmanuel')
      expect(round.exactPhrase).toBe('Société SAS')
      expect(round.noneWords).toBe('Jo')
      expect(round.singleWildcardStart).toBe('Mer')
      expect(round.singleWildcardEnd).toBe('es')
      expect(round.fuzzyTerm).toBe('Mercedes')
      expect(round.fuzzyDistance).toBe(2)
      expect(round.proximityPhrase).toBe('John and Mercedes are in Paris')
      expect(round.proximityDistance).toBe(3)
    })

    it('pre-populates a group beside a loose word into anyWords', () => {
      const f = parseLuceneQuery('(a b) c')
      expect(f).not.toBeNull()
      expect(f.anyWords).toBe('a b c')
    })

    it('routes an explicit OR group beside a loose word into anyWords', () => {
      const f = parseLuceneQuery('(red OR blue) sky')
      expect(f).not.toBeNull()
      expect(f.anyWords).toBe('red blue sky')
    })

    it('routes a boolean operator inside a group instead of capturing it as a word', () => {
      const f = parseLuceneQuery('(a AND b)')
      expect(f).not.toBeNull()
      expect(f.allWords).toBe('a b')
      expect(f.anyWords).toBe('')
    })

    it('parses a comma-bearing term without delimiter collisions', () => {
      const f = parseLuceneQuery('Smith,John')
      expect(f).not.toBeNull()
      expect(f.anyWords).toBe('Smith,John')
    })

    it('unescapes Lucene-reserved characters round-trip', () => {
      const initial = {
        anyWords: 'foo:bar',
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
      const query = generateQuery(toQueryShape(initial))
      // Generator escapes the colon: `foo\:bar`
      expect(query).toContain('\\:')
      const round = parseLuceneQuery(query)
      expect(round.anyWords).toBe('foo:bar')
    })
  })

  describe('parseLuceneQuery non-representable queries', () => {
    it('returns null for a query the shared lucene grammar rejects', () => {
      // The search bar, breadcrumb and store all read `q` through the
      // `lucene` package; a query it cannot parse is not representable.
      expect(parseLuceneQuery('"unclosed')).toBeNull()
      expect(parseLuceneQuery('(unclosed')).toBeNull()
      expect(parseLuceneQuery(')stray(')).toBeNull()
    })

    it('returns null for a field:value query', () => {
      // Escaping the colon on re-submit would turn the field search into
      // a literal-text search.
      expect(parseLuceneQuery('content:cat')).toBeNull()
    })

    it('returns null for mixed AND/OR operators it cannot represent', () => {
      // The flat form has no place for operator precedence, so a query that
      // mixes AND and OR must open the modal blank rather than be rewritten.
      expect(parseLuceneQuery('a AND b OR c')).toBeNull()
      expect(parseLuceneQuery('(Paris OR Lyon) AND France')).toBeNull()
    })

    it('returns null for a range query', () => {
      expect(parseLuceneQuery('date:[2020 TO 2021]')).toBeNull()
    })

    it('returns null when a second fuzzy clause would be dropped', () => {
      expect(parseLuceneQuery('roam~2 jakarta~1')).toBeNull()
    })

    it('returns null when a second proximity clause would be dropped', () => {
      expect(parseLuceneQuery('"a b"~3 "c d"~5')).toBeNull()
    })

    it('returns null when a second wildcard clause would be dropped', () => {
      expect(parseLuceneQuery('a* b*')).toBeNull()
      expect(parseLuceneQuery('wom?n m?n')).toBeNull()
    })

    it('returns null when a second exact phrase would be dropped', () => {
      expect(parseLuceneQuery('"Paris match" "Société SAS"')).toBeNull()
    })

    it('returns null for a bare wildcard query', () => {
      // `*` regenerates to an empty query — the match-all would be lost.
      expect(parseLuceneQuery('*')).toBeNull()
      expect(parseLuceneQuery('?')).toBeNull()
    })

    it('returns null for a token with several wildcards', () => {
      // Only the first `?` fits the form; the second would be re-escaped
      // into a literal on submit.
      expect(parseLuceneQuery('a?b?c')).toBeNull()
      expect(parseLuceneQuery('a?b*c')).toBeNull()
    })

    it('returns null for a zero distance', () => {
      // Distance 0 cannot be represented: the slider has no 0 and `~0` is
      // not equivalent to the smallest slider value.
      expect(parseLuceneQuery('foo~0')).toBeNull()
      expect(parseLuceneQuery('"a b"~0')).toBeNull()
    })

    it('preserves out-of-range distances instead of blanking', () => {
      // Above the slider max the value is kept verbatim (the slider widens to
      // show it) so the modal still represents the query.
      const fuzzy = parseLuceneQuery('foo~3')
      expect(fuzzy).not.toBeNull()
      expect(fuzzy.fuzzyTerm).toBe('foo')
      expect(fuzzy.fuzzyDistance).toBe(3)

      const proximity = parseLuceneQuery('"a b"~7')
      expect(proximity).not.toBeNull()
      expect(proximity.proximityPhrase).toBe('a b')
      expect(proximity.proximityDistance).toBe(7)
    })

    it('returns null for any field restriction, offered field or not', () => {
      // In-query field scoping is no longer representable; the field is set on
      // the store instead, so every `field:(…)` query blanks the modal.
      expect(parseLuceneQuery('author:(Paris)')).toBeNull()
      expect(parseLuceneQuery('tags:(Paris)')).toBeNull()
    })

    it('parses a long crafted field-restricted query without pathological backtracking', () => {
      // Regression guard: the previous wrapper-detection regex had nested
      // quantifiers and froze the main thread on this exact shape.
      const query = 'f:(x)' + ' OR f:(x)'.repeat(40) + ' zzzz'
      expect(parseLuceneQuery(query)).toBeNull()
    })
  })

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
      ['tags:(Paris) OR content:(Paris)', 'tags:(Paris) OR content:(Paris)'],
      ['(a b) c', '(a b c)'],
      ['(red OR blue) sky', '(red blue sky)']
    ])('treats %s and %s as equivalent', (a, b) => {
      expect(queriesEquivalent(a, b)).toBe(true)
    })

    it.each([
      ['(pierre OR jean) AND romera', '(pierre jean) +romera'],
      ['a AND b OR c', '+a +b (c)'],
      ['a OR b AND c', '(a b) +c'],
      ['a AND b', 'a OR b'],
      ['roam~2 jakarta~1', 'jakarta~1'],
      ['"a b"~3 "c d"~5', '"c d"~5'],
      ['-a', 'a'],
      ['+a', 'a'],
      ['(-a)', '(a)'],
      ['a^2', 'a'],
      // The canonical leaf must keep every meaning-bearing attribute, so a
      // range, a regex, or a differing range bound never collapses onto a
      // plain term (the serializer used to drop these).
      ['[1 TO 5]', '[2 TO 9]'],
      ['[1 TO 5]', '{1 TO 5}'],
      ['/foo/', 'foo'],
      ['content:[1 TO 5]', 'content:foo']
    ])('treats %s and %s as NOT equivalent', (a, b) => {
      expect(queriesEquivalent(a, b)).toBe(false)
    })

    it('returns false when either side is unparseable', () => {
      expect(queriesEquivalent('(unclosed', 'a')).toBe(false)
      expect(queriesEquivalent('a', ')stray(')).toBe(false)
    })
  })
})
