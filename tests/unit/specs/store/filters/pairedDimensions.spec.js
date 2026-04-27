import {
  PAIRED_DIMENSIONS,
  getCanonicalDimension,
  getPairedDimension,
  getPairedDimensions
} from '@/store/filters/pairedDimensions'

describe('pairedDimensions', () => {
  describe('PAIRED_DIMENSIONS', () => {
    it('declares contentType paired with contentTypeCategory', () => {
      expect(PAIRED_DIMENSIONS.contentType).toBe('contentTypeCategory')
    })

    it('is frozen so downstream code cannot mutate the source of truth at runtime', () => {
      expect(Object.isFrozen(PAIRED_DIMENSIONS)).toBe(true)
    })
  })

  describe('getPairedDimension', () => {
    it('returns contentTypeCategory when given contentType', () => {
      expect(getPairedDimension('contentType')).toBe('contentTypeCategory')
    })

    it('returns contentType when given contentTypeCategory (reverse lookup)', () => {
      expect(getPairedDimension('contentTypeCategory')).toBe('contentType')
    })

    it('returns null for an unpaired name', () => {
      expect(getPairedDimension('language')).toBeNull()
    })

    it('returns null when the name is unknown', () => {
      expect(getPairedDimension('nope')).toBeNull()
    })

    it('returns null when the name is missing', () => {
      expect(getPairedDimension(undefined)).toBeNull()
    })
  })

  describe('getPairedDimensions', () => {
    it('returns both dimensions for a paired canonical name', () => {
      expect(getPairedDimensions('contentType')).toEqual(['contentType', 'contentTypeCategory'])
    })

    it('returns both dimensions for a paired non-canonical name', () => {
      expect(getPairedDimensions('contentTypeCategory')).toEqual(['contentTypeCategory', 'contentType'])
    })

    it('returns just the name for an unpaired filter so callers can iterate uniformly', () => {
      expect(getPairedDimensions('language')).toEqual(['language'])
    })
  })

  describe('getCanonicalDimension', () => {
    it('returns contentType for the paired contentType name', () => {
      expect(getCanonicalDimension('contentType')).toBe('contentType')
    })

    it('returns contentType for the paired contentTypeCategory name', () => {
      expect(getCanonicalDimension('contentTypeCategory')).toBe('contentType')
    })

    it('returns the name itself when the filter has no pair', () => {
      expect(getCanonicalDimension('language')).toBe('language')
    })
  })

  describe('iteration contract for query-builder consumers', () => {
    it('exposes both sides via getPairedDimensions so the ES query builder can iterate without hard-coding names', () => {
      // The Elasticsearch query builder relies on this to OR-combine paired
      // dimensions generically — both sides must be reachable from either name.
      Object.entries(PAIRED_DIMENSIONS).forEach(([canonical, paired]) => {
        expect(getPairedDimensions(canonical)).toEqual([canonical, paired])
        expect(getPairedDimensions(paired)).toEqual([paired, canonical])
      })
    })
  })
})
