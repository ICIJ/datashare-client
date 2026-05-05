import { describe, it, expect } from 'vitest'
import { useAdvancedSearchQuery } from '@/composables/useAdvancedSearchQuery'

describe('useAdvancedSearchQuery', () => {
  const { generateQuery } = useAdvancedSearchQuery()

  describe('generateQuery', () => {
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

    it('should not add fuzzy distance when it is 0', () => {
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
      expect(query).toBe('Mercedes')
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

    it('should not add proximity distance when it is 0', () => {
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
      expect(query).toBe('"Donald and Mercedes"')
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
})
