import FilterContentTypeCategory from '@/store/filters/FilterContentTypeCategory'
import DisplayContentTypeCategory from '@/components/Display/DisplayContentTypeCategory'

describe('FilterContentTypeCategory.js', () => {
  describe('hidden flag', () => {
    it('defaults to false when not provided', () => {
      const filter = new FilterContentTypeCategory({ name: 'contentTypeCategory', key: 'contentTypeCategory' })
      expect(filter.hidden).toBe(false)
    })

    it('is stored when provided', () => {
      const filter = new FilterContentTypeCategory({
        name: 'contentTypeCategory',
        key: 'contentTypeCategory',
        hidden: true
      })
      expect(filter.hidden).toBe(true)
    })
  })

  describe('itemLabel', () => {
    const filter = new FilterContentTypeCategory({ name: 'contentTypeCategory', key: 'contentTypeCategory' })

    it('resolves the human-readable label for a known category', () => {
      expect(filter.itemLabel({ key: 'AUDIO' })).toBe('Audio')
    })

    it('falls back to the raw key for unknown categories', () => {
      expect(filter.itemLabel({ key: 'UNKNOWN' })).toBe('UNKNOWN')
    })
  })

  describe('keyAliases', () => {
    const filter = new FilterContentTypeCategory({ name: 'contentTypeCategory', key: 'contentTypeCategory' })

    it('matches a category key from a lowercased label fragment', () => {
      const aliases = filter.keyAliases('audi')
      expect(aliases).toContain('AUDIO')
    })

    it('returns no matches when the query matches nothing', () => {
      const aliases = filter.keyAliases('zzz')
      expect(aliases).toHaveLength(0)
    })
  })

  describe('static display', () => {
    it('exposes DisplayContentTypeCategory for breadcrumb rendering', () => {
      expect(FilterContentTypeCategory.display).toBe(DisplayContentTypeCategory)
    })
  })
})
