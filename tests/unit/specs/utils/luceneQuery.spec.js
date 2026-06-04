import { describe, it, expect } from 'vitest'
import { generateLuceneQuery as generateQuery, parseLuceneQuery, toQueryShape } from '@/utils/luceneQuery'

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

    it('should apply field restriction when specific fields are selected', () => {
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
        fieldAll: false,
        selectedFields: ['content', 'path']
      }

      const query = generateQuery(formData)
      expect(query).toBe('content:(Paris) OR path:(Paris)')
    })

    it('preserves +/- operators inside the field restriction wrapper', () => {
      // `field:(+a -b)` is interpreted by Lucene as "must have a, must
      // not have b in field" — the wrapper does not strip operator
      // semantics. Pin that down so future refactors don't regress it.
      const formData = {
        anyWords: [],
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
        fieldAll: false,
        selectedFields: ['content']
      }

      const query = generateQuery(formData)
      expect(query).toBe('content:(+France -spam)')
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
      expect(f.fieldAll).toBe(true)
      expect(f.selectedFields).toEqual([])
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

    it('parses field-restricted queries into selectedFields + inner query', () => {
      const f = parseLuceneQuery('tags:(Paris) OR content:(Paris)')
      expect(f.fieldAll).toBe(false)
      expect(f.selectedFields).toEqual(['tags', 'content'])
      expect(f.anyWords).toBe('Paris')
    })

    it('parses field-restricted dotted ES field paths', () => {
      const f = parseLuceneQuery('metadata.tika_metadata_dc_creator:(Paris)')
      expect(f.selectedFields).toEqual(['metadata.tika_metadata_dc_creator'])
    })

    it('bails out to anyWords if a field-restricted query has asymmetric inner queries', () => {
      const f = parseLuceneQuery('tags:(Paris) OR content:(London)')
      expect(f.fieldAll).toBe(true)
      expect(f.selectedFields).toEqual([])
      expect(f.anyWords).toBe('tags:(Paris) OR content:(London)')
    })

    it('keeps a query it cannot recognise in anyWords so the user can still edit it', () => {
      const f = parseLuceneQuery('weirdField:value AND other:value')
      // Falls through to plain-text tokens — at minimum nothing is lost.
      expect(f.anyWords.length).toBeGreaterThan(0)
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

    it('round-trips a field-restricted query', () => {
      const initial = {
        anyWords: 'Paris',
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
        fieldAll: false,
        selectedFields: ['tags', 'content']
      }
      const query = generateQuery(toQueryShape(initial))
      const round = parseLuceneQuery(query)
      expect(round.fieldAll).toBe(false)
      expect(round.selectedFields).toEqual(['tags', 'content'])
      expect(round.anyWords).toBe('Paris')
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
})
