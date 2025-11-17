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
